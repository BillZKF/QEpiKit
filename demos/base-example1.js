var Model = function() {
  var A = {
    update: function(step, agent) {

      if (agent.succeptible) {
        this.move(step, agent);
      }
      if (agent.infectious) {
        this.move(step, agent);
        this.contact(step, agent);
        agent.pathogenLoad -= pathogen.recoveryRate * step;
        if (agent.pathogenLoad < 0) {
          agent.infectious = false;
          agent.recovered = true;
          agent.moveRate = 1;
        }
      }
      if (agent.recovered) {
        this.move(step, agent);
      }

      agent.age += step;
      agent.time += step;
      locations[agent.id] = agent.location;
    },
    contact: function(step, agent) {
      var buffer = turf.buffer(agent.location, step * agent.moveRate, distUnits);
      var agentsWithinBuffer = turf.within(locations, buffer);
      var numContacts = Math.round(agent.sociablility * step);
      if (agentsWithinBuffer.features.length > 1) {
        for (var i = 0; i < numContacts; i++) {
          var rand = random.integer(0, agentsWithinBuffer.features.length - 1);
          var randContact = agentsWithinBuffer.features[rand].properties.agentRefID;
          var contactedAgent = agents[randContact]; //works only because id is same as Array index
          if (contactedAgent.succeptible === true) {
            contactedAgent.pathogenLoad += pathogen.shedRate * step;
            contactedAgent.responseProb = pathogen.doseResponse(contactedAgent.pathogenLoad);
            if (contactedAgent.responseProb >= random.real(0, 1)) {
              contactedAgent.succeptible = false;
              contactedAgent.infectious = true;
              contactedAgent.moveRate *= 0.25;
            }
          }
        }
      }
    },
    move: function(step, agent) {
      var randomBearing = random.integer(-180, 180);
      var dest = turf.destination(agent.location, step * agent.moveRate, randomBearing, distUnits);
      agent.location = dest;
    }
  };
  return A;
};

var genPop = function(numAgents) {
  duration = 7; //7 days
  step = 1 / 24; //do each hour
  infectAtStartProp = 0.003;
  modelOfAgent = new AgentModel(); //instantiate based on above
  locations = turf.random('points', numAgents, {
    bbox: [-75.1867, 39.9900, -75.1467, 39.9200]
  });

  for (var j = 0; j < numAgents; j++) {
    agents[j] = {
      id: j,
      time: 0,
      age: random.integer(18, 65),
      moveRate: random.real(0.2, 5), //miles per day
      succeptible: true,
      infectious: false,
      recovered: false,
      responseProb: 0,
      sociablility: random.real(0, 30), //how many potential contacts per day
      pathogenLoad: 0,
      location: locations.features[j]
    };
    agents[j].location.properties.agentRefID = agents[j].id;
    //locations.features[j].properties.agentRefID = agents[j].id;
  }
  var numInfected = (numAgents * infectAtStartProp);
  for (var l = 0; l < numInfected; l++) {
    var r = random.integer(0, numAgents);
    agents[r].infectious = true;
    agents[r].succeptible = false;
    agents[r].pathogenLoad = 10000;
  }

  self.postMessage([hist, locations]);
};
