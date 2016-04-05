'use strict()'
//for simple example, just do global scope entities
let options;
let step = 0.01;
let agents = [];
let actions,
  states,
  conditions,
  transitions,
  SEIRModel, MovementModel,
  environment,
  pathogen = {recoveryTime: 6, mutationTime: 12};
let seed = 0x12345678;
let random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
let bounds = [400, 300]; // for margin
let boundaries = {
  "people": {top:bounds[1], left:10, bottom:10, right:bounds[0]}
}

function init(options) {
  let numAgents = options.numberOfAgents;
  let infectedAtStart = options.infectedAtStart;
  raycaster.far = options.shedRange;
  step = options.step;

  pathogen = options.pathogen;
  pathogen.personToPerson = true;
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
    let mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 1),
      new THREE.MeshBasicMaterial({
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
      madeAttempts: 0,
      newAttempt:0
    };
    agents[i].movePerDay = jStat.normal.inv(random.real(0,1), 2500 * 24, 0.5); // km/day;
    agents[i].contactAttempts = jStat.normal.inv(random.real(0,1), Math.abs(agents[i].age - 40), 8) + 8;
    agents[i].mesh.qId = i;
    agents[i].mesh.type = 'agent';
    agents[i].mesh.position.x = random.real(0, 1) * bounds[0];
    agents[i].mesh.position.y = random.real(0, 1) * bounds[1];
    scene.add(agents[i].mesh);
    agents[i].mesh.visible = true; // makes raycaster work if it is not being rendered
  }

  for (var r = 0; r < infectedAtStart; r++) {
    var rIndex = Math.floor(numAgents * random.real(0, 1));
    agents[rIndex].states.illness = 'infectious';
    agents[rIndex].pathogenLoad = 1e4;
  }

  SEIRModel = new QEpiKit.StateMachine('seir-model', states, transitions, conditions, agents);
  MovementModel = {
    data: agents,
    update: function(agent, step){
      QActions.moveWithin(step, agent, boundaries.people);
    }
  };
  //the environmental class can takes resources, facilities, and events as its first three arguements. Here we have none. We've also set the agent activation to 'random'.
  environment = new QEpiKit.Environment([], [], [], 'random', function() {
    return random.real(0, 1);
  });
  environment.add(SEIRModel);
  environment.add(MovementModel);
  environment.init();
  render();
}
