//using a web worker to avoid blocking the main thread is recommended.
importScripts('../bower_components/random/lib/random.min.js', "../qepikit.js", "libs/jstat.min.js", "../node_modules/turf/turf.min.js");

//use mersene twister
var startSeed = 0x12345678;
var seed = startSeed;
var random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));

//these arrays will be populated in prepare function
var people = [];
var resources = [];
var facilities = [];
var events = [];

//before each run of the experiment, do this.
var prepare = function(run) {
  //set defaults
  var experimentalVars = {
    paramOne: 15,
    paramTwo: 'medium'
  };
  //then set the value you're testing for this run
  experimentVars[experiment.experimentPlans[run].property] = experiment.experimentPlans[run].value;

  /*
  * Generate the people, resources, facilities, and events here.
  */

  environment.agents = agents;
  model.data = agents;
  //iterate the random seed for next run
  seed++;
  random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
};

//after each run of the experiment, report out
var report = function(run) {
  var record = {
    run: run,
    experiment: experiment.experimentPlans[run].property + " " + experiment.experimentPlans[run].value,
    seed: seed
  };
  //add more stuff
  return record;
};

var model = Model;//define this in a seperate file. This is how the agents behave.
var environment = new QEpiKit.Environment(agents, resources, events, function() {
  return random.real(0, 1);
});
environment.add(model);


var experiment = new QEpiKit.Experiment(environment, prepare, report);
//these are the parameters that will be tested systematically
var expParams = {
  paramOne: QEpiKit.Utils.range(5, 25, 5),
  paramTwo: ['low','medium','high']
};
//create the experiment plans. how many runs each param.
experiment.sweep(expParams, 10);
//start the experiment for: number of runs, by step (days), until time
experiment.run(experiment.plans.length, 1, 365);
//do something with the results
console.log(experiment.experimentLog);
