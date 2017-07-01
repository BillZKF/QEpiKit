let pathogen, boundaries ,agents, exp, cfg, environment, random, vectorPatch;


self.onmessage = function(event){
  importScripts('../node_modules/three/build/three.min.js',
  '../qepikit.js',
  './libs/jstat.min.js',
  '../node_modules/turf/turf.min.js',
  './actions.js');
  console.log('starting : ', new Date().toString());
  cfg = event.data[0];
  if(cfg.experiment.type === 'evolution'){
    exp = new QEpiKit.Evolve(environment, cfg);
  } else {
    exp = new QEpiKit.Experiment(environment, cfg);
  }
  exp.parseCFG(cfg);
  globalAssignment();
  exp.start(cfg.experiment.iterations, cfg.environment.step, cfg.environment.until, globalAssignment);
  console.log('finished : ', new Date().toString(), exp);
  self.postMessage([exp.improvement, exp.experimentLog]);
};
