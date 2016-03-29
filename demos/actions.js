QActions = {};
//find closest in array
QActions.findClosest = function(step, agent, array, key) {
  let closest = 1e15;
  array.forEach(function(d) {
    let dist = agent.mesh.position.distanceTo(d.mesh.position);
    if (dist < closest) {
      closest = dist;
      agent[key] = d;
    }
  })
}

//move randomly
QActions.move = function(step, agent) {
  var dx = step * (agent.movePerDay * random.real(-1, 1) + (agent.prevX * 0.90));
  var dy = step * (agent.movePerDay * random.real(-1, 1) + (agent.prevY * 0.90));
  agent.mesh.position.y += dx;
  agent.mesh.position.x += dy;
  agent.mesh.rotation.z = Math.atan2(dx, dy);
  agent.prevX = dx / step;
  agent.prevY = dy / step;
};

QActions.moveTo = function(step, agent, destination) {
  var d = step * agent.movePerDay;
  if (agent.mesh.position.distanceTo(destination.mesh.position) > d) {
    let dir = Math.atan2(destination.mesh.position.x - agent.mesh.position.x, destination.mesh.position.y - agent.mesh.position.y);

    let dVec = new THREE.Vector3(Math.sin(dir), Math.cos(dir), 0);
    agent.mesh.position.x += dVec.x * d;
    agent.mesh.position.y += dVec.y * d;
  }
};

//move randomly within a rectangle
QActions.moveWithin = function(step, agent) {
  var boundary = boundaries[agent.boundaryGroup];
  var maxDistPerDay = 500;
  var individualRate = maxDistPerDay - (Math.abs(43 - agent.age) / 43 * maxDistPerDay) + 3e-4;
  var dx = step * (random.real(-1, 1) * individualRate + (agent.prevX * 0.98));
  var dy = step * (random.real(-1, 1) * individualRate + (agent.prevY * 0.98));
  var nextX = agent.mesh.position.x + dx;
  var nextY = agent.mesh.position.y + dy;
  if (nextX > boundary.right) {
    dx = 0;
  }
  if (nextX < boundary.left) {
    dx = 0;
  }
  if (nextY > boundary.top) {
    dy = 0;
  }
  if (nextY < boundary.bottom) {
    dy = 0;
  }
  agent.mesh.position.x += dx;
  agent.mesh.position.y += dy;
  agent.mesh.rotation.z = Math.atan2(dx, dy);
  agent.prevX = dx / step;
  agent.prevY = dy / step;
};

//move randomly using geo solvers
QActions.geoMove = function(step, agent) {
  var randomBearing = random.integer(-180, 180);
  var dest = turf.destination(agent.location, step * agent.movePerDay, randomBearing, distUnits);
  agent.location = dest;
};

//move to a desination
QActions.geoMoveTo = function(step, agent, destination) {
  var bearing = turf.bearing(agent.location, destination.location);
  var distance = turf.distance(agent.location, destination.location, distUnits);
  if (distance > agent.movePerDay * step) {
    var dest = turf.destination(agent.location, step * agent.movePerDay, bearing, distUnits);
    agent.location = dest;
  }
};

//contact using three raycasting
QActions.contact = function(step, agent) {
  let contactAttempts = agent.contactAttempts * step;
  for (var j = 0; j < contactAttempts; j++) {
    let dir = new THREE.Vector3(random.real(-1, 1), random.real(-1, 1), 0);
    raycaster.set(agent.mesh.position, dir);
    let intersects = raycaster.intersectObjects(scene.children);
    intersects.forEach(function(d) {
      if (d.object.type === 'agent') {
        let contactedAgent = agents[d.object.qId];
        if (contactedAgent.states.illness === 'succeptible') {
          contactedAgent.pathogenLoad += jStat.normal.inv(random.real(0, 1), pathogen.shedRate * step, pathogen.shedRate * step);
          contactedAgent.lastInfectedContact = agent.id;
          contactedAgent.responseProb = pathogen[pathogen.bestFitModel](contactedAgent.pathogenLoad);
        }
      }
    });
  }
};

//contact using turf within
QActions.geoContact = function(step, agent) {
  var contactPoint;
  var buffer = turf.buffer(agent.location, step * agent.movePerDay, distUnits);
  var agentsWithinBuffer = turf.within(locations, buffer);
  var numContacts = Math.round(agent.physContact * step);
  if (agentsWithinBuffer.features.length > 1) {
    for (var i = 0; i < numContacts; i++) {
      var rand = random.integer(0, agentsWithinBuffer.features.length - 1);
      var randContactId = agentsWithinBuffer.features[rand].properties.agentRefID;
      var contactedAgent = environment.getAgentById(randContactId);
      if (contactedAgent.states.illness === 'succeptible') {
        contactedAgent.pathogenLoad += pathogen.shedRate * step;
        contactedAgent.lastInfectedContact = agent.id;
        contactedAgent.responseProb = pathogen.doseResponse(contactedAgent.pathogenLoad);
      }
    }
  }
};
QActions.excrete = function(step, agent, destination) {
  destination.status += agent.gPerDayExcrete * 0.001;
  destination.pathConc += agent.gPerDayExcrete * step / (destination.capacity * 1000);
  agent.needsBathroom = 0;
  if(destination.status > destination.capacity){
    agent.pathogenLoad += destination.pathConc * 0.05;
  }
  destination.mesh.material.color.r = destination.status / destination.capacity;
  destination.mesh.material.color.b = 1 - destination.status / destination.capacity;
  destination.mesh.material.color.g = destination.status / destination.capacity;
};
QActions.checkWater = function(step, agent) {
  if (agent.waterAvailable < 1) {
    actions.getWater(step, agent);
  } else {
    actions.drink(step, agent);
  }
};
QActions.drink = function(step, agent) {
  agent.waterAvailable -= agent.dailyWaterRequired * step;
  agent.pathogenLoad += agent.waterPathConcentration * step;
  agent.needsBathroom += agent.dailyWaterRequired * step / (agent.dailyWaterRequired * 0.3)
};
QActions.getWater = function(step, agent, watersource) {
  agent.waterAvailable += agent.dailyWaterRequired * 0.333; //needs to get water 3 times a day
  agent.waterPathConcentration += watersource.pathConc * (agent.waterAvailable / 1000);
};
