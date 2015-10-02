//using a web worker to avoid blocking the main thread is recommended.
importScripts('../bower_components/random/lib/random.min.js', "libs/jstat.min.js", "../node_modules/turf/turf.min.js", "../qepikit.js", "sm-model1.js", "sm-genpop1.js");

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
    paramOne: 1
  };
  //then set the value you're testing for this run
  experimentVars[experiment.plans[run].param] = experiment.plans[run].value;


  agents = genPop(experimentVars.numberOfAgents);


  environment.agents = agents;
  model.data = agents;

  QEpiKit.ContactPatch.WIWArray = [];
  //iterate the random seed for next run
  seed++;
  if (run % perParam === 0) {
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

  };
  self.postMessage(['progress', record]);
  //add more stuff
  return record;
};
var step = 1 / 24;
var duration = 30;
var model = Model; //define this in a seperate file. This is how the agents behave.
var environment = new QEpiKit.Environment(agents, resources, facilities, events, function() {
  return random.real(0, 1);
});
environment.add(model);

var experiment = new QEpiKit.Experiment(environment, prepare, report);
//these are the parameters that will be tested systematically
var expParams = {
  param1: [0.04, 0.08, 0.12]
};
//create the experiment plans. how many runs each param.
var perParam = 10;
experiment.sweep(expParams, perParam);
//start the experiment for: number of runs, by step (days), until time
experiment.start(experiment.plans.length, step, duration);
//do something with the results
self.postMessage(['complete', experiment.experimentLog]);
