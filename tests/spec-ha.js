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
          return 65 - x;
        },
        "OFF": function(x) {
          return 95 - x;
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
        value: 73,
        check: QEpiKit.Utils.ltEq
      }
    };
    ac = {
      x: 95,
      currentMode: "OFF",
      modes: modes
    };

    acHA = new QEpiKit.HybridAutomata('ac', [ac], flowSet, flowMap, jumpSet, jumpMap);
  });
  it("should change to off", function() {
    //run for 10 minutes
    acHA.run(1, 10, 1);
    expect(acHA.time).toBe(11);
  });
});
