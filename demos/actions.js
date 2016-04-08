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

//find n closest in array. example: find the second closest bathroom.
QActions.findNClosest = function(step, n, agent, array, key) {
  let closest = 1e15;
  let dist = array.map(function(d) {
    return agent.mesh.position.distanceTo(d.mesh.position);
  });
  let sortedDist = JSON.parse(JSON.stringify(dist));
  sortedDist.sort(function(a, b) {
    return a - b;
  });

  let nClosest = dist.indexOf(sortedDist[n - 1]);
  return array[nClosest];
}

//check return subset of array of elements within distance
QActions.within = function(step, agent, array, distance) {
  let within = [];
  for (let i = 0; i < array.length; i++) {
    if (agent.mesh.position.distanceTo(array[i].mesh.position) < distance) {
      if (array[i].id !== agent.id) {
        within.push(array[i]);
      }
    }
  }
  return within;
}

QActions.useFacility = function(step, agent, facilities, key, success) {
  //first, think of the closest bathroom
  if (agent[key] === null) {
    QActions.findClosest(step, agent, facilities, key);
  }
  let distToFacil = agent.mesh.position.distanceTo(agent[key].mesh.position);
  if (!agent.inQueue && distToFacil < 50) {
    let nChoice = 1;
    while (!agent.inQueue && nChoice < facilities.length) {
      let waitLine = agent[key].queue.length * agent[key].wait;
      let waitTravel = distToFacil /( agent.movePerDay * step);
      //if not inline see if the wait is long
      if (waitLine < waitTravel) {
        agent[key].queue.push(agent.id);
        agent.inQueue = true;
      } else {
        //if it is pick a different bathroom;
        nChoice++;
        agent[key] = QActions.findNClosest(step, nChoice, agent, facilities);
        distToFacil = agent.mesh.position.distanceTo(agent[key].mesh.position);
      }
    }
  }
  if (agent.inQueue) {
    //once in line
    if (agent[key].queue[0] === agent.id) {
      if (distToFacil > 0.1 || agent.useTime < agent[key].wait) {
        QActions.moveTo(step, agent, agent[key]);
        agent.useTime += step;
      } else {
        success(step, agent, agent[key]);
        agent[key].queue.shift();
        agent.inQueue = false;
        agent.useTime = 0;
        agent[key] = null;
      }
    } else {
      QActions.waitInLine(step, agent, agent[key]);
    }
  } else {
    QActions.moveTo(step, agent, agent[key]);
  }
};

//more convincing looking random move, but it makes no sense
QActions.rmove = function(step, agent) {
  var dx = step * (agent.movePerDay * random.real(-1, 1) + (agent.prevX * 0.90));
  var dy = step * (agent.movePerDay * random.real(-1, 1) + (agent.prevY * 0.90));
  agent.mesh.position.y += dx;
  agent.mesh.position.x += dy;
  agent.mesh.rotation.z = Math.atan2(dx, dy);
  agent.prevX = dx / step;
  agent.prevY = dy / step;
};

//move randomly
QActions.move = function(step, agent) {
  let d = step * agent.movePerDay;
  let dir = Math.atan2(random.real(-0.5, 0.5) + agent.prevX * 0.5, random.real(-0.5, 0.5) + agent.prevY * 0.5);
  let dVec = new THREE.Vector3(Math.sin(dir), Math.cos(dir), 0);
  agent.mesh.position.x += dVec.x * d;
  agent.mesh.position.y += dVec.y * d;
  //agent.mesh.rotation.z = Math.atan2(dVec.x, dVec.y); this screws up cylinders
  agent.prevX = dVec.x;
  agent.prevY = dVec.y;
};

QActions.moveTo = function(step, agent, destination) {
  let d = step * agent.movePerDay;
  if (agent.mesh.position.distanceTo(destination.mesh.position) > d) {
    let dir = Math.atan2(destination.mesh.position.x - agent.mesh.position.x, destination.mesh.position.y - agent.mesh.position.y);
    let dVec = new THREE.Vector3(Math.sin(dir), Math.cos(dir), 0);
    agent.mesh.position.x += dVec.x * d;
    agent.mesh.position.y += dVec.y * d;
  } else {
    agent.mesh.position.copy(destination.mesh.position);
  }
};

//move randomly within a rectangle
QActions.moveWithin = function(step, agent, boundary) {
  let d = step * agent.movePerDay;
  var current = new THREE.Vector3().copy(agent.mesh.position);
  QActions.move(step, agent);
  if (agent.mesh.position.x > boundary.right) {
    agent.mesh.position.x = current.x;
    agent.prevX = 0;
  }
  if (agent.mesh.position.x < boundary.left) {
    agent.mesh.position.x = current.x;
    agent.prevX = 0;
  }
  if (agent.mesh.position.y > boundary.top) {
    agent.mesh.position.y = current.y;
    agent.prevY = 0;
  }
  if (agent.mesh.position.y < boundary.bottom) {
    agent.mesh.position.y = current.y;
    agent.prevY = 0;
  }
};

