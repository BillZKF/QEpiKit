
describe("A Belief Desire Intent Agent", function() {

  beforeEach(function() {
    environment = {
      vaccineCache: 3500000,
      vaccineUsed: 0,
      schoolsOpen: true,
      awareness: 1,
      incidence: 100
    };
    eventQueue = {
      0: function(environment) {
        environment.incidence *= 1.02;
        if (environment.schoolsOpen) {
          environment.incidence *= 1.02;
        }
      },
      5: function(environment) {
        environment.incidence *= 1.045;
        if (environment.schoolsOpen) {
          environment.incidence *= 1.1;
        }
      },
      7: function(environment) {
        environment.incidence *= 1.07;
        if (environment.schoolsOpen) {
          environment.incidence *= 1.2;
        }
      }
    };
    goals = [{
      temporal: QEpiKit.Utils.always,
      condition: {
        label: "vaccine cache is always greater than 2mil",
        data: environment,
        key: "vaccineCache",
        value: 2e7,
        check: QEpiKit.Utils.gt
      }
    },{
      temporal: QEpiKit.Utils.always,
      condition: {
        label: "incidence is always below 110",
        data: environment,
        key: "incidence",
        value: 110,
        check: QEpiKit.Utils.lt
      }
    }, {
      temporal: QEpiKit.Utils.eventually,
      condition: {
        label: "schools eventually open",
        data: environment,
        key: "schoolsOpen",
        value: true,
        check: QEpiKit.Utils.equalTo
      }
    }, {
      temporal: QEpiKit.Utils.eventually,
      condition: {
        label: "incidence eventually gets below 70",
        data: environment,
        key: "incidence",
        value: 70,
        check: QEpiKit.Utils.lt
      }
    }];
    plans = {
      "useVacc": function(environment) {
        var amt = 100000 * environment.awareness;
        if (amt <= environment.vaccineCache) {
          environment.vaccineUsed += amt;
          environment.vaccineCache -= amt;
          environment.incidence -= environment.incidence * environment.vaccineUsed / (environment.vaccineUsed + environment.vaccineCache);
        }
      },
      "inform": function(environment){
        environment.awareness += 0.5;
      },
      "openSchool": function(environment) {
        environment.schoolsOpen = true;
      },
      "closeSchool": function(environment) {
        environment.schoolsOpen = false;
      }
    };
    TestDecider = new QEpiKit.BDIAgent('test-decider', goals, plans, environment);
  });

  it("should take the current state of the data, create a new belief", function() {
    TestDecider.update(1, eventQueue);
    expect(environment.incidence).not.toBe(100); //step,
    TestDecider.run(1,10,2,eventQueue);
    TestDecider.policySelector = QEpiKit.BDIAgent.lazyPolicySelection;
    TestDecider.run(1,10,2,eventQueue);
  });

  it("should also be able to act as an observer",function(){
    var env = new QEpiKit.Environment('ob',environment,{});
    var obsBDI = new QEpiKit.BDIAgent('test-decider', goals, plans, environment, QEpiKit.BDIAgent.lazyPolicySelection);
    env.addObserver(obsBDI);
    env.run(1,2,1);
    console.log(obsBDI.planHistory.length);
    expect(obsBDI.planHistory.length).toBe(1);
  });
});
