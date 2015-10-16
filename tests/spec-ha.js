describe("Hybrid Automata and Dynamic System common utils", function() {
  var ac, acHA, modes, flowSet, flowMap, jumpSet, jumpMap, schedule, eventsQueue;
  beforeEach(function() {
    modes = ["ON", "OFF"];
    flowSet = {
      x: {
        min: 0,
        max: 100
      }
    };
    flowMap = {
      x: {
        "ON": function(x) {
          return 75 - x;
        },
        "OFF": function(x) {
          return 85 - x;
        }
      }
    };
    jumpMap = {
      "x": {
        "ON": {
          "OFF": function(x) {
            return x;
          }
        },
        "OFF": {
          "ON": function(x) {
            return x;
          }
        }
      }
    };
    jumpSet = {
      "ON": {
        key: "x",
        value: 74,
        check: QEpiKit.Utils.gtEq
      },
      "OFF": {
        key: "x",
        value: 72,
        check: QEpiKit.Utils.ltEq
      }
    };
    ac = {
      x: 86,
      currentMode: "OFF",
      modes: modes
    };

    acHA = new QEpiKit.HybridAutomata('ac', [ac], flowSet, flowMap, jumpSet, jumpMap);
  });
  it("should change to off", function() {
    //run for 10 minutes
    for(var i = 0; i < 100; i++){
      acHA.update(acHA.data[0], 1 / 10);
    }
    expect(acHA.data[0].x).toBe(75);
  });
});
