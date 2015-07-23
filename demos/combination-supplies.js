/*
*This is demonstration combining several modeling techniques.
*/

var campEnv = QEpiKit.Environment();

campEnv.resources = [
  {"name":"latrine", "working":true, "choleraLoad":0, "fullness":0, "capacity":100},
  {"name":"latrine", "working":true, "choleraLoad":0, "fullness":0, "capacity":100},
  {"name":"latrine", "working":true, "choleraLoad":50, "fullness":0, "capacity":100},
  {"name":"latrine", "working":true, "choleraLoad":50, "fullness":0, "capacity":100},
  {"name":"latrine", "working":true, "choleraLoad":0, "fullness":0, "capacity":100},
  {"name":"latrine", "working":true, "choleraLoad":0, "fullness":0, "capacity":100},
  {"name":"oralRS", "quantity":24000},
  {"name":"cholrine", "quantity":4000}
]

var longTermGoals = [{
  temporal: QEpiKit.Utils.always,
  condition: {
    key: "latrinesWorking",
    value: 1,
    check: QEpiKit.Utils.equalTo
  }
}, {
  temporal: QEpiKit.Utils.always,
  condition: {
    key: "oralRS",
    value: 5000,
    check: QEpiKit.Utils.gt
  }
}, {
  temporal: QEpiKit.Utils.eventually,
  condition: {
    key: "incidence",
    value: 5,
    check: QEpiKit.Utils.lt
  }
}];

var monitoringAgent = new QEpiKit.BDIAgent("camp-monitor", goals, plans, campEnv);
var planningAgent = new QEpiKit.HTNPlanner("camp-planner", );

//What do the people actually do! By Behavior Tree!

var campCitizenTree =
