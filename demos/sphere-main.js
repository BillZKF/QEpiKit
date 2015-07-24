var step = 1;
if (typeof(Worker) !== "undefined") {
  /*
   *This is demonstration combining several modeling techniques.
   */

  var start = new Date().getTime();
  var campAgents, campEnv;
  var popWorker = new Worker("sphere-gen-agents.js");
  popWorker.onmessage = function(event) {
    campAgents = event.data;
    campEnv = new QEpiKit.Environment(campAgents, resources, eventsQueue);
    campEnv.householdCount = Math.floor(campAgents.length / 3.1); //#Hack for demo;
    monitorPlans.noIntervention();
  };

  var conditions = {
    "hasSoap": {
      key: "bathingSoap",
      value: 0,
      check: QEpiKit.Utils.gt
    },
    "hasHygWater": {
      key: "hygWater",
      value: 0,
      check: QEpiKit.Utils.gt
    },
    "hasMenstrualProduct": {
      key: "menstrualHygeineCotton",
      value: 0,
      check: QEpiKit.Utils.gt
    },
    "hasLaundrySoap": {
      key: "menstrualHygeineCotton",
      value: 0,
      check: QEpiKit.Utils.gt
    },
    "isActive": {
      key: "active",
      value: true,
      check: QEpiKit.Utils.equalTo
    },
    "isFemale": {
      key: "sex",
      value: "female",
      check: QEpiKit.Utils.equalTo
    },
    "isOver8": {
      key: "age",
      value: 8,
      check: QEpiKit.Utils.gtEq
    }
  };

  var actions = {
    "useSoap": function(person) {
      //use  250g soap bar at ~8.5g per day
      person.resources.bathingSoap.count -= 0.031 * step;
    },
    "useHygWater": function(person) {
      //use 6l per day
      campEnv.resources.totalWater.quantity -= 3.5 * step;
    },
    "useMenstrualProd": function(person) {
      //use 8 every 28 days
      person.resources.menstrualHygeineCotton.count -= (6 / 28) * step;
    },
    "useTP": function(person) {
      //use 8 every 28 days
      person.resources.tolietPaper.count -= (1 / 30) * step;
    },
    "useLatrine": function(person) {
      var options = campEnv.resources.latrines[person.sex].length;
      var selection = Math.floor(Math.random() * options);
      var tries = 0;
      person.needsLatrine = true;
      while (person.needsLatrine && tries < options - 1) {
        if (campEnv.resources.latrines[person.sex][selection].working) {
          campEnv.resources.latrines[person.sex][selection].status += 0.25;
          person.needsLatrine = false;
          if (campEnv.resources.latrines[person.sex][selection].status >= campEnv.resources.latrines[person.sex][selection].capacity) {
            campEnv.resources.latrines[person.sex][selection].working = false;
          }
        } else {
          if (selection >= options - 1) {
            selection = 0;
          } else {
            selection += 1;
          }
        }
        tries += 1;
      }
    },
    "doLaundry": function(person) {
      //use 30 grams laundry soap every five days and 2.5 liters of water every five days.
      person.resources.laundrySoap.count -= 0.15 / 5 * step;
      campEnv.resources.totalWater.quantity -= 2.5 / 5 * step;
    }
  };

  var monitorPlans = {
    "noIntervention": function() {
      //var tempAgents = JSON.parse(JSON.stringify(campAgents));
      var agentBTree = new QEpiKit.BehaviorTree("camp-resident-behavior", Root, campAgents);
      campEnv.add(agentBTree);
      campEnv.run(1, 90, 10);
      var TreeDiagram = new QEpiKit.renderer.bTreeDiagrams(agentBTree.root, "btree-result");
      var ResDiagram = new QEpiKit.renderer.resourceLineChart(campEnv.history, "continous-result", "quantity");
      var ItemsDiagram = new QEpiKit.renderer.resourceLineChart(campEnv.history, "countable-result", "count");
    },
    "taskNetworkEval": function() {
      var tempAgents = JSON.parse(JSON.stringify(campAgents));
      var agentBTree = new QEpiKit.BehaviorTree("camp-resident-behavior", Root, tempAgents);
      //var scenarioPlanningAgent = new QEpiKit.HTNPlanner("camp-planner", );
    }
  };

  //var monitoringAgent = new QEpiKit.BDIAgent("camp-monitor", sphereWASHGuidelines, monitorPlans, campEnv);


  //What do the people actually do!? By Behavior Tree!
  var UseMenstrualProduct = new QEpiKit.BTAction("use-menstr-prod", conditions.isOver8, actions.useMenstrualProd);
  var IsFemale = new QEpiKit.BTCondition("is-female?", conditions.isFemale);
  var Menstration = new QEpiKit.BTSequence("menstruates?", [IsFemale, UseMenstrualProduct]);
  var UseHygWater = new QEpiKit.BTAction("use-water", conditions.isActive, actions.useHygWater);
  var DoLaundry = new QEpiKit.BTAction("do-laundry", conditions.isActive, actions.doLaundry);
  var UseSoap = new QEpiKit.BTAction("use-soap", conditions.isActive, actions.useSoap);
  var HygieneSequence = new QEpiKit.BTSequence("hygiene-sequence", [UseHygWater, UseSoap, DoLaundry, Menstration]);
  var UseTP = new QEpiKit.BTAction("use-toilet-paper", conditions.isActive, actions.useTP);
  var UseLatrine = new QEpiKit.BTAction("use-latrine", conditions.isActive, actions.useLatrine);
  var WasteSequence = new QEpiKit.BTSequence("waste-sequence", [UseLatrine]);
  var DailySequence = new QEpiKit.BTSequence("daily", [WasteSequence, HygieneSequence]);
  var Root = new QEpiKit.BTRoot("start", [DailySequence]);
} else {
  var warning = document.createElement("div");
  warning.innerHTML = "It looks like your browser doesn't support the Web Worker API. Newer versions (2014 ->) of Chrome, Safari, and Firefox do. Try coming back with one of those.";
  document.body.innerHTML = warning;
}
