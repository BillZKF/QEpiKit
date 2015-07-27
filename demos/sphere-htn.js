//HTN and plans for SPHERE demo
var htnCond = {
  "hadBarriers": {
    label: "barriers encountered on previous attempt",
    data: monitoringAgent.planHistory[monitoringAgent.time - 1].barriers,
    key: "length",
    value: 0,
    check: QEpiKit.Utils.notEqualTo
  },
  "notFlooded": {
    label: "the area is not flooded",
    data: campEnv.attributes,
    key: "flooded",
    value: false,
    check: QEpiKit.Utils.equalTo
  }
};

var correctiveActions = {};
var lastBarriers = function() {
  return monitoringAgent.planHistory[monitoringAgent.time - 1].barriers;
};
var htnEffects = {
  "takeCorrectiveActions": function() {
    htnEffects.processFailure(lastBarriers());
  },
  "processFailure": function(barriers) {
    var diff, data;
    barriers.forEach(function(bar) {
      if (typeof(bar.expected) === 'number') {
        if (bar.check === "greater than" || bar.check === "greater than or equal to") {
          for (var gl in sphereWASHGuidelines) {
            if (sphereWASHGuidelines[gl].condition.label === bar.label) {
              data = sphereWASHGuidelines[gl].condition.data;
            }
          }
          diff = bar.expected - bar.actual;
          correctiveActions[data.label] = {
            amount: diff
          };
          data.amount += diff;
        }
      }
    });
  }
};

//var UseLess = new QEpiKit.HTNMethod("use-less", [htnCond.notFlooded],[htn]);
var OrderSupplies = new QEpiKit.HTNOperator("order-supplies", null, [htnEffects.takeCorrectiveActions, function() {
  campEnv.run(1, until, 10);
}]);
var StartHTN = new QEpiKit.HTNMethod("start", [htnCond.hadBarriers], [OrderSupplies]);

var MeetSphereGoals = new QEpiKit.HTNRootTask("MeetSphereGoals", [sphereWASHGuidelines[1].condition], campEnv.resources);
