importScripts('../bower_components/random/lib/random.min.js', "../qepikit.min.js", "libs/jstat.min.js", "../node_modules/turf/turf.min.js");
var random = new Random(Random.engines.mt19937().seedWithArray([0x12345678, 0x90abcdef]));
var distUnits = 'miles';
self.onmessage = function(initEvent) {
  var data = initEvent.data;
  var AgentModel = function() {
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
            if(contactedAgent.succeptible === true){
              contactedAgent.pathogenLoad += agent.pathogenShedding * step;
              contactedAgent.responseProb = pathogen.doseResponse(contactedAgent.pathogenLoad);
              if (contactedAgent.responseProb >= random.real(0, 1)) {
                contactedAgent.succeptible = false;
                contactedAgent.infectious = true;
                contactedAgent.moveRate = 0.25;
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

  var agents = [];
  var pathogen = {
    recoveryRate: 20000,
    doseResponse: function(dose) {
      //source: http://qmrawiki.canr.msu.edu/index.php/Influenza:_Dose_Response_Models
      var response = 1 - Math.pow((1 + (dose / 9.45e5) * (Math.pow(2, (1 / 5.81e-1)) - 1)), (-5.81e-1));
      return response;
    }
  };
  var init = function() {
    duration = 7; //7 days
    step = 1 / 24; //do each hour
    numAgents = 1000;
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
        responseProb:0,
        sociablility: random.real(0, 30), //how many potential contacts per day
        pathogenLoad: 0,
        pathogenShedding: random.integer(1e7, 1e8),//shed per day
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
    var t = 0, hist = [];
    while (t <= duration) {
      for (var k = 0; k < agents.length; k++) {
        modelOfAgent.update(step, agents[k]);
      }
      var rem = Math.round(t * 1000);
      if(rem % 1000 === 0){
        var copy = JSON.parse(JSON.stringify(agents));
        hist = hist.concat(copy);
      }
      t += step;
    }

    self.postMessage([hist, locations]);
  };
  //run on load
  init();
};
