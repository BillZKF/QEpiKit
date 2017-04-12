QActions = {};
//check if the agent has exceeded the duration amount for an action
QActions.timeout = function (agent, step, key, duration) {
  if (agent[key] >= duration) {
    agent[key] = 0; //reset
    return true;
  } else {
    agent[key] += step;
    return false;
  }
};

//shorthand to schedule an event at time
QActions.timeoutEvent = function (agent, step, time, callback) {
  let event = {
    name: 'event-for-' + agent.id,
    at: time,
    trigger: function () {
      callback(agent);
    }
  };
  events.schedule([event]);
  environment.eventsQueue = events.queue;
};

QActions.distance = function(a, b){
  let sqDist = Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) + Math.pow(b.z - a.z, 2);
  return Math.sqrt(sqDist);
}


//find closest in array
QActions.findClosest = function (agent, step, array, key) {
  let closest = 1e15;
  array.forEach(function (d) {
    let dist = QActions.distance(agent.position, d.position);
    if (dist < closest) {
      closest = dist;
      agent[key] = d;
    }
  });
}

//find n closest in array. example: find the second closest bathroom.
QActions.findNClosest = function (step, n, agent, array, key) {
  let closest = 1e15;
  let dist = array.map(function (d) {
    return QActions.distance(agent.position, d.position);
  });
  let sortedDist = JSON.parse(JSON.stringify(dist));
  sortedDist.sort(function (a, b) {
    return a - b;
  });

  let nClosest = dist.indexOf(sortedDist[n - 1]);
  return array[nClosest];
}

//check return subset of array of elements within distance
QActions.within = function (agent, step, array, distance) {
  let within = [];
  for (let i = 0; i < array.length; i++) {

    if (QActions.distance(agent.position, array[i].position) < distance) {
      if (array[i].id !== agent.id) {
        within.push(array[i]);
      }
    }
  }
  return within;
}

QActions.useFacility = function (agent, step, facilities, key, success) {
  //first, think of the closest bathroom
  if (agent[key] === null) {
    QActions.findClosest(agent, step, facilities, key);
  }
  let distToFacil = QActions.distance(agent.position, agent[key].position);
  if (!agent.inQueue && distToFacil < (agent[key].queue.length + 1) * 10) {
    let nChoice = 1;
    while (!agent.inQueue && nChoice < facilities.length) {
      let waitLine = agent[key].queue.length * agent[key].wait;
      let waitTravel = distToFacil / agent.movePerDay;
      //if not inline see if the wait is long
      if (waitLine < waitTravel) {
        agent[key].queue.push(agent.id);
        agent.inQueue = true;
      } else {
        //if it is pick a different bathroom;
        nChoice++;
        agent[key] = QActions.findNClosest(step, nChoice, agent, facilities);
        distToFacil = QActions.distance(agent.position, agent[key].position);
      }
    }
  }
  if (agent.inQueue) {
    //once in line
    if (agent[key].queue[0] === agent.id) {
      if (distToFacil < 0.1) {
        if (QActions.timeout(agent, step, 'useTime', agent[key].wait)) {
          success(agent, step, agent[key]);
          agent[key].queue.shift();
          agent.inQueue = false;
          agent[key] = null;
        }
      } else {
        QActions.moveTo(agent, step, agent[key]);
      }
    } else {
      QActions.waitInLine(agent, step, agent[key]);
    }
  } else {
    QActions.moveTo(agent, step, agent[key]);
  }
};

//more convincing looking random move, but it makes no sense
QActions.rmove = function (agent, step) {
  var dx = step * (agent.movePerDay * random.real(-1, 1) + (agent.prevX * 0.90));
  var dy = step * (agent.movePerDay * random.real(-1, 1) + (agent.prevY * 0.90));
  agent.position.y += dx;
  agent.position.x += dy;

  agent.mesh.position.x = agent.position.x;
  agent.mesh.position.y = agent.position.x;
  agent.prevX = dx / step;
  agent.prevY = dy / step;
};

//move randomly
QActions.move = function (agent, step) {
  let d = step * agent.movePerDay;
  let dir = Math.atan2(random.real(-0.5, 0.5) + agent.prevX * 0.5, random.real(-0.5, 0.5) + agent.prevY * 0.5);
  let dVec = {x:Math.sin(dir), y: Math.cos(dir), z: 0};
  agent.position.x += dVec.x * d;
  agent.position.y += dVec.y * d;
  agent.mesh.position.x = agent.position.x;
  agent.mesh.position.y = agent.position.y;
  agent.prevX = dVec.x;
  agent.prevY = dVec.y;
};

QActions.moveTo = function (agent, step, destination) {
  let d = step * agent.movePerDay;
  if (QActions.distance(agent.position, destination.position) > d) {
    let dir = Math.atan2(destination.position.x - agent.position.x, destination.position.y - agent.position.y);
    let dVec = {x:Math.sin(dir), y: Math.cos(dir), z: 0};
    agent.position.x += dVec.x * d;
    agent.position.y += dVec.y * d;

    agent.mesh.position.x = agent.position.x;
    agent.mesh.position.y = agent.position.x;
  } else {
    agent.position = Object.create(destination.position);
  }
};

//move randomly within a rectangle
QActions.moveWithin = function (agent, step, boundary) {
  let d = step * agent.movePerDay;
  var current = {x:agent.position.x, y: agent.position.y, z:agent.position.z};
  QActions.move(agent, step);
  if (agent.position.x > boundary.right) {
    agent.position.x = current.x;
    agent.prevX = 0;
  }
  if (agent.position.x < boundary.left) {
    agent.position.x = current.x;
    agent.prevX = 0;
  }
  if (agent.position.y > boundary.top) {
    agent.position.y = current.y;
    agent.prevY = 0;
  }
  if (agent.position.y < boundary.bottom) {
    agent.position.y = current.y;
    agent.prevY = 0;
  }
};

