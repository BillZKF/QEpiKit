importScripts('../qepikit.js', '../node_modules/turf/turf.min.js', '../bower_components/random/lib/random.min.js', 'libs/jstat.min.js');
//use a mersene twister for pseudo-random number generation
var startSeed = 0x12345678;
var seed = startSeed;
var prepare = function(r) {
  seed++;
  random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
  var distUnits = "miles";

  //this is based on information about influenza
  pathogen = {
    N50: 9.45e4,
    shedRate: experiment.plans.shedRate[r],
    recoveryTime: experiment.plans.recoveryTime[r],
    doseResponse: function(dose) {
      var response = 1 - Math.pow((1 + (dose / this.N50) * (Math.pow(2, (1 / 5.81e-1)) - 1)), (-5.81e-1));
      return response;
    }
  };
  //some actions are shared across states.
  var actions = {
    move: function(step, agent) {
      var randomBearing = random.integer(-180, 180);
      var dest = turf.destination(agent.location, step * agent.moveRate, randomBearing, distUnits);
      agent.location = dest;
    },
    contact: function(step, agent) {
      var contactPoint, contactedAgent,
        buffer = turf.buffer(agent.location, step * agent.moveRate, distUnits),
        agentsWithinBuffer = turf.within(locations, buffer),
        numContacts = Math.round(agent.physContact * step);
      if (agentsWithinBuffer.features.length > 1) {
        for (var i = 0; i < numContacts; i++) {
          var rand = random.integer(0, agentsWithinBuffer.features.length - 1);
          contactedAgent = environment.getAgentById(agentsWithinBuffer.features[rand].properties.agentRefID);
          if (contactedAgent.states.illness === 'succeptible') {
            contactedAgent.pathogenLoad += pathogen.shedRate * agent.pathogenLoad * step;
            contactedAgent.responseProb = pathogen.doseResponse(contactedAgent.pathogenLoad);
            addContact(contactedAgent, agent);
          }
        }
      }
    }
  };

  var addContact = function(target, src) {
    contactPoint = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [a.location.geometry.coordinates[0], a.location.geometry.coordinates[1]]
      },
      properties: {
        src: src.id,
        srcAge: src.age,
        target: target.id,
        targetAge: target.age,
        responseProb: target.responseProb,
        time: src.time,
        run: r
      }
    };
    contactLocations.push(contactPoint);
  };


  //at each step, based on the agent's current state, do one of these.
  var states = {
    'succeptible': function(step, agent) {
      actions.move(step, agent);
      if (agent.pathogenLoad > 0) {
        agent.pathogenLoad -= 24000 * step;
      } else {
        agent.pathogenLoad = 0;
      }
    },
    'infectious': function(step, agent) {
      actions.move(step, agent);
      actions.contact(step, agent);
      agent.timeInfectious += 1 * step;
    },
    'removed': function(step, agent) {
      actions.move(step, agent);
    }
  };

  //at each step, check if any of these conditions are met.
  var conditions = {
    'infection': {
      key: 'responseProb',
      value: function() {
        var draw = random.real(0, 1);
        return draw;
      },
      check: QEpiKit.Utils.gt
    },
    'recovery': {
      key: 'timeInfectious',
      value: pathogen.recoveryTime,
      check: QEpiKit.Utils.gt
    }
  };

  //transitions specify what happens if a condition is met.
  var transitions = [{
    name: 'infection',
    from: 'succeptible',
    to: 'infectious'
  }, {
    name: 'recovery',
    from: 'infectious',
    to: 'removed'
  }];

  var popAndLocations = generatePopulation(10000, 2);
  var population = popAndLocations[0];
  var locations = popAndLocations[1];

  if (r > 0) {
    environment.remove(SIRModel.id);
  }
  SIRModel = new QEpiKit.StateMachine('sir-model', states, transitions, conditions, population);
  environment.add(SIRModel);
};
//function for generating the population
var generatePopulation = function(numAgents, infectedAtStart) {
  var pop = [];
  var locs = {
    type: 'FeatureCollection',
    features: []
  };

  for (var a = 0; a < numAgents; a++) {
    locs.features[a] = turf.point([random.real(-75.1467, -75.1867), random.real(-39.9200, -39.9900)]);
    pop[a] = {
      id: a,
      sex: random.pick(['male', 'female']),
      age: random.integer(0, 85),
      pathogenLoad: 0,
      states: {
        illness: 'succeptible'
      },
      timeInfectious: 0,
      location: locs.features[a]
    };
    pop[a].location.properties.agentRefID = pop[a].id;
    pop[a].moveRate = 4 - (Math.abs(43 - pop[a].age) / 43 * 4) + 3e-4; // low movement rates for children and older people.
    pop[a].physContact = (-pop[a].age - 3) * 0.05 + 120; // physical contact high for children, low for almost everyone else.
  }
  for (var r = 0; r < infectedAtStart; r++) {
    var rIndex = random.integer(0, numAgents - 1);
    pop[r].states.illness = 'infectious';
    pop[r].pathogenLoad = 1e4;
  }
  return [pop, locs];
};

var report = function(r) {
  var record = {
    run: r,
    recoveryTime: experiment.plans.recoveryTime[r],
    shedRate: experiment.plans.shedRate[r]
  };

  record.succeptible = environment.agents.reduce((prev, current) => {
    if (current.states.illness === 'succeptible') {
      return prev + 1;
    } else {
      return prev;
    }
  }, 0);
  console.log(record, environment.agents.length);
  return record;
};

var step = 1 / 24;
var duration = 7;
var contactLocations = [];
//The environmental class can takes resources, facilities, and events as its first three arguements.
//Here we have none. We've also set the agent activation to 'random'.
environment = new QEpiKit.Environment([], [], [], 'random', function() {
  return random.real(0, 1);
});

var experiment = new QEpiKit.Experiment(environment, prepare, report);
//create arrays for params.
var iterations = 20;
var recDist = [],
  shedDist = [];
for (var j = 0; j < iterations; j++) {
  recDist[j] = jStat.uniform.sample(3, 8);
  shedDist[j] = jStat.normal.sample(0.015, 0.005);
}
var expParams = {
  recoveryTime: recDist,
  shedRate: shedDist
};
//create the experiment plans. how many runs each param.

experiment.boot(expParams);
//start the experiment for: number of runs, by step (hours), until time
experiment.start(iterations, step, duration);
self.postMessage(['complete', experiment.experimentLog, contactLocations]);
self.close();
