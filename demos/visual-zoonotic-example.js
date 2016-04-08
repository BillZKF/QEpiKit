'use strict'
//for simple example, just do global scope entities
let options;
let step = 0.01;
let agents = [];
let livestock = [];
let water;
let actions,
  states,
  conditions,
  transitions,
  SEIRModel, PeopleMovementModel, SEIRLivestockModel, LivestockMovementModel,
  environment,
  pathogen = {recoveryTime: 6, mutationTime: 12};
  let seed = 0x12345678;
let random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
let bounds = [300, 100]; // for margin
let boundaries = {
  "livestock": {
    top: 50,
    bottom: 1,
    left: 10,
    right: 70
  },
  "people": {
    top: 200,
    bottom: 50,
    left: 150,
    right: 350
  }
}

function init(options) {
  let numLivestock = 50;
  let numAgents = options.numberOfAgents;
  let infectedAtStart = options.infectedAtStart;
  step = options.step;

  pathogen = options.pathogen;
  pathogen.personToPerson = false;
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

  water = {
    width: 80,
    length: 200,
    depth: 10,
    pathConc: 0
  }

  water.mesh = new THREE.Mesh(new THREE.PlaneGeometry(water.width, water.length), new THREE.MeshBasicMaterial({
    color: 0x5599ff
  })),
  water.capacity = water.width * water.length * water.depth * 1000,//liters
  water.status = water.width * water.length * water.depth,
  water.mesh.position.x = 110;
  water.mesh.position.y = 100;
  scene.add(water.mesh);

  let optionParams = SEIRparams;
  optionParams = optionParams.concat(BasicNeedsParams);
  let results = QUtils.generatePop(numAgents, optionParams);
  agents = results[0];


  optionParams.push({name:'movePerDay', assign: 4000}); //overwrite movement per day for cows
  let lsResults = QUtils.generatePop(numLivestock, optionParams, 'spatial','livestock');
  livestock = lsResults[0];
  livestock.forEach((l) => {
    l.mesh.geometry = new THREE.CubeGeometry(2, 1, 0.5);
  })
  for (var r = 0; r < infectedAtStart; r++) {
    var rIndex = Math.floor(numLivestock * random.real(0, 1));
    livestock[rIndex].states.illness = 'infectious';
    livestock[rIndex].pathogenLoad = 1e4;
  }

  SEIRModel = new QEpiKit.StateMachine('seir-model', states, transitions, conditions, agents);
  SEIRLivestockModel = new QEpiKit.StateMachine('seir-livestock-model', states, transitions, conditions, livestock);
  PeopleMovementModel = {
    data: agents,
    update: function(agent, step){
      QActions.checkWater(step, agent, water);
      QActions.moveWithin(step, agent, boundaries.people);
    }
  };
  LivestockMovementModel = {
    data: livestock,
    update: function(agent, step){
      QActions.checkWater(step, agent, water);
      if(agent.needsBathroom){
        QActions.excrete(step, agent, water);
      }
      QActions.moveWithin(step, agent, boundaries.livestock);
    }
  };

  environment = new QEpiKit.Environment([], [], [], 'random', function() {
    return random.real(0, 1);
  });
  environment.add(SEIRModel);
  environment.add(SEIRLivestockModel);
  environment.add(PeopleMovementModel);
  environment.add(LivestockMovementModel);
  environment.init();

  render();
}