//move randomly using geo solvers
QActions.geoMove = function(step, agent) {
  var randomBearing = random.integer(-180, 180);
  var dest = turf.destination(agent.location, step * agent.movePerDay, randomBearing, distUnits);
  agent.movedTotal += step * agent.movePerDay;
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
    raycaster.far = step * agent.movePerDay + 1;
    raycaster.set(agent.mesh.position, dir);
    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      let d = intersects[0];
      if (d.object.type === 'agent') {
        let contactedAgent = environment.getAgentById(d.object.qId);
        if (contactedAgent.states.illness === 'succeptible' || contactedAgent.states.illness === 'exposed') {
          contactedAgent.pathogenLoad += jStat.normal.inv(random.real(0, 1), pathogen.shedRate, pathogen.shedRate * 0.3);
          contactedAgent.lastInfectedContact = agent.id;
          contactedAgent.responseProb = step * pathogen[pathogen.bestFitModel](contactedAgent.pathogenLoad);
        }
      }
    }
  }
};

/**
*discrete contacts using similar method to geo one below
*limits the number of contact attempts per day to the contactAttempts param (~10).
*probably could be fixed
*/
QActions.contactDis = function(step, agent) {
  let contactAttempts = agent.contactAttempts * step;
  //if step size < 1 accumalate until newAttempt > 1
  agent.newAttempt += contactAttempts;

  if (agent.newAttempt < 1) {
    contactAttempts = 0;
  }
  if (agent.newAttempt >= 1) {
    //new attempt is greater than 1
    contactAttempts = 1;
  }
  if (contactAttempts > 0) {
    agent.newAttempt = 0;
    agent.madeAttempts += 1;
    let near = QActions.within(step, agent, agents, step * agent.movePerDay + 1);
    if (near.length > 0) {
      for (var j = 0; j < contactAttempts; j++) {
        var rand = random.integer(0, near.length - 1);
        var contactedAgent = near[rand];
        if (contactedAgent.mesh.type === 'agent') {
          if (contactedAgent.states.illness === 'succeptible' || contactedAgent.states.illness === 'exposed') {
            contactedAgent.pathogenLoad += jStat.normal.inv(random.real(0, 1), pathogen.shedRate, pathogen.shedRate * 0.3);
            contactedAgent.lastInfectedContact = agent.id;
            contactedAgent.responseProb = pathogen[pathogen.bestFitModel](contactedAgent.pathogenLoad);
          }
        }
      }
    }
  }
}

//contact using turf within
QActions.geoContact = function(step, agent) {
  var contactPoint;
  var buffer = turf.buffer(agent.location, step * agent.movePerDay, distUnits);
  var agentsWithinBuffer = turf.within(locations, buffer);
  var numContacts = Math.round(agent.contactAttempts * step);
  if (agentsWithinBuffer.features.length > 1) {
    for (var i = 0; i < numContacts; i++) {
      var rand = random.integer(0, agentsWithinBuffer.features.length - 1);
      var randContactId = agentsWithinBuffer.features[rand].properties.agentRefID;
      var contactedAgent = environment.getAgentById(randContactId);
      if (contactedAgent.states.illness === 'succeptible') {
        contactedAgent.pathogenLoad += pathogen.shedRate * step;
        contactedAgent.lastInfectedContact = agent.id;
        contactedAgent.responseProb = pathogen[pathogen.bestFitModel](contactedAgent.pathogenLoad);
      }
    }
  }
};
QActions.excrete = function(step, agent, destination) {
  destination.status += agent.kgPerDayExcrete * 0.001;
  if (pathogen.fecalOral) {
    destination.pathConc += agent.pathogenLoad / agent.kgPerDayExcrete * step / (destination.capacity * 1000);
  }
  agent.needsBathroom = 0;
  if (destination.status > destination.capacity) {
    if (pathogen.fecalOral) {
      agent.pathogenLoad += random.real(0, destination.pathConc) * 0.001;
    }
  }
  destination.mesh.material.color.r = Math.min(destination.pathConc * 1000);
  destination.mesh.material.color.b = 1 - destination.status / destination.capacity;
  destination.mesh.material.color.g = destination.status / destination.capacity;
};

QActions.waitInLine = function(step, agent, destination) {
  let target, placeInLine = destination.queue.indexOf(agent.id);
  if (placeInLine === 0) {
    target = destination;
  } else {
    target = environment.getAgentById(destination.queue[placeInLine - 1]);
  }
  if (agent.mesh.position.distanceTo(target.mesh.position) > 1) {
    QActions.moveTo(step, agent, target);
  }
};
QActions.drink = function(step, agent) {
  agent.waterAvailable -= agent.dailyWaterRequired * step;
  agent.needsBathroom += agent.dailyWaterRequired * step / (agent.dailyWaterRequired * 0.3);
  if (pathogen.waterBorne) {
    agent.pathogenLoad += agent.waterPathConcentration * step;
  }
};
QActions.getWater = function(step, agent, watersource) {
  agent.waterAvailable += agent.dailyWaterRequired * 0.333; //needs to get water 3 times a day
  if (pathogen.waterBorne) {
    agent.waterPathConcentration += watersource.pathConc * agent.waterAvailable;
  }
};
QActions.checkWater = function(step, agent, watersource) {
  if (agent.waterAvailable < agent.dailyWaterRequired * step) {
    QActions.getWater(step, agent, watersource);
  } else {
    if (random.real(0, 1) > 0.75) {
      QActions.drink(step, agent);
    }
  }
};
QActions.findWater = function(step, agent, watersources, key) {
  if (agent.waterAvailable < agent.dailyWaterRequired * step) {
    QActions.findClosest(step, agent, watersources, key);
    QActions.getWater(step, agent, agent[key]);
  } else {
    if (random.real(0, 1) > 0.5) {
      QActions.drink(step, agent);
    }
  }

};
