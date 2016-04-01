//using a web worker to avoid blocking the main thread is recommended.
importScripts('../bower_components/random/lib/random.min.js', "libs/jstat.min.js", "../node_modules/turf/turf.min.js","../qepikit.js","base-example1.js");

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
  environment.remove(model.id);
  //set defaults
  experimentVars = {
    N50:9.45e4,
    shedRate: 0.015,
    recoveryRate : 6 / step,
    numberOfAgents: 5000,
    infectAtStart: 0.01
  };
  //then set the value you're testing for this run
  experimentVars[experiment.plans[run].param] = experiment.plans[run].value;

  pathogen = {
    N50: experimentVars.N50,
    shedRate: experimentVars.shedRate,
    doseResponse: function(dose) {
      var response = 1 - Math.pow((1 + (dose / experimentVars.N50) * (Math.pow(2, (1 / 5.81e-1)) - 1)), (-5.81e-1));
      return response;
    }
  };

  agents = genPop(experimentVars.numberOfAgents);

  model.data = agents;
  environment.add(model);

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
    experiment: experiment.plans[run].param + "-" + experiment.plans[run].value,
    seed: seed,
    succeptible: 0,
    infectious: 0,
    recovered: 0,
  };

  self.postMessage(['progress', record]);
  //add more stuff
  return record;
};
var step = 1/24;
var duration = 30;
var model = Model;//defined in a seperate file. This is how the agents behave.
var environment = new QEpiKit.Environment(resources, events, facilities, 'random', function() {
  return random.real(0, 1);
});
environment.add(model);

var experiment = new QEpiKit.Experiment(environment, prepare, report);
//these are the parameters that will be tested systematically
var expParams = {
  shedRate: [0.01, 0.03, 0.05],
  recoveryRate : [ 4 / step, 6 / step, 10 / step]
};
//create the experiment plans. how many runs each param.
var perParam = 1;
experiment.sweep(expParams, perParam);
//start the experiment for: number of runs, by step (days), until time
experiment.start(experiment.plans.length, step, duration);
//do something with the results
self.postMessage(['complete', experiment.experimentLog, QEpiKit.ContactPatch.WIWArray]);
