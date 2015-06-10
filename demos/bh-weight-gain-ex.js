var popData = [];
var popProps = [];
var genPopulation = function(number) {
  var p = {};
  for (var i = 0; i < number; i++) {
    p.id = i;
    p.dead = false;
		p.age = chance.integer({
      min: 18,
      max: 70
    });
    p.height = chance.floating({
      min: 58 *( 2.54 / 100),
      max: 76 *(2.54 / 100)
    });
    p.mass = chance.floating({
      min: 110 * 0.453592,
      max: 250 * 0.453592
    });
    doBMI(p);
    p.calIntake = chance.integer({
      min: 1200,
      max: 4000
    });
    p.exerciseAmount = chance.integer({
      min: 0,
      max: 90
    });
    p.exerciseMETS = chance.integer({
      min: 4,
      max: 10
    })
    p.calDifference = 0;
    p.diet = false;
    popData.push(p);
    p = {};
  }
  popProps = Object.keys(popData[0]);
  //popProps.push('dead');
  popProps.unshift('day');
}

//conditions
var adult = {
  key: "age",
  value: 21,
  check: QKit.BehaviorTree.gtEq,
  data: popData
};
var tiredAdult = {
  key: "age",
  value: 28,
  check: QKit.BehaviorTree.gtEq,
  data: popData
};
var obese = {
  key: "bmi",
  value: 28,
  check: QKit.BehaviorTree.ltEq,
  data: popData
};
var morbidlyObese = {
  key: "bmi",
  value: 35,
  check: QKit.BehaviorTree.gtEq,
  data: popData
};
var healthScare = {
  key: "doctor",
  value: 1.1,
  check: QKit.BehaviorTree.gtEq,
  data: popData
}; // basically increase chance of seeing doctor
var someExercise = {
  key: "exercise",
  value: 3,
  check: QKit.BehaviorTree.gtEq,
  data: popData
};
var minimalExercise = {
  key: "exercise",
  value: 3,
  check: QKit.BehaviorTree.ltEq,
  data: popData
};
var timeForDoctor = {
  key: "doctor",
  value: 1,
  check: QKit.BehaviorTree.gtEq,
  data: popData
};
var dead = {
  key: "dead",
  value: true,
  check: QKit.BehaviorTree.equalTo,
  data: popData
};
var normalDiet = {
  key: "diet",
  value: false,
  check: QKit.BehaviorTree.equalTo,
  data: popData
};
var specialDiet = {
  key: "diet",
  value: true,
  check: QKit.BehaviorTree.equalTo,
  data: popData
};
var alive = {
  key: "dead",
  value: false,
  check: QKit.BehaviorTree.equalTo,
  data: popData
};
//actions
var mifflinStJeor = function(person) {
  person.BMR = (10 * person.mass) + (6.25 * person.height) + (5.0 * person.age) + 5;
};
var doBMI = function(person) {
  person.BMI = person.mass / (person.height * person.height);
}
var calorieBalance = function(person) {
	person.exCalUse = (person.exerciseAmount / 60) * person.exerciseMETS * person.mass;
  person.calDifference = person.calIntake - (person.exCalUse + person.BMR);
};
var changeMass = function(person) {
  person.mass = person.mass + (0.13 * person.calDifference / 1000);
  doBMI(person);
};
var makeDead = function(person) {
  person.dead = true;
};
var makeOld = function(person) {
  person.age += 1 / 365;
};



//nodes
//var NoIntervention = new QKit.BTCondition("no-intervention");
//var SelectIntervention = new QKit.BTSelector("select-intervention-group", NoIntervention, Diet, Exercise, DietExercise);
var BaseMetabolicRate = new QKit.BTAction("base-metabolic-rate", alive, mifflinStJeor);
var CalorieBalance = new QKit.BTAction("cals-in-vs-cals-burned", alive, calorieBalance);
var ChangeWeight = new QKit.BTAction("mass-change", alive, changeMass);
var Age = new QKit.BTAction("add-to-age", adult, makeOld);
var SequenceDaily = new QKit.BTSequence("daily-sequence", [Age, BaseMetabolicRate, CalorieBalance, ChangeWeight]);
var Dead = new QKit.BTCondition("is-person-dead", dead);
var Status = new QKit.BTSelector("select-status", [Dead, SequenceDaily]);
var Root = new QKit.BTRoot("root", [Status]);
var BHTree = new QKit.BehaviorTree(Root, popData);
