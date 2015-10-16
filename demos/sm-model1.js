importScripts("../qepikit.min.js");

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
    //actions.goTo(step, patch, person);
  },
  'atHome': function(step, person) {
    //actions.goTo(step, nhPatches[person.homePatch], person);
  },
  'sleeping': function(step, person) {},
  'succeptible': function(step, person) {
    person.pathogenLoad -= person.pathogenLoad * 0.025 * step;
  },
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
  'goTo': function(step, patch, person) {
    var bearing = turf.bearing(person.location, patch.location);
    var distance = turf.distance(person.location, patch.location, distUnits);
    if (distance > person.moveRate) {
      var dest = turf.destination(person.location, step * person.moveRate, bearing, distUnits);
      person.location = dest;
    }
  }
};
conditions = {};//empty for now.
Model = new QEpiKit.StateMachine('fluStateMachine', states, transitionMap, conditions, []);
