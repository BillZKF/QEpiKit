'use strict()';
//for simple example, just do global scope entities
let options;
let step = 0.01;
let agents = [];
let actions,
  states,
  conditions,
  transitions,
  SEIRModel, ThirstModel,
  environment,
  pathogen = {recoveryTime: 6, mutationTime: 12};
let seed = 0x12345678;
let random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
let distUnits = "miles";
let bounds = [500, 400]; // for margin
let boundaries = {
  "people": {top:bounds[1], left:10, bottom:10, right:bounds[0]}
}

function init(opts) {
  options = opts;
  let numAgents = options.numberOfAgents;
  let numPumps = Math.ceil(options.numberOfAgents / 100);
  let infectedAtStart = options.infectedAtStart;
  raycaster.far = options.shedRange;
  step = options.step;

  pathogen = options.pathogen;
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

  for (let i = 0; i < numAgents; i++) {
    let mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 1), new THREE.MeshBasicMaterial({
      color: 0x00ff00
    }));
    agents[i] = {
      id: i,
      type: 'spatial',
      age: Math.round(random.real(0, 1) * 100) + 3,
      pathogenLoad: 0,
      states: {
        illness: 'succeptible'
      },
      prevX: 0,
      prevY: 0,
      timeInfectious: 0,
      timeRecovered: 0,
      mesh: mesh,
      objectives: [],
      pastObjectives: []
    };
    agents[i].movePerDay = 350 - Math.abs(43 - agents[i].age) / 43 * 350 + 500;
    agents[i].physContact = -0.0135 * (Math.pow(agents[i].age - 43, 2)) + 8;
    setDailyWater(agents[i]); //sets the daily requirement and consumption rate.
    agents[i].mesh.qId = i;
    agents[i].mesh.type = 'agent';
    agents[i].mesh.position.x = random.real(0, 1) * bounds[0];
    agents[i].mesh.position.y = random.real(0, 1) * bounds[1];
    scene.add(agents[i].mesh);
  }

  var waterPumps = [];
  for (var wp = 0; wp < numPumps; wp++) {
    waterPumps[wp] = {
      id: wp
    };
    waterPumps[wp].mesh = new THREE.Mesh(new THREE.CubeGeometry(4, 4, 0.5), new THREE.MeshBasicMaterial({
      color: 0x00aacc
    }));
    waterPumps[wp].mesh.type = 'pump';
    waterPumps[wp].mesh.position.x = random.real(0, 1) * bounds[0];
    waterPumps[wp].mesh.position.y = random.real(0, 1) * bounds[1];
    waterPumps[wp].pathConc = 0;
    scene.add(waterPumps[wp].mesh);
  }

  for (var r = 0; r < infectedAtStart; r++) {
    var rIndex = Math.floor(waterPumps.length * random.real(0, 1));
    waterPumps[rIndex].pathConc = pathogen.shedRate;
  }

  SEIRModel = new QEpiKit.StateMachine('seir-model', states, transitions, conditions, agents);
  ThirstModel = {
    data: agents,
    update: function(agent, step){
      QActions.findWater(step, agent, waterPumps, 'waterPump');
      QActions.moveWithin(step, agent, boundaries.people);
    }
  };
  //the environmental class can takes resources, facilities, and events as its first three arguements. Here we have none. We've also set the agent activation to 'random'.
  environment = new QEpiKit.Environment([], [], [], 'random', function() {
    return random.real(0, 1);
  });
  environment.add(SEIRModel);
  environment.add(ThirstModel);
  environment.init();
  render();
}
