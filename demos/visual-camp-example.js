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
    left: 100,
    right: 500,
    top: 200,
    bottom: 150
  },
  "bathrooms": {
    left: 10,
    right: bounds[0] - 10,
    top: bounds[1] - 1,
    bottom: 250
  }
};

function init(opts) {
  options = opts;
  let numAgents = options.numberOfAgents;
  let numPumps = Math.ceil(options.numberOfAgents / 50);
  let infectedAtStart = options.infectedAtStart;
  raycaster.far = options.shedRange;
  step = options.step;

  pathogen = options.pathogen;
  pathogen.personToPerson = true;
  pathogen.fecalOral = true;
  pathogen.waterBorne = true;
  pathogen.decayRate = 200;
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

  for (let i = 0; i < numAgents; i++) {
    let mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 1), new THREE.MeshBasicMaterial({
      color: 0x00ff00
    }));
    agents[i] = {
      id: i,
      type: 'agent',
      waterPump: null,
      bathroom: null,
      inQueue: false,
      age: Math.round(random.real(0, 1) * 100) + 3,
      pathogenLoad: 0,
      states: {
        illness: 'succeptible'
      },
      prevX: 0,
      prevY: 0,
      useTime: 0,
      timeInfectious: 0,
      timeRecovered: 0,
      gPerDayExcrete: 0.15,
      needsBathroom: random.real(0,0.9),
      needsSleep: 0,
      mesh: mesh
    };
    agents[i].tent = tents[Math.floor(i / 5)];
    agents[i].physContact = -0.0135 * (Math.pow(agents[i].age - 43, 2)) + 8;
    agents[i].movePerDay = 350 - Math.abs(43 - agents[i].age) / 43 * 350 + 500;
    setDailyWater(agents[i]); //sets the daily requirement and consumption rate.
    agents[i].mesh.qId = i;
    agents[i].mesh.type = 'agent';
    agents[i].mesh.position.x = random.real(0, 1) * bounds[0];
    agents[i].mesh.position.y = random.real(0, 1) * bounds[1];
    scene.add(agents[i].mesh);
  }

  for (var wp = 0; wp < numPumps; wp++) {
    waterPumps[wp] = {
      id: wp,
      working: true,
      wait: 0.005,
      capacity: 1,
      queue: [],
      pathConc: 0
    };
    waterPumps[wp].mesh = new THREE.Mesh(new THREE.CubeGeometry(4, 4, 0.5), new THREE.MeshBasicMaterial({
      color: 0x00aacc
    }));
    waterPumps[wp].mesh.type = 'pump';
    waterPumps[wp].mesh.position.x = boundaries.waterPumps.right * random.real(0, 1) + boundaries.waterPumps.left;
    waterPumps[wp].mesh.position.y = boundaries.waterPumps.top * random.real(0, 1) + boundaries.waterPumps.bottom;
    scene.add(waterPumps[wp].mesh);
  }

  var numBathrooms = Math.ceil(agents.length / 25);
  for (var b = 0; b < numBathrooms; b++) {
    bathrooms[b] = {
      id: b,
      wait: 0.005,
      label: "ventilated improved pit latrine",
      working: true,
      capacity: 0.01,
      queue: [],
      useCapacity: 2,
      use: [],
      type: 'unisex',
      units: "m3",
      pathConc: 0,
      status: 0
    }
    bathrooms[b].mesh = new THREE.Mesh(new THREE.CubeGeometry(7, 7, 0.5), new THREE.MeshBasicMaterial({
      color: 0x4444ff
    }));
    scene.add(bathrooms[b].mesh);
  }
  QUtils.arrangeEvenWithin(bathrooms, 7, 8, boundaries.bathrooms)


  for (var r = 0; r < infectedAtStart; r++) {
    var rIndex = Math.floor(waterPumps.length * random.real(0, 1));
    waterPumps[rIndex].pathConc = pathogen.shedRate;
  }

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
