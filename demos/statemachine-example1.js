importScripts('../bower_components/random/lib/random.min.js', "statemachine-loc.js", "../qepikit.js", "libs/jstat.min.js", "../node_modules/turf/turf.min.js");

var schoolEncProb = function(a, b) {
  return (15 - Math.abs(a.age - b.age)) / 15 * 0.08;
};
var workEncProb = function(a, b) {
  return (23 - Math.abs(a.age - b.age)) / 23 * 0.05;
};
var neighborhoodEncProb = function(a, b) {
  return (31 - Math.abs(a.age - 31)) / 31 * 0.015;
};

var transitionMap = [{
  name: 'exposure',
  from: 'succeptible',
  to: 'exposed'
}, {
  name: 'incubated',
  from: 'exposed',
  to: 'infectious'
}, {
  name: 'hospitalization',
  from: 'exposed',
  to: 'hospitalized'
}, {
  name: 'recovery',
  from: ['infectious', 'hospitalized'],
  to: 'recovered'
}, {
  name: 'goToActivity',
  from: 'atHome',
  to: 'atActivity'
}, {
  name: 'goHome',
  from: 'atActivity',
  to: 'atHome'
}, {
  name: 'goToSleep',
  from: 'atHome',
  to: 'sleeping'
}, {
  name: 'wakeUp',
  from: 'sleeping',
  to: 'atHome',
}];

conditions = {};

atHomeSucceptible = JSON.stringify({
  'illness': 'succeptible',
  'activity': 'atHome'
});

atActivitySucceptible = JSON.stringify({
  'activity': 'atActivity',
  'illness': 'succeptible'
});

states = {
  'atActivity': function(step, person) {
    var patch;
    if (person.age < 20) {
      patch = schoolPatches[person.occupationPatch];
    } else {
      patch = wpPatches[person.occupationPatch];
    }
    actions.goTo(step, patch, person);
  },
  'atHome': function(step, person) {
    actions.goTo(step, nhPatches[person.homePatch], person);
  },
  'sleeping': function(step, person) {},
  'succeptible': function(step, person) {},
  'exposed': function(step, person) {
    person.pathogenLoad = pathogen.productionFunction(person.pathogenLoad);
    if (person.states.activity === 'atHome') {
      nhPatches[person.homePatch].encounters(person, {
          key: 'states',
          value: atHomeSucceptible,
          check: QEpiKit.Utils.equalTo
        },
        actions.encounter, 'responseProb', true
      );
    } else if (person.states.activity !== 'sleeping') {
      var patch;
      if (person.age < 20) {
        patch = schoolPatches[person.occupationPatch];
      } else {
        patch = wpPatches[person.occupationPatch];
      }
      patch.encounters(person, {
          key: 'states',
          value: atActivitySucceptible,
          check: QEpiKit.Utils.equalTo
        },
        actions.encounter, 'responseProb', true
      );
    }
  },
  'infectious': function(step, person) {
    person.pathogenLoad = Math.round(pathogen.recoveryFunction(person.pathogenLoad));
  },
  'hospitalized': function(step, person) {
    person.pathogenLoad = Math.round(pathogen.recoveryFunction(person.pathogenLoad) * 0.95);
  },
  'recovered': function(step, person) {}
};

actions = {
  'move': function(step, person) {
    var randomBearing = random.integer(-180, 180);
    var dest = turf.destination(person.location, step * person.moveRate, randomBearing, distUnits);
    person.location = dest;
  },
  'goTo': function(step, patch, person) {
    var bearing = turf.bearing(person.location, patch.location);
    var distance = turf.distance(person.location, patch.location, distUnits);
    if (distance > person.moveRate) {
      var dest = turf.destination(person.location, step * person.moveRate, bearing, distUnits);
      person.location = dest;
    }
  },
  encounter: function(target, source) {
    var draw = random.real(0, 1);
    if (target[source.id] >= draw) {
      var dose = target.properties.pathogenLoad + (target.properties.pathogenLoad * pathogen.shedRate);
      target.properties.responseProb = pathogen.doseResponse(dose);
      target.properties.pathogenLoad = target.properties.pathogenLoad + (pathogen.shedRate * source.pathogenLoad);
      return target.properties.responseProb;
    } else {
      return target.properties.responseProb;
    }
  }
};
var distUnits = 'miles',
  agents = [],
  pathogen, loc, startSeed = 0x12345678,
  seed = startSeed, rate = 0;
