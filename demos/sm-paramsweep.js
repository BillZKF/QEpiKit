//using a web worker to avoid blocking the main thread is recommended.
importScripts('../bower_components/random/lib/random.min.js', "libs/jstat.min.js", "../node_modules/turf/turf.min.js","../qepikit.js","sm-model1.js","sm-genpop1.js");

//use a mersene twister for pseudo-random number generation
var startSeed = 0x12345678;
var seed = startSeed;
var random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));

//these arrays will be populated in prepare function
var agents = [];
var resources = [];
var facilities = [];
var events = [];
var distUnits = 'miles';

//before each run of the experiment, do this.
var prepare = function(run) {
  //set defaults
  experimentVars = {
    schoolProb: 0.08,
    workProb: 0.025,
    neighborhoodProb: 0.005,
    N50:9.45e4,
    peak: 9.45e4,
    shedRate: 0.015,
    recoveryRate : 0.25,
    numberOfAgents: 100,
    infectAtStart: 0.01
  };
  //then set the value you're testing for this run
  experimentVars[experiment.plans[run].param] = experiment.plans[run].value;

  pathogen = {
    N50: experimentVars.N50,
    shedRate: experimentVars.shedRate,
    productionFunction: function(load) {
      var y = Math.pow(load / experimentVars.peak, 2) / Math.pow(2, 2);
      return load + (y * experimentVars.peak * step);
    }, //peaks in two days
    recoveryFunction: function(load) {
      var y = experimentVars.N50 * experimentVars.recoveryRate;
      return load - (y * step);
    }, //takes about six days
    doseResponse: function(dose) {
      var response = 1 - Math.pow((1 + (dose / experimentVars.N50) * (Math.pow(2, (1 / 5.81e-1)) - 1)), (-5.81e-1));
      return response;
    }
  };
  schoolEncProb = function(a, b) {
    return (15 - Math.abs(a.age - b.age)) / 15 * experimentVars.schoolProb;
  };
  workEncProb = function(a, b) {
    return (44 - Math.abs(a.age - b.age)) / 44 * experimentVars.schoolProb;
  };
  neighborhoodEncProb = function(a, b) {
    return (31 - Math.abs(a.age - 31)) / 31 * experimentVars.neighborhoodProb;
  };

  agents = genPop(experimentVars.numberOfAgents);

  numInfected = (experimentVars.numberOfAgents * experimentVars.infectAtStart);
  for (var l = 0; l < numInfected; l++) {
    var r = random.integer(0, experimentVars.numberOfAgents - 1);
    agents[r].pathogenLoad = random.real(4e3, 4e4);
    agents[r].states.illness = 'exposed';

  }
  actions.encounter =  function(target, source) {
    var draw = random.real(0, 1);
    if (target[source.id] >= draw) {
      var dose = target.properties.pathogenLoad + (source.pathogenLoad * pathogen.shedRate);
      target.properties.responseProb = pathogen.doseResponse(dose);
      target.properties.pathogenLoad = dose;
      return target.properties.responseProb;
    } else {
      return target.properties.responseProb;
    }
  };

  model.conditions = {
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
  environment.agents = agents;
  model.data = agents;

  QEpiKit.ContactPatch.WIWArray = [];
  //iterate the random seed for next run
  seed++;
  if(run % perParam === 0){
    seed = startSeed;
  }
  random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
};

//after each run of the experiment, report out
var report = function(run) {
  var record = {
    run: run,
    experiment: experiment.plans[run].param + " " + experiment.plans[run].value,
    seed: seed,
    succeptible: 0,
    exposed: 0,
    infectious: 0,
    hospitalized: 0,
    recovered: 0,
    meanPathLoad: 0
  };
  var totPathLoad = 0;
  environment.agents.forEach(function(d) {
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
  record.numberOfEncouters = QEpiKit.ContactPatch.WIWArray.length;
  record.WIW = {};
  record.infectionsPerEncounter = (record.exposed + record.infectious + record.hospitalized + record.recovered - (experimentVars.infectAtStart * environment.agents.length))/ record.numberOfEncouters;
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
    record.WIW[d.name].infectionsPerEncounter = record.infectionsPerEncounter;
  });

  record.meanPathLoad = totPathLoad / environment.agents.length;
  self.postMessage(['progress', record.WIW]);
  //add more stuff
  return record;
};
var step = 1/24;
var duration = 30;
var model = Model;//define this in a seperate file. This is how the agents behave.
var environment = new QEpiKit.Environment(agents, resources, events, function() {
  return random.real(0, 1);
});
environment.add(model);

var experiment = new QEpiKit.Experiment(environment, prepare, report);
//these are the parameters that will be tested systematically
var expParams = {
  schoolProb: [0.04, 0.08, 0.12],
  workProb: [0.0125, 0.025, 0.0375],
  neighborhoodProb: [0.001, 0.01, 0.08],
  N50: QEpiKit.Utils.arrayFromRange(9.45e4 * 0.75, 9.45e4 * 1.25, 9.45e4 * 0.25),
  peak: [9.4e4, 9.4e5],
  shedRate: [0.01, 0.03, 0.05],
  recoveryRate : [ 1/6, 0.25, 0.4]
};
//create the experiment plans. how many runs each param.
var perParam = 10;
experiment.sweep(expParams, perParam);
//start the experiment for: number of runs, by step (days), until time
experiment.start(experiment.plans.length, step, duration);
//do something with the results
self.postMessage(['complete', experiment.experimentLog, QEpiKit.ContactPatch.WIWArray]);
