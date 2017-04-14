importScripts('../bower_components/random/lib/random.min.js', "../qepikit.min.js", "libs/jstat.min.js", "../node_modules/turf/turf.min.js");
var random = new Random(Random.engines.mt19937().seedWithArray([0x12345678, 0x90abcdef]));
var distUnits = 'miles';
self.onmessage = function(initEvent) {
  var data = initEvent.data;
  var AgentModel = function() {
    var A = {
      update: function(step, person) {
        this.energyIn(step, person); //eats daily
        this.energyExpended(step, person);
        this.mifflinStJeor(step, person); //gets the BMR
        this.energyBalance(step, person);
        this.changeMass(step, person);
        person.time += step;
      },
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
        person.mass = person.mass + (0.13 * person.calDifference / 1000);
        this.calcBMI(step,person);
      }
    };
    return A;
  };

  var agents = [];

  function setGroupParams(person) {
    switch (person.group) {
      case 'control':
        person.exerciseAmount = random.integer(0, 120);
        person.exerciseMETS = random.integer(2, 3);
        person.calRawIntake = random.integer(1200, 4000);
        break;
      case 'diet':
        person.exerciseAmount = random.integer(0, 120);
        person.exerciseMETS = random.integer(2, 3);
        person.calRawIntake = random.integer(1200, 2500);
        break;
      case 'exercise':
        person.exerciseAmount = random.integer(30, 120);
        person.exerciseMETS = random.integer(3, 6);
        person.calRawIntake = random.integer(1200, 4000);
        break;
      case 'dietExercise':
        person.exerciseAmount = random.integer(30, 120);
        person.exerciseMETS = random.integer(3, 6);
        person.calRawIntake = random.integer(1200, 2500);
        break;
      default:
        break;
    }
  }

  function setMass(person) {
    if(person.sex === 'male'){
      person.mass = jStat.normal.inv(random.real(0, 1), 64, 10);
      person.fatMass = person.mass * random.real(0.1, 0.5);
      person.fatFreeMass = 13.8 * Math.log(person.fatMass / 0.29);
    } else {
      person.mass = jStat.normal.inv(random.real(0, 1), 54, 8);
      person.fatMass = person.mass * random.real(0.15, 0.55);
      person.fatFreeMass = 10.4 * Math.log(person.fatMass / 0.29);
    }
  }

  function setHeight(person) {

    if(person.sex === 'male'){
      person.height = jStat.normal.inv(random.real(0, 1), 1.77, 0.2);
    } else {
      person.height = jStat.normal.inv(random.real(0, 1), 1.62, 0.2);
     }
    personBMI = modelOfAgent.calcBMI(0, person);
    personBMR = modelOfAgent.mifflinStJeor(0, person);
  }


  var init = function() {
    duration = 360; //12 months
    step = 1; //each day
    numAgents = 500;
    modelOfAgent = new AgentModel(); //instantiate based on above
    locations = turf.random('points', numAgents, {
      bbox: [-75.1867, 39.9900, -75.1467, 39.9200]
    });

    for (var j = 0; j < numAgents; j++) {
      agents[j] = {
        id: j,
        time: 0,
        age: random.integer(18, 65),
        sex: random.pick(['male', 'female']),
        calAbsorbPct: random.real(0.6, 0.9),
        dailyActivitiesPct: 1.326,
        group: random.pick(['control', 'diet', 'exercise', 'dietExercise']),
        moveRate: random.real(0.2, 5), //miles per day
        location: locations.features[j]
      };
      agents[j].location.properties.agentRefID = agents[j].id;
      setMass(agents[j]);
      setHeight(agents[j]);
      setGroupParams(agents[j]);
    }

    var t = 0,
      hist = [];
    while (t <= duration) {
      for (var k = 0; k < agents.length; k++) {
        modelOfAgent.update(step, agents[k]);
      }
      var rem = Math.round(t * 1000);
      if (rem % 30000 === 0) {
        var copy = JSON.parse(JSON.stringify(agents));
        hist = hist.concat(copy);
      }
      t += step;
    }

    self.postMessage([hist, locations]);
  };
  //run on load
  init();
};
