
//these arrays will be populated in prepare function
var locations = [], agents = [];
var pathogen = {recoveryTime: 6, mutationTime: 12};
var resources = [];
var facilities = [];
var events = [];
var distUnits = 'kilometers';

//set up the environment
var step = 1/24;
var duration = 30;
var seed, startSeed, random, options;

importScripts('../bower_components/three.js/three.min.js','../qepikit.js', './libs/jstat.min.js','../node_modules/turf/turf.min.js', '../bower_components/random/lib/random.min.js', 'sm-seir.js', 'actions.js');
var scene = new THREE.Scene();
var raycaster = new THREE.Raycaster();
var boundaries = {
  'people': {
    top:5000,
    bottom: 0,
    left: 0,
    right: 4000
  }
};

var SEIRModel = new QEpiKit.StateMachine('seir-model', states, transitions, conditions, agents);//defined in a seperate file. This is how the agents behave.
var MoveModel = {
  id: QEpiKit.Utils.generateUUID(),
  name: 'move-model',
  data: agents,
  update: function(agent, step){
    if(agent.type === 'geospatial'){
      QActions.geoMove(step, agent);
    } else {
      QActions.moveWithin(step, agent, boundaries.people);
    }
  }
};

//function for generating the population
var genPop = function(numAgents, infectedAtStart) {
  var pop = [];
  var locs = {type:'FeatureCollection', features:[]};

  for (var a = 0; a < numAgents; a++) {
    locs.features[a] = turf.point([random.real(-75.1467,-75.1867), random.real(39.9200, 39.9900)]);
    pop[a] = {
      id: a,
      type: 'geospatial',
      mesh: new THREE.Mesh(new THREE.TetrahedronGeometry(1, 1), new THREE.MeshBasicMaterial({
        color: 0x00ff00
      })),
      sex: random.pick(['male', 'female']),
      age: random.integer(0, 85),
      pathogenLoad: 0,
      states: {
        illness: 'succeptible'
      },
      timeInfectious: 0,
      location: locs.features[a]
    };
    pop[a].prevX = 0;
    pop[a].prevY = 0;
    pop[a].location.properties.agentRefID = pop[a].id;
    pop[a].mesh.qId = a;
    pop[a].mesh.type = 'agent';
    pop[a].mesh.position.x = random.real(boundaries.people.left, boundaries.people.right);
    pop[a].mesh.position.y = random.real(boundaries.people.bottom, boundaries.people.top);
    pop[a].movePerDay = jStat.normal.inv(random.real(0,1), 2500 * 24, 500); // m/day
    pop[a].movedTotal = 0;
    pop[a].newAttempt = 0;
    pop[a].madeAttempts = 0;
    pop[a].contactAttempts = jStat.normal.inv(random.real(0,1), Math.abs(pop[a].age - 40), 8) + 8;
    scene.add(pop[a].mesh);
  }
  for (var r = 0; r < infectedAtStart; r++) {
    var rIndex = random.integer(0, numAgents - 1);
    pop[r].states.illness = 'infectious';
    pop[r].pathogenLoad = 1e4;
  }
  return [pop, locs];
};

self.onmessage = function(event){
  seed = event.data[0];
  options = event.data[1];
  step = options.step;
  startSeed = seed;


  //use a mersene twister for pseudo-random number generation
  random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x91abcdef]));

  environment = new QEpiKit.Environment(resources, events, facilities, 'random', function() {
    return random.real(0, 1);
  });

  //before each run of the experiment, do this.
  var prepare = function(run) {
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();
    environment.agents = [];
    environment.remove(SEIRModel.id);
    environment.remove(MoveModel.id);
    pathogen = options.pathogen;
    pathogen.personToPerson = true;
    pathogen['beta-Poisson'] = function(dose) {
      let response = 1 - Math.pow((1 + (dose / pathogen.N50) * (Math.pow(2, (1 / pathogen.optParam)) - 1)), (-pathogen.optParam));
      return response;
    }
    pathogen['exponential'] = function(dose) {
      let response = 1 - Math.exp(-pathogen.optParam * dose);
      return response;
    }
    //set defaults
    experimentVars = {
      shedRate: pathogen.shedRate,
      decayRate: pathogen.decayRate,
      recoveryRate : pathogen.recoveryTime
    };
    //then set the value you're testing for this run
    experimentVars[experiment.plans[run].param] = experiment.plans[run].value;
    //now resest the variables accordingly
    pathogen.shedRate = experimentVars.shedRate;
    pathogen.decayRate = experimentVars.decayRate;
    pathogen.recoveryTime = experimentVars.recoveryTime;


    var result = genPop(options.numberOfAgents, options.infectedAtStart);
    agents = result[0];
    locations = result[1];
    SEIRModel.data = agents;
    MoveModel.data = agents;
    environment.add(SEIRModel);
    environment.add(MoveModel);

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
      param: experiment.plans[run].param,
      paramValue: experiment.plans[run].value,
      seed: seed,
      succeptible: 0,
      exposed: 0,
      infectious: 0,
      recovered: 0,
    };

    environment.agents.forEach(function(d) {
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
        case 'recovered':
          record.recovered += 1;
          break;
        default:
          break;
      }
    });
    self.postMessage(['progress', record]);
    //add more stuff
    return record;
  };

  //these are the parameters that will be tested systematically

  var expParams = {
    shedRate: [],
    decayRate: [],
    recoveryTime : []
  };
  var perParam = Math.ceil(options.runsPerWorker / Object.keys(expParams).length);
  for(let j = 0; j < perParam; j++){
    expParams.decayRate[j] = jStat.normal.inv(random.real(0,1), options.pathogen.decayRate, options.pathogen.decayRate * 0.5 );
    expParams.shedRate[j] = jStat.normal.inv(random.real(0,1), options.pathogen.shedRate, options.pathogen.shedRate * 0.5 );
    expParams.recoveryTime[j] = jStat.normal.inv(random.real(0,1), options.pathogen.recoveryTime, options.pathogen.recoveryTime * 0.5 );
  }

  var experiment = new QEpiKit.Experiment(environment, prepare, report);

  //create the experiment plans. how many runs each param.
  experiment.sweep(expParams, perParam);
  //start the experiment for: number of runs, by step (days), until time
  experiment.start(experiment.plans.length, step, duration);
  //do something with the results
  self.postMessage(['complete', experiment.experimentLog, QEpiKit.ContactPatch.WIWArray]);
};
