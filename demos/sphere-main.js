  /*
   *This is demonstration combining several modeling techniques.
   */
  importScripts("../dist/utils.js", "../dist/environment.js", "../dist/behaviorTree.js", "../dist/htn.js", "../dist/bdi.js", "sphere-events.js","../bower_components/random/lib/random.min.js");
  var monitoringAgent, campAgents, campEnv, step;
  var random = new Random(Random.engines.mt19937().seedWithArray([0x12345678, 0x90abcdef]));

  // Webworker parallel process
  onmessage = function(event) {
    step = 1;
    campAgents = event.data[0];
    resources = event.data[1];
    resources.facilities = event.data[2];
    until = event.data[3];
    campEnv = new QEpiKit.Environment(campAgents, resources, eventsQueue);
    campEnv.householdCount = Math.ceil(campAgents.length / 3.3); //#Hack for demo;

    var monitorPlans = {
      "noIntervention": function() {
        console.log("baseline");
        var agentBTree = new QEpiKit.BehaviorTree("camp-resident-behavior", Root, campAgents);
        campEnv.add(agentBTree);
        campEnv.run(1, until, 2);
      },
      "taskNetworkEval": function() {
        console.log("taskNetworkEval");
        var tempAgents = JSON.parse(JSON.stringify(campAgents));
        var agentBTree = new QEpiKit.BehaviorTree("camp-resident-behavior", Root, tempAgents);
        campEnv.add(agentBTree);

        var scenarioPlanningAgent = new QEpiKit.HTNPlanner('camp-scenario-planner',StartHTN, campEnv.resources);
        scenarioPlanningAgent.update(1, MeetSphereGoals);
        console.log(campEnv.resources);
      }
    };
    importScripts("sphere-btree.js");
    importScripts("sphere-wash-guidelines.js");
    monitoringAgent = new QEpiKit.BDIAgent("camp-monitor", sphereWASHGuidelines, monitorPlans, campEnv, QEpiKit.BDIAgent.lazyPolicySelection);
    monitoringAgent.update(1, []);
    if(monitoringAgent.planHistory[0].barriers.length > 0){
      importScripts("sphere-htn.js");
      monitoringAgent.update(1,[]);
    }
    self.postMessage([campEnv.history, until, monitoringAgent.planHistory]);
    //close();
  };
