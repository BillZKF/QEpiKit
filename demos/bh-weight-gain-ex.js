var popData = [];
var popProps = [];
var genPopulation = function(number) {
  var p = {};
  for (var i = 0; i < number; i++) {
    p.ID = i;
    p.dead = false;
    p.age = chance.integer({
      min: 18,
      max: 70
    });
    p.height = chance.floating({
      min: 1.5,
      max: 2
    });
    p.mass = chance.floating({
      min: 110 * 0.453592,
      max: 250 * 0.453592
    });
    p.calRawIntake = chance.integer({
      min: 1200,
      max: 4000
    });
    p.calAbsorb = chance.floating({
      min: .60,
      max: .90
    })
    p.exerciseAmount = chance.integer({
      min: 15,
      max: 50
    });
    p.exerciseMETS = chance.integer({
      min: 2,
      max: 4
    })

    p.exercise = chance.bool({
      likelihood: 20
    })

    p.diet = chance.bool({
      likelihood: 20
    })
    p.active = false;
    doBMI(p);
    mifflinStJeor(p);
    caloriesIn(p);
    caloriesBurn(p);
    calorieBalance(p);
    p.time = 0;
    popData.push(p);
    p = {};
  }
  popProps = Object.keys(popData[0]);
}

//conditions
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
var exer = {
  key: "exercise",
  value: true,
  check: QKit.BehaviorTree.equalTo,
  data: popData
};
var sed ={
  key : "exercise",
  value: false,
  check: QKit.BehaviorTree.equalTo,
  data: popData
}
//actions
var mifflinStJeor = function(person) {
  person.BMR = (10 * person.mass) + (6.25 * person.height) + (5.0 * person.age) + 5;
};
var doBMI = function(person) {
  person.BMI = person.mass / (person.height * person.height);
}
var calorieBalance = function(person) {
  person.calDifference = person.calIn - (person.calExUse + person.BMR);
};
var caloriesBurn = function(person) {
  person.calExUse = (person.exerciseAmount / 60) * person.exerciseMETS * person.mass;
}
var caloriesIn = function(person) {
  person.calIn = person.calRawIntake * person.calAbsorb;
}
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
var doExercise = function(person) {
  person.exerciseMETS = 6 + (2 * Math.sin(person.time));
  person.exerciseAmount = 60 + (30 * Math.sin(person.time))
};
var doDiet = function(person) {
  person.calRawIntake = 1800 + (200 * Math.sin(person.time));
}





//nodes
var LowCalDiet = new QKit.BTAction("low-cal-diet", specialDiet, doDiet);
var NormalDiet = new QKit.BTCondition("normal-diet", normalDiet);
var Exercise = new QKit.BTAction("regular-moderate-exercise", exer, doExercise);
var Sed = new QKit.BTCondition("mostly-sedentary", sed);
var ExerciseSelect = new QKit.BTSelector("select-exercise", [Sed, Exercise])
var DietSelect = new QKit.BTSelector("select-diet", [NormalDiet, LowCalDiet])
var SequenceIntervention = new QKit.BTSequence("intervention-sequence", [DietSelect, ExerciseSelect]);
var BaseMetabolicRate = new QKit.BTAction("base-metabolic-rate", alive, mifflinStJeor);
var CaloriesBurn = new QKit.BTAction("calorie-burning-activities", alive, caloriesBurn);
var CaloriesIn = new QKit.BTAction("cals-in-and-absorbed", alive, caloriesIn);
var CalorieBalance = new QKit.BTAction("cals-in-vs-cals-burned", alive, calorieBalance);
var ChangeWeight = new QKit.BTAction("mass-change", alive, changeMass);
var Age = new QKit.BTAction("add-to-age", alive, makeOld);
var SequenceDaily = new QKit.BTSequence("daily-sequence", [BaseMetabolicRate, CaloriesIn, CaloriesBurn, CalorieBalance, ChangeWeight, Age]);
var Dead = new QKit.BTCondition("is-person-dead", dead);
var Status = new QKit.BTSequence("select-status", [SequenceIntervention, SequenceDaily]);
var Root = new QKit.BTRoot("root", [Status]);
var BHTree = new QKit.BehaviorTree(Root, popData);
