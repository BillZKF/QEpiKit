importScripts('../qepikit.js', '../node_modules/turf/turf.min.js', '../bower_components/random/lib/random.min.js');
//use a mersene twister for pseudo-random number generation
var seed = 0x12345678;
var random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
var distUnits = "miles";

//function for generating the population
var generatePopulation = function(numAgents, infectedAtStart) {
  var pop = [];
  var locs = turf.random('points', numAgents, {
    bbox: [-75.1867, 39.9900, -75.1467, 39.9200] //randomly place points within this geobounding box
  });
  for (var a = 0; a < numAgents; a++) {
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

var getAgentById = function(id, agentList) {
  for (var i = 0; i < agentList.length; i++) {
    if (agentList[i].id == id) {
      return agentList[i];
    }
  }
};

//this is based on information about influenza
var pathogen = {
  N50: 9.45e4,
  shedRate: 7e4,
  recoveryTime: 6,
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
      var contactPoint;
      var buffer = turf.buffer(agent.location, step * agent.moveRate, distUnits);
      var agentsWithinBuffer = turf.within(locations, buffer);
      var numContacts = Math.round(agent.physContact * step);
      if (agentsWithinBuffer.features.length > 1) {
        for (var i = 0; i < numContacts; i++) {
          var rand = random.integer(0, agentsWithinBuffer.features.length - 1);
          var randContact = agentsWithinBuffer.features[rand].properties.agentRefID;
          var contactedAgent = getAgentById(randContact, environment.agents);
          if (contactedAgent.states.illness === 'succeptible') {
            contactedAgent.pathogenLoad += pathogen.shedRate * step;
            contactedAgent.lastInfectedContact = agent.id;
            contactedAgent.responseProb = pathogen.doseResponse(contactedAgent.pathogenLoad);
            contactPoint = {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [contactedAgent.location.geometry.coordinates[0], contactedAgent.location.geometry.coordinates[1]]
              },
              properties : {
                src: agent.id,
                srcAge: agent.age,
                target: contactedAgent.id,
                targetAge: contactedAgent.age,
                responseProb: contactedAgent.responseProb,
                time: agent.time
              }};
              contactLocations.push(contactPoint);
            }
          }
        }
      }
    };

    //at each step, based on the agent's current state, do one of these.
    var states = {
      'succeptible': function(step, agent) {
        actions.move(step, agent);
        if (agent.pathogenLoad > 0) {
          agent.pathogenLoad -= 24000 * step;
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

    var popAndLocations = generatePopulation(500, 5);
    var population = popAndLocations[0];
    var locations = popAndLocations[1];
    var contactLocations = [];

    var SIRModel = new QEpiKit.StateMachine('sir-model', states, transitions, conditions, population);
    //the environmental class can takes resources, facilities, and events as its first three arguements. Here we have none. We've also set the agent activation to 'random'.
    var environment = new QEpiKit.Environment([], [], [], 'random', function() {
      return random.real(0, 1);
    });
    environment.add(SIRModel);
    environment.run(1 / 24, 7, 1);
    self.postMessage(['complete', environment.history, contactLocations]);
    self.close();
