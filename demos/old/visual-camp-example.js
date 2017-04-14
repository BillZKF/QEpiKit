'use strict()';
//for simple example, just do global scope entities
let options;
let environment;
let step = 0.01;
let agents = [];
let bathrooms = [];
let facilities = [];
let waterPumps = [];
let actions, states, conditions, transitions, SIRModel;
let pathogen = {recoveryTime: 6,mutationTime: 12};
let seed = 0x111111115;
let random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
let distUnits = "miles";
let bounds = [500, 400];
let boundaries = {
  "tents": {
    left: 10,
    right: bounds[0] - 10,
    top: 150,
    bottom: 100
  },
  "waterPumps": {
    left: 50,
    right: bounds[0] - 50,
    top: 300,
    bottom: 200
  },
  "bathrooms": {
    left: 10,
    right: bounds[0] - 10,
    top: bounds[1] - 1,
    bottom: 350
  },
  "people": {
    left: 1,
    right: bounds[0] - 1,
    top: bounds[1] - 1,
    bottom: 1
  }
};

function init(opts) {
  options = opts;
  let numAgents = options.numberOfAgents;
  let numPumps = Math.ceil(numAgents / 50);
  let numBathrooms = Math.ceil(numAgents/ 25);
  let infectedAtStart = options.infectedAtStart;
  step = options.step;

  pathogen = options.pathogen;
  pathogen.personToPerson = true;
  pathogen.fecalOral = true;
  pathogen.waterBorne = true;

  pathogen['beta-Poisson'] = function(dose) {
    let response = 1 - Math.pow((1 + (dose / pathogen.N50) * (Math.pow(2, (1 / pathogen.optParam)) - 1)), (-pathogen.optParam));
    return response;
  }
  pathogen['exponential'] = function(dose) {
    let response = 1 - Math.exp(-pathogen.optParam * dose);
    return response;
  }

  var numTents = Math.ceil(numAgents / 5);
  var tents = [];
  for (var t = 0; t < numTents; t++) {
    tents[t] = {
      id: t,
      label: "tents",
      working: true,
      capacity: 5,
      type: 'unisex',
      units: "persons",
      pathConc: 0,
      status: 0
    }
    tents[t].mesh = new THREE.Mesh(new THREE.CubeGeometry(5, 5, 1), new THREE.MeshBasicMaterial({
      color: 0x22ccdd
    }));
    scene.add(tents[t].mesh);
  }
  QUtils.arrangeEvenWithin(tents, 5, 5, boundaries.tents);

  for (var wp = 0; wp < numPumps; wp++) {
    waterPumps[wp] = {
      id: wp,
      working: true,
      wait: 0.00008,
      capacity: 1,
      queue: [],
      pathConc: 0
    };
    waterPumps[wp].mesh = new THREE.Mesh(new THREE.CubeGeometry(4, 4, 0.5), new THREE.MeshBasicMaterial({
      color: 0x00aacc
    }));
    waterPumps[wp].mesh.type = 'pump';
    waterPumps[wp].mesh.position.x =  random.real(boundaries.waterPumps.left, boundaries.waterPumps.right);
    waterPumps[wp].mesh.position.y =  random.real(boundaries.waterPumps.bottom, boundaries.waterPumps.top) ;
    scene.add(waterPumps[wp].mesh);
  }


  for (var b = 0; b < numBathrooms; b++) {
    bathrooms[b] = {
      id: b,
      wait: 0.00008,
      label: "ventilated improved pit latrine",
      working: true,
      capacity: 0.1, //cubic meter
      queue: [],
      useCapacity: 2,
      use: [],
      type: 'unisex',
      units: "m3",
      pathConc: 0,
      status: 0
    };
    bathrooms[b].mesh = new THREE.Mesh(new THREE.CubeGeometry(7, 7, 0.5), new THREE.MeshBasicMaterial({
      color: 0x4444ff
    }));
    scene.add(bathrooms[b].mesh);
  }
  QUtils.arrangeEvenWithin(bathrooms, 7, 8, boundaries.bathrooms);


  for (var r = 0; r < infectedAtStart; r++) {
    var rIndex = Math.floor(waterPumps.length * random.real(0, 1));
    waterPumps[rIndex].pathConc = pathogen.shedRate;
  }

  let optionParams = SEIRparams;
  optionParams = optionParams.concat(BasicNeedsParams);
  let results = QUtils.generatePop(numAgents, optionParams);
  agents = results[0];
  agents.forEach((agent, i) => {agent.tent = tents[Math.floor(i / 5)];});

  Sys = new QEpiKit.USys('camp', [oBathroom, oWater, oIdle, oSleep], agents);
  SEIRModel = new QEpiKit.StateMachine('seir-model', states, transitions, conditions, agents);

  //the environmental class can takes resources, facilities, and events as its first three arguements. Here we have none. We've also set the agent activation to 'random'.
  environment = new QEpiKit.Environment([], [], [], 'random', function() {
    return random.real(0, 1);
  });
  environment.add(SEIRModel);
  environment.add(Sys);
  environment.init();
  render();
}
