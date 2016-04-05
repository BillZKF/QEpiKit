states = {
  'succeptible': function(step, agent) {
    //console.log(agent.pathogenLoad);
    if(agent.type === 'spatial'){
      agent.mesh.material.color.set(0x00ff00);
    }
    agent.timeRecovered = 0;
    agent.timeInfectious = 0;
  },
  'exposed': function(step, agent) {
    if(agent.type === 'spatial'){
      agent.mesh.material.color.set(0xff00ff);
    }
    if (agent.pathogenLoad > 1) {
      agent.responseProb = pathogen[pathogen.bestFitModel](agent.pathogenLoad);
      agent.pathogenLoad = agent.pathogenLoad * (1 - pathogen.decayRate * step);
    } else {
      agent.responseProb = 0;
      agent.pathogenLoad = 0;
    }
  },
  'infectious': function(step, agent) {
    if(typeof infectious === 'number'){
      infectious++;
    }

    agent.timeInfectious += jStat.normal.inv(random.real(0, 1), 1 * step, step);
    if(pathogen.personToPerson){
      if(agent.type === 'geospatial'){
        QActions.geoContact(step, agent);
      } else if(agent.type === 'spatial') {
        agent.mesh.material.color.set(0xff0000);
        QActions.contact(step, agent);
      } else {
        agent.mesh.material.color.set(0xff0000);
        QActions.contactDis(step, agent);
      }
    }
  },
  'removed': function(step, agent) {
    if(agent.type === 'spatial'){
      agent.mesh.material.color.set(0x0000ff);
    }
    if (agent.pathogenLoad > 2) {
      agent.pathogenLoad -= pathogen.decayRate * Math.log(agent.pathogenLoad) * step;
    } else {
      agent.pathogenLoad = 0;
    }
    agent.timeRecovered += 1 * step;
  }
};

//at each step, check if any of these conditions are met.
conditions = {
  'exposure': {
    key: 'pathogenLoad',
    value: 0,
    check: QEpiKit.Utils.gt
  },
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
  },
  'resucceptible': {
    key: 'timeRecovered',
    value: pathogen.mutationTime,
    check: QEpiKit.Utils.gt
  }
};

//transitions specify what happens if a condition is met.
transitions = [{
  name: 'exposure',
  from: 'succeptible',
  to: 'exposed'
}, {
  name: 'infection',
  from: 'exposed',
  to: 'infectious'
}, {
  name: 'recovery',
  from: 'infectious',
  to: 'removed'
}, {
  name: 'resucceptible',
  from: 'removed',
  to: 'succeptible'
}];