var prepFunction = function() {
  seed += 1;
  rate = 0.01885;
  random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
  numAgents = 300;
  infectAtStartProp = 0.01;
  locations = turf.random('points', numAgents, {
    bbox: [-75.1867, 39.9900, -75.1467, 39.9200]
  });

  pathogen = {
    N50: 9.45e4,
    shedRate: rate,
    productionFunction: function(load) {
      var y = Math.pow(load / pathogen.N50, 2) / Math.pow(2, 2);
      return load + (y * pathogen.N50 * step);
    }, //peaks in two days - take to 9.45e5 in two from average dose
    recoveryFunction: function(load) {
      var y = pathogen.N50 * 1 / 4;
      return load - (y * step);
    }, //takes about six days
    doseResponse: function(dose) {
      var response = 1 - Math.pow((1 + (dose / pathogen.N50) * (Math.pow(2, (1 / 5.81e-1)) - 1)), (-5.81e-1));
      return response;
    }
  };


  fluStateMachine.conditions = {
    'incubated': {
      key: 'pathogenLoad',
      value: pathogen.N50,
      check: QEpiKit.Utils.gtEq
    },
    'recovery': {
      key: 'pathogenLoad',
      value: pathogen.N50 * 0.2,
      check: QEpiKit.Utils.ltEq
    },
    'exposure': {
      key: 'responseProb',
      value: function(){return random.real(0.0001, 1);},
      check: QEpiKit.Utils.gt
    },
    'hospitalization': {
      key: 'hospProb',
      value: function(){return random.real(0, 1);},
      check: QEpiKit.Utils.gtEq
    },
    'goToActivity': {
      key: 'activitySchedule',
      value: function() {
        return environment.timeOfDay;
      },
      check: QEpiKit.Utils.inRange
    },
    'goHome': {
      key: 'activitySchedule',
      value: function() {
        return environment.timeOfDay;
      },
      check: QEpiKit.Utils.notInRange
    },
    'goToSleep': {
      key: 'sleepSchedule',
      value: function() {
        var timeOfDay;
        if (environment.timeOfDay < 0.5) {
          timeOfDay = 1 + environment.timeOfDay;
        } else {
          timeOfDay = environment.timeOfDay;
        }
        return timeOfDay;
      },
      check: QEpiKit.Utils.inRange
    },
    'wakeUp': {
      key: 'sleepSchedule',
      value: function() {
        var timeOfDay;
        if (environment.timeOfDay < 0.5) {
          timeOfDay = 1 + environment.timeOfDay;
        } else {
          timeOfDay = environment.timeOfDay;
        }
        return timeOfDay;
      },
      check: QEpiKit.Utils.notInRange
    }
  };

  wpPatches = {};
  for (var i = 0; i < workplaces.features.length; i++) {
    loc = workplaces.features[i];
    wpPatches[loc.properties.name] = new QEpiKit.ContactPatch(loc.properties.name, loc.properties.capacity);
    wpPatches[loc.properties.name].location = loc;
  }

  schoolPatches = {};
  for (var ii = 0; ii < schools.features.length; ii++) {
    loc = schools.features[ii];
    schoolPatches[loc.properties.name] = new QEpiKit.ContactPatch(loc.properties.name, loc.properties.capacity);
    schoolPatches[loc.properties.name].location = loc;
  }

  nhPatches = {};
  for (var k = 0; k < neighborhoods.features.length; k++) {
    loc = neighborhoods.features[k];
    nhPatches[loc.properties.name] = new QEpiKit.ContactPatch(loc.properties.name, loc.properties.capacity);
    nhPatches[loc.properties.name].location = loc;
  }

  for (var j = 0; j < numAgents; j++) {
    agents[j] = {
      id: j,
      time: 0,
      age: random.integer(4, 65),
      moveRate: random.real(0.2, 5), //miles per day
      states: {
        'illness': 'succeptible',
        'activity': 'atHome'
      },
      responseProb: 0,
      pathogenLoad: 0, //shed per hour
      location: locations.features[j]
    };
    agents[j].hospProb = Math.pow(agents[j].age - 44, 2) * 0.0005;
    agents[j].location.properties.agentRefID = agents[j].id;
    if (agents[j].age < 20) {
      var ns = turf.nearest(agents[j].location, schools);
      schoolPatches[ns.properties.name].assign(agents[j], schoolEncProb);
      agents[j].occupationPatch = ns.properties.name;
      agents[j].activitySchedule = [0.3, 0.625];
      agents[j].sleepSchedule = [random.real(0.79, 0.96), random.real(1.2, 1.23)];
    } else {
      var nw = turf.nearest(agents[j].location, workplaces);
      wpPatches[nw.properties.name].assign(agents[j], workEncProb);
      agents[j].occupationPatch = nw.properties.name;
      agents[j].activitySchedule = [0.38, 0.75];
      agents[j].sleepSchedule = [random.real(0.84, 0.96), random.real(1.2, 1.23)];
    }
    var h = turf.nearest(agents[j].location, neighborhoods);
    nhPatches[h.properties.name].assign(agents[j], neighborhoodEncProb);
    agents[j].homePatch = h.properties.name;
  }
  numInfected = (numAgents * infectAtStartProp);
  for (var l = 0; l < numInfected; l++) {
    var r = random.integer(0, numAgents - 1);
    agents[r].pathogenLoad = random.real(4e3, 4e4);
    agents[r].states.illness = 'exposed';
  }
  fluStateMachine.data = agents;
  environment.agents = agents;
  QEpiKit.ContactPatch.WIWArray = [];
}; //prepFunction

