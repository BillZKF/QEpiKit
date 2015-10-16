
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
      "useVacc": function(agent, step) {
        if(agents.state === 'succeptible'){
          agents.state = 'removed';
        }
      },
      "goToSchool": function(agent, step) {
        if(agent.state === 'succeptible'){
          agents.state = 'infectious';
        }
      },
      "stayHome": function(agent, step) {
        //no change
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

  it("should take the current state of the data, create a new plan history", function() {
    TestDecider.update(TestDecider.data[0], 1);
    TestDecider.update(TestDecider.data[1], 1);
    expect(TestDecider.planHistory.length).not.toBe(0); //step,
  });
});
