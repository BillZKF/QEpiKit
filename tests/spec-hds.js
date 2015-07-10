describe("Hybrid Automata and Dynamic System common utils", function() {
  var ac, modes, flowSet, flowMap, jumpSet, jumpMap, schedule, eventsQueue;
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
      modes: modes,
      flowSet: flowSet,
      flowMap: flowMap,
      jumpSet: jumpSet,
      jumpMap: jumpMap
    };
    scheduler = {
      time: 0,
      step: 1 / 60
    };
  });
  it("should change to off", function() {
    //run for 90 minutes
    while (scheduler.time <= 90 / 60) {
      for (var mode in ac.jumpSet) {
        var edge = ac.jumpSet[mode];
        var edgeState = edge.check(ac[edge.key], edge.value);
        if (edgeState === QEpiKit.Utils.SUCCESS && mode != ac.currentMode) {
          ac.x = ac.jumpMap[edge.key][ac.currentMode][mode](ac[edge.key]);
          ac.currentMode = mode;
        }
      }
      ac.x += ac.flowMap.x[ac.currentMode](ac.x) * scheduler.step;
      scheduler.time += scheduler.step;
    }
    expect(ac.x).toBeLessThan(74);
  });
});
