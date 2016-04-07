'use strict()'
//for simple examples, just do global scope
let seed = 0x12345678;
let random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
let bounds = [400, 300]; // keep everything on screen
let boundaries = {
  "people": {
    top: bounds[1],
    left: 10,
    bottom: 10,
    right: bounds[0]
  }
}
let agents = [];
let actions,
  options,
  step,
  states,
  conditions,
  transitions,
  SEIRModel, MovementModel,
  environment,
  pathogen = {
    recoveryTime: 6,
    mutationTime: 12
  };


function init(options) {
  let numAgents = options.numberOfAgents;
  let infectedAtStart = options.infectedAtStart;
  step = options.step;

  //setup pathogen
  pathogen = options.pathogen;
  pathogen['beta-Poisson'] = function(dose) {
    let response = 1 - Math.pow((1 + (dose / pathogen.N50) * (Math.pow(2, (1 / pathogen.optParam)) - 1)), (-pathogen.optParam));
    return response;
  };

  pathogen['exponential'] = function(dose) {
    let response = 1 - Math.exp(-pathogen.optParam * dose);
    return response;
  };
  pathogen.personToPerson = true;

  //set up population
  let popOptions = SEIRparams; // from sm-SEIR.js
  let result = QUtils.generatePop(numAgents, popOptions); // returns [agents, geolocations]
  agents = result[0];

  for (var r = 0; r < infectedAtStart; r++) {
    var rIndex = random.integer(0, numAgents - 1);
    agents[r].states.illness = 'infectious';
    agents[r].pathogenLoad = 1e4;
  }
  //SEIR model defined in sm-SEIR.js
  SEIRModel = new QEpiKit.StateMachine('seir-model', states, transitions, conditions, agents);
  MovementModel = {
    data: agents,
    update: function(agent, step) {
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
