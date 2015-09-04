importScripts('../bower_components/random/lib/random.min.js', "statemachine-loc.js", "../qepikit.js", "libs/jstat.min.js", "../node_modules/turf/turf.min.js");
var random = new Random(Random.engines.mt19937().seedWithArray([0x12345678, 0x90abcdef]));
var distUnits = 'miles';
self.onmessage = function(initEvent) {
  var data = initEvent.data;
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
    name: 'recovered',
    from: 'infectious',
    to: 'recovered'
  }];

  conditions = {
    'exposure': {
      key: 'pathogenLoad',
      value: 0,
      check: QEpiKit.Utils.gt
    },
    'incubated': {
      key: 'pathogenLoad',
      value: 1000,
      check: QEpiKit.Utils.gtEq
    },
    'recovered': {
      key: 'pathogenLoad',
      value: 0,
      check: QEpiKit.Utils.ltEq
    },
    'hospitilization': {
      key: 'hospProb',
      value: random.real(0, 1),
      check: QEpiKit.Utils.gtEq
    }

  };

  states = {
    'succeptible': function(step, person) {
      actions.move(step, person);
    },
    'exposed': function(step, person) {
      person.pathogenLoad += 100 * step;
      actions.move(person);
      nbPatch[person.homePatch].encounter(person, {
        key: 'current',
        value: 'succeptible',
        check: QEpiKit.Utils.equalTo
      }, undefined, 'current');
    },
    'infectious': function(step, person) {
      var xDis, yDis;
      person.pathogenLoad -= pathogen.recoveryRate * step;
    },
    'hospitalized': function(step, person) {
      person.pathogenLoad -= pathogen.recoveryRate * 1.1 * step;
    },
    'recovered': function(step, person) {
      actions.move(step,person);
    }
  };

  actions = {
    'move': function(step, person) {
      var randomBearing = random.integer(-180, 180);
      var dest = turf.destination(person.location, step * person.moveRate, randomBearing, distUnits);
      person.location = dest;
    },
    'goTo': function(step, patch, person) {
      var bearing = turf.bearing(person.location, patch.location);
      var distance = turf.distance(person.locatio, patch.location, distUnits);
      if (distance > person.moveRate) {
        var dest = turf.destination(person.location, step * person.moveRate, bearing, distUnits);
        person.location = dest;
      }
    }
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
    console.log("starting");
    duration = 7; //7 days
    step = 1 / 24; //do each hour
    numAgents = 1000;
    infectAtStartProp = 0.003;
    locations = turf.random('points', numAgents, {
      bbox: [-75.1867, 39.9900, -75.1467, 39.9200]
    });
    var loc;
    wpPatches = {};
    for (var i = 0; i < workplaces.features.length; i++) {
      loc = workplaces.features[i];
      wpPatches[loc.properties.name] = new QEpiKit.ContactPatch(loc.properties.name, loc.properties.capacity);
    }

    schoolPatches = {};
    for (var ii = 0; ii < schools.features.length; ii++) {
      loc = schools.features[ii];
      schoolPatches[loc.properties.name] = new QEpiKit.ContactPatch(loc.properties.name, loc.properties.capacity);
    }

    nhPatches = {};
    for (var k = 0; k < neighborhoods.features.length; k++) {
      loc = neighborhoods.features[k];
      nhPatches[loc.properties.name] = new QEpiKit.ContactPatch(loc.properties.name, loc.properties.capacity);
    }

    for (var j = 0; j < numAgents; j++) {
      agents[j] = {
        id: j,
        time: 0,
        age: random.integer(18, 65),
        moveRate: random.real(0.2, 5), //miles per day
        current: 'succeptible',
        responseProb: 0,
        sociablility: random.real(0, 30), //how many potential contacts per day
        pathogenLoad: 0,
        pathogenShedding: random.integer(1e7, 1e8), //shed per day
        location: locations.features[j]
      };

      agents[j].location.properties.agentRefID = agents[j].id;
      if (agents[j].age < 20) {
        var ns = turf.nearest(agents[j].location, schools);
        schoolPatches[ns.properties.name].assign(agents[j]);
        agents[j].occupationPatch = ns.properties.name;
      }
      if (agents[j].age >= 20) {

        var nw = turf.nearest(agents[j].location, workplaces);
        wpPatches[nw.properties.name].assign(agents[j]);
        agents[j].occupationPatch = nw.properties.name;
      }
      var h = turf.nearest(agents[j].location, neighborhoods);
      nhPatches[h.properties.name].assign(agents[j]);
      agents[j].homePatch = h.properties.name;
    }
    var numInfected = (numAgents * infectAtStartProp);
    for (var l = 0; l < numInfected; l++) {
      var r = random.integer(0, numAgents);
      agents[r].current = 'infectious';
      agents[r].pathogenLoad = 10000;
    }
    Environment = new QEpiKit.Environment(agents, [], [], function() {
      return random.real(0, 1);
    });
    SEIRMachine = new QEpiKit.StateMachine('SEIRMachine', states, transitionMap, conditions, agents);
    Environment.add(SEIRMachine);
    Environment.run(step, duration, 1);
    console.log(Environment.history);
    self.postMessage([Environment.history]);
  };
  //run when called
  init();
};
