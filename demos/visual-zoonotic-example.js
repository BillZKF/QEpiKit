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
    bottom: 10,
    left: 10,
    right: 70
  },
  "people": {
    top: 140,
    bottom: 50,
    left: 150,
    right: 300
  }
}

function init(options) {
  let numLivestock = 50;
  let numAgents = options.numberOfAgents;
  let infectedAtStart = options.infectedAtStart;
  raycaster.far = options.shedRange;
  step = options.step;

  pathogen = options.pathogen;
  pathogen.personToPerson = false;
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

  water = {
    width: 80,
    length: 80,
    depth: 10,
    pathConc: 0
  }

  water.mesh = new THREE.Mesh(new THREE.PlaneGeometry(water.width, water.length), new THREE.MeshBasicMaterial({
    color: 0x5599ff
  })),
  water.capacity = water.width * water.length * water.depth * 10,
  water.status = water.width * water.length * water.depth,
  water.mesh.position.x = 110;
  water.mesh.position.y = 60;
  scene.add(water.mesh);

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
      needsBathroom: 0,
      timeInfectious: 0,
      timeRecovered: 0,
      mesh: mesh,
      waterAvailable: 100,
      waterPathConcentration: 0,
      dailyWaterRequired: 3000,
      boundaryGroup: 'people'
    };
    agents[i].physContact = -0.0135 * (Math.pow(agents[i].age - 43, 2)) + 8;
    agents[i].movePerDay = 350 - Math.abs(43 - agents[i].age) / 43 * 350 + 500;
    agents[i].mesh.qId = i;
    agents[i].mesh.type = 'agent';
    agents[i].mesh.position.x = random.real(boundaries.people.left, boundaries.people.right);
    agents[i].mesh.position.y = random.real(boundaries.people.bottom, boundaries.people.top);
    scene.add(agents[i].mesh);
  }

  for (var j = 0; j < numLivestock; j++){
    livestock[j] = {
      id : j + numAgents,
      age : 5,
      prevX: 0,
      prevY: 0,
      type: 'spatial',
      mesh : new THREE.Mesh(new THREE.CubeGeometry(2, 1, 0.5), new THREE.MeshBasicMaterial({color: 0xcc44cc})),
      pathogenLoad: 0,
      needsBathroom: 0,
      timeInfectious: 0,
      timeRecovered: 0,
      waterAvailable: 100,
      waterPathConcentration: 0,
      dailyWaterRequired: 3000,
      gPerDayExcrete: 4000,
      states: {
        illness: 'succeptible'
      },
      boundaryGroup: 'livestock'
    }
    livestock[j].physContact = numLivestock;
    livestock[j].movePerDay = 100;
    livestock[j].mesh.qId = j + numAgents;
    livestock[j].mesh.position.x = random.real(boundaries.livestock.left, boundaries.livestock.right);
    livestock[j].mesh.position.y = random.real(boundaries.livestock.bottom, boundaries.livestock.top);
    livestock[j].mesh.type = 'agent';
    scene.add(livestock[j].mesh);
  }

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
  //the environmental class can takes resources, facilities, and events as its first three arguements. Here we have none. We've also set the agent activation to 'random'.
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
