
describe("A Belief Desire Intent Agent", function() {

  beforeEach(function() {
    agents = [
      {
        id:1,
        state:'succeptible'
      },
      {
        id:2,
        state:'succeptible'
      },
      {
        id:3,
        state:'succeptible'
      },
      {
        id:4,
        state:'succeptible'
      },
      {
        id:5,
        state:'succeptible'
      }
    ];

    facilities = {
      schools :[
        {
          capacity:6,
          working: true,
        }
      ]
    };
    report = {infectious:0};
    goals = [{
      temporal: QEpiKit.Utils.always,
      condition: {
        label: "count of infected less than 2",
        data: report,
        key: "infectious",
        value: 2,
        check: QEpiKit.Utils.lt
      }
    }];
    plans = {
      "useVacc": function() {
        var r = Math.floor(Math.random() * agents.length);
        if(agents[r].state === 'succeptible'){
          agents[r].state = 'removed';
        }
      },
      "openSchool": function() {
        facilities.schools[0].working = open;
        var r = Math.floor(Math.random() * agents.length);
        if(agents[r].state === 'succeptible'){
          agents[r].state = 'infectious';
        }
      },
      "closeSchool": function() {
        facilities.schools[0].working = false;
      }
    };
    TestDecider = new QEpiKit.BDIAgent('test-decider', goals, plans, agents);
    Env = new QEpiKit.Environment(agents,[],[],[]);
    Object.observe(agents, function(changes){
      changes.forEach(function(change){
        if(change.oldValue === 'succeptible'){
          report.infected += 1;
        }
      });
    });
  });

  it("should take the current state of the data, create a new belief", function() {
    TestDecider.update(1);
    expect(TestDecider.time).not.toBe(0); //step,
    TestDecider.run(1,10);
  });
});