//move randomly using geo solvers
QActions.geoMove = function (agent, step) {
  var randomBearing = random.integer(-180, 180);
  var dest = turf.destination(agent.location, step * agent.movePerDay, randomBearing, distUnits);
  agent.movedTotal += step * agent.movePerDay;
  agent.location = dest;
};

//move to a desination
QActions.geoMoveTo = function (agent, step, destination) {
  var bearing = turf.bearing(agent.location, destination.location);
  var distance = turf.distance(agent.location, destination.location, distUnits);
  if (distance > agent.movePerDay * step) {
    var dest = turf.destination(agent.location, step * agent.movePerDay, bearing, distUnits);
    agent.location = dest;
  }
};

//contact using three raycasting
QActions.contact = function (agent, step) {
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
QActions.contactDis = function (agent, step) {
  
  let contactAttempts = agent.contactAttempts * step;
  //if step size < 1 accumalate until newAttempt > 1
  agent.newAttempt += contactAttempts;
  if (agent.newAttempt < 1) {
    //console.log(agent.newAttempt);
    contactAttempts = 0;
  } else {
    //new attempt is greater than 1
    contactAttempts = 1;
  }
  if (contactAttempts > 0) {
    agent.newAttempt = 0;
    agent.madeAttempts += 1;
    let near = QActions.within(agent, step, exp.environment.agents, step * agent.movePerDay + 1);
    if (near.length > 0) {
      for (var j = 0; j < contactAttempts; j++) {
        var rand = random.integer(0, near.length - 1);
        var contactedAgent = near[rand];
        if (typeof contactedAgent.states.illness !== 'undefined') {
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
QActions.geoContact = function (agent, step) {
  var contactPoint;
  var buffer = { type: 'FeatureCollection', features: [turf.buffer(agent.location, step * agent.movePerDay, distUnits)] };
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

QActions.excrete = function (agent, step, destination) {
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

QActions.waitInLine = function (agent, step, destination) {
  let target, placeInLine = destination.queue.indexOf(agent.id);
  if (placeInLine === 0) {
    target = destination;
  } else {
    target = environment.getAgentById(destination.queue[placeInLine - 1]);
  }
  if (QActions.distance(agent.position, target.position) > 1) {
    QActions.moveTo(agent, step, target);
  }
};
QActions.drink = function (agent, step) {
  agent.waterAvailable -= agent.dailyWaterRequired * step;
  agent.needsBathroom += agent.dailyWaterRequired * step / (agent.dailyWaterRequired * 0.3);
  if (pathogen.waterBorne) {
    agent.pathogenLoad += agent.waterPathConcentration * step;
  }
};
QActions.getWater = function (agent, step, watersource) {
  agent.waterAvailable += agent.dailyWaterRequired * 0.333; //needs to get water 3 times a day
  if (pathogen.waterBorne) {
    agent.waterPathConcentration += watersource.pathConc * agent.waterAvailable;
  }
};
QActions.checkWater = function (agent, step, watersource) {
  if (agent.waterAvailable < agent.dailyWaterRequired * step) {
    QActions.getWater(agent, step, watersource);
  } else {
    if (random.real(0, 1) > 0.75) {
      QActions.drink(agent, step);
    }
  }
};
QActions.findWater = function (agent, step, watersources, key) {
  if (agent.waterAvailable < agent.dailyWaterRequired * step) {
    QActions.findClosest(agent, step, watersources, key);
    QActions.getWater(agent, step, agent[key]);
  } else {
    if (random.real(0, 1) > 0.5) {
      QActions.drink(agent, step);
    }
  }
};
QActions.succeptible = function (agent, step) {
  if (agent.type === 'continuous') {
    agent.mesh.material.color.set(0x00ff00);
  }
  agent.timeRecovered = 0;
  agent.timeInfectious = 0;
};
QActions.exposed = function (agent, step) {
  if (agent.type === 'continuous') {
    agent.mesh.material.color.set(0xff00ff);
  }
  if (agent.pathogenLoad > 1) {
    agent.responseProb = pathogen[pathogen.bestFitModel](agent.pathogenLoad);
    agent.pathogenLoad = agent.pathogenLoad * (1 - pathogen.decayRate * step);
  } else {
    agent.responseProb = 0;
    agent.pathogenLoad = 0;
  }
};
QActions.infectious = function (agent, step) {
  if (agent.type === 'continuous') {
    agent.mesh.material.color.set(0xff0000);
  }
  if (typeof infectious === 'number') {
    infectious++;
  }
  agent.timeInfectious += jStat.normal.inv(random.real(0, 1), 1 * step, step);
  if (pathogen.personToPerson) {
    if (agent.type === 'geospatial') {
      QActions.geoContact(agent, step);
    } else {
      QActions.contactDis(agent, step);
    }
  }
};
QActions.removed = function (agent, step) {
  if (agent.type === 'continuous') {
    agent.mesh.material.color.set(0x0000ff);
  }
  if (agent.pathogenLoad > 1) {
    agent.pathogenLoad -= agent.pathogenLoad * (1 - pathogen.decayRate * step);
  } else {
    agent.pathogenLoad = 0;
    agent.responseProb = 0;
  }
  agent.timeRecovered += 1 * step;
};
