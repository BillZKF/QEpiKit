importScripts('../bower_components/random/lib/random.min.js', "../qepikit.js", "libs/jstat.min.js");
var startSeed = 0x12345678, agents, states, environment, experimentRunner, weightLoss, group, random, seed, runs = 400;

var prepFunction = function(run) {
  //there are 4 groups, run each group for 1 /4 of the total runs with the same set of random seeds.
  phase = Math.ceil((run + 1) / (runs / 4));
  switch (phase) {
    case 1:
      if (group != 'control') {
        seed = startSeed;
      } else {
        seed += 1;
      }
      group = 'control';
      break;
    case 2:
      if (group != 'diet') {
        seed = startSeed;
      } else {
        seed += 1;
      }
      group = 'diet';
      break;
    case 3:
      if (group != 'exercise') {
        seed = startSeed;
      } else {
        seed += 1;
      }
      group = 'exercise';
      break;
    case 4:
      if (group != 'dietExercise') {
        seed = startSeed;
      } else {
        seed += 1;
      }
      group = 'dietExercise';
      break;
    default:
      break;
  }

  random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));

  agents = [];
  for (var i = 0; i < 100; i++) {
    var person = {
      id: i,
      time: 0,
      massChange: 0,
      age: random.integer(18, 65),
      sex: random.pick(['male', 'female']),
      calAbsorbPct: random.real(0.6, 0.9),
      dailyActivitiesPct: 1.326,
      states: {
        group: group
      }
    };

    if (person.sex === 'male') {
      person.height = jStat.normal.inv(random.real(0, 1), 1.77, 0.2);
      person.mass = jStat.normal.inv(random.real(0, 1), 64, 10);
      person.fatMass = person.mass * random.real(0.1, 0.5);
      person.fatFreeMass = 13.8 * Math.log(person.fatMass / 0.29);
    } else {
      person.height = jStat.normal.inv(random.real(0, 1), 1.62, 0.2);
      person.mass = jStat.normal.inv(random.real(0, 1), 54, 8);
      person.fatMass = person.mass * random.real(0.15, 0.55);
      person.fatFreeMass = 10.4 * Math.log(person.fatMass / 0.29);
    }

    switch (person.states.group) {
      case 'control':
        person.exerciseAmount = random.integer(0, 120);
        person.exerciseMETS = random.integer(2, 3);
        person.calRawIntake = random.integer(1800, 4000);
        break;
      case 'diet':
        person.exerciseAmount = random.integer(0, 120);
        person.exerciseMETS = random.integer(2, 3);
        person.calRawIntake = random.integer(1200, 2500);
        break;
      case 'exercise':
        person.exerciseAmount = random.integer(30, 120);
        person.exerciseMETS = random.integer(4, 6);
        person.calRawIntake = random.integer(1800, 4000);
        break;
      case 'dietExercise':
        person.exerciseAmount = random.integer(30, 120);
        person.exerciseMETS = random.integer(4, 6);
        person.calRawIntake = random.integer(1200, 2500);
        break;
      default:
        break;
    }
    personBMI = actions.calcBMI(0, person);
    personBMR = actions.mifflinStJeor(0, person);
    agents[i] = person;
  }

  weightLoss.data = agents;
  environment.agents = agents;
}; //prepFunction;

recordFunction = function() {
  //after each run
  var record = {
    group: group,
    meanBMI: 0,
    medianBMI: 0,
    meanHeight: 0,
    meanExerciseBurn: 0,
  };
  var total = 0,
    totalHeight = 0,
    totalExBurn = 0,
    totalMassChange = 0,
    totalCalIn = 0;

  environment.agents.map(function(d) {
    totalCalIn += d.calRawIntake;
    total += d.BMI;
    totalHeight += d.height;
    totalExBurn += d.calExUse;
    totalMassChange += d.massChange;
  });
  record.meanCalIntake = totalCalIn / environment.agents.length;
  record.meanMassChange = totalMassChange / environment.agents.length;
  record.meanBMI = total / environment.agents.length;
  record.meanHeight = totalHeight / environment.agents.length;
  record.meanExerciseBurn = totalExBurn / environment.agents.length;
  return record;
};

states = {
  'control': function(step, person) {
    participate(step, person);
  },
  'diet': function(step, person) {
    participate(step, person);
  },
  'exercise': function(step, person) {
    participate(step, person);
  },
  'dietExercise': function(step, person) {
    participate(step, person);
  }
};

actions = {
  mifflinStJeor: function(step, person) {
    person.BMR = (10 * person.mass) + (6.25 * person.height) + (5.0 * person.age) + 5;
  },
  calcBMI: function(step, person) {
    person.BMI = person.mass / (person.height * person.height);
  },
  energyBalance: function(step, person) {
    person.calDifference = person.calIn - (person.calExUse + person.BMR * person.dailyActivitiesPct);
  },
  energyExpended: function(step, person) {
    person.calExUse = (person.exerciseAmount / 60) * person.exerciseMETS * person.mass;
  },
  energyIn: function(step, person) {
    person.calIn = person.calRawIntake * person.calAbsorbPct;
  },
  changeMass: function(step, person) {
    person.massChange += (0.13 * person.calDifference / 1000);
    person.mass = person.mass + person.massChange;
    actions.calcBMI(step, person);
  }
};

participate = function(step, person) {
  actions.energyIn(step, person); //eats daily
  actions.energyExpended(step, person); //daily activities and exercise
  actions.mifflinStJeor(step, person); //gets the BMR
  actions.energyBalance(step, person);
  actions.changeMass(step, person);
};

randF = function() {
  return random.real(0, 1);
}; //for the sorting function. Doesn't matter here.

self.onmessage = function(initEvent) {
  environment = new QEpiKit.Environment(agents, [], [], randF);
  weightLoss = new QEpiKit.StateMachine('weight-loss', states, [], [], [], agents);
  environment.add(weightLoss);
  experimentRunner = new QEpiKit.Experiment(environment, prepFunction, recordFunction);
  experimentRunner.start(runs, 1, 30);
  self.postMessage([experimentRunner.experimentLog]);
};
