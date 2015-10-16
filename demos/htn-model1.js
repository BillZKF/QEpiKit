importScripts("../qepikit.min.js");

//effects / actions
var effects = {
  joinedGym: function(person) {
    person.gymMember = true;
    person.money -= 45;
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
    person.massChange += (0.13 * person.calDifference / 1000);
    person.mass = person.mass + person.massChange;
    actions.calcBMI(step, person);
  },
  setGym: function(step, person){
    var n = turf.nearest(person.location, gyms);
    person.gym = n.properties.name;
  },
  setPark: function(step, person){
    var n = turf.nearest(person.location, parks);
    person.park = n.properties.name;
  },
  setGrocery: function(step, person){
    var n = turf.nearest(person.location, grocery);
    person.grocery = n.properties.name;
  }
};

var conditions = {
  "goal": {
    key: "BMI",
    value: 24,
    check: QEpiKit.Utils.ltEq
  },
  "freeTime": {
    key: "timeFree",
    value: 60,
    check: QEpiKit.Utils.gtEq
  }
};

//methods are graphs of methods and operators.
var JoinGym = new QEpiKit.HTNOperator("join-gym", [conditions.hasMoney], [effects.joinedGym]);
var Gym = new QEpiKit.HTNMethod("at-gym", [conditions.urban], [JoinGym, CardioEq]);
var Outdoors = new QEpiKit.HTNMethod("outdoors", [conditions.rural], [Cycling, Running]);
var Exercise = new QEpiKit.HTNMethod("exercise", [conditions.freeTime], [Gym, Outdoors]);

//diet and exercise
var Diet = new QEpiKit.HTNOperator("diet", null, [effects.dieted, effects.doBMI]);
var Start = new QEpiKit.HTNMethod("start", [conditions.overweight], [Diet, Exercise]);
var Goal = new QEpiKit.HTNRootTask("lose-weight", [conditions.goal]);
var Model = new QEpiKit.HTNPlanner('test-planner', Start, Goal, popData);