recordFunction = function() {
  var record = {
    succeptible: 0,
    exposed: 0,
    infectious: 0,
    hospitalized: 0,
    recovered: 0,
    meanPathLoad: 0,
    pathShedRate : pathogen.shedRate
  };
  var totPathLoad = 0;
  environment.agents.map(function(d) {
    totPathLoad += d.pathogenLoad;
    switch (d.states.illness) {
      case 'succeptible':
        record.succeptible += 1;
        break;
      case 'infectious':
        record.infectious += 1;
        break;
      case 'exposed':
        record.exposed += 1;
        break;
      case 'hospitalized':
        record.hospitalized += 1;
        break;
      case 'recovered':
        record.recovered += 1;
        break;
      default:
        break;
    }
  });
  record.WIW = {};

  QEpiKit.ContactPatch.WIWArray.forEach(function(dat){
    if(typeof record.WIW[dat.name] === 'undefined'){
      record.WIW[dat.name] = {};
      record.WIW[dat.name].total = 0;
      for(var ii = 0; ii < duration; ii++){
        record.WIW[dat.name][ii] = 0;
      }
    }
  });
  QEpiKit.ContactPatch.WIWArray.forEach(function(d){
    record.WIW[d.name][Math.floor(d.time)] += 1;
    record.WIW[d.name].total = record.WIW[d.name].total + 1;
  });
  record.meanPathLoad = totPathLoad / environment.agents.length;
  record.numberOfEncouters = QEpiKit.ContactPatch.WIWArray.length;
  record.infectionsPerEncounter = (record.exposed + record.infectious + record.hospitalized + record.recovered - (infectAtStartProp * environment.agents.length))/ record.numberOfEncouters;
  self.postMessage(['progress', record.WIW, record.infectionsPerEncounter]);
  return record;
};

self.onmessage = function(initEvent) {
  runs = 100; //total experiment runs
  step = 1 / 24; //do each hour
  duration = 30; //days
  environment = new QEpiKit.Environment(agents, [], [], function() {
    return random.real(0, 1);
  });
  fluStateMachine = new QEpiKit.StateMachine('fluStateMachine', states, transitionMap, conditions, agents);
  environment.add(fluStateMachine);
  experimentRunner = new QEpiKit.Experiment(environment, prepFunction, recordFunction);
  experimentRunner.start(runs, step, duration);
  self.postMessage(['complete',experimentRunner.experimentLog, QEpiKit.ContactPatch.WIWArray]);
};
