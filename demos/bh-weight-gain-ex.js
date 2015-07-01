var WpopData = [];
var WpopProps = [];
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
      min: 0.60,
      max: 0.90
    });
    p.exerciseAmount = chance.integer({
      min: 15,
      max: 50
    });
    p.exerciseMETS = chance.integer({
      min: 2,
      max: 4
    });

    p.exercise = chance.bool({
      likelihood: 20
    });

    p.diet = chance.bool({
      likelihood: 20
    });
    p.active = false;
    actions.doBMI(p);
    actions.mifflinStJeor(p);
    actions.caloriesIn(p);
    actions.caloriesBurn(p);
    actions.calorieBalance(p);
    p.time = 0;
    WpopData.push(p);
    p = {};
  }
  WpopProps = Object.keys(WpopData[0]);
};

//conditions
conditions = {
   dead : {
    key: "dead",
    value: true,
    check: QEpiKit.Utils.equalTo,
    data: WpopData
  },
   normalDiet : {
    key: "diet",
    value: false,
    check: QEpiKit.Utils.equalTo,
    data: WpopData
  },
   specialDiet : {
    key: "diet",
    value: true,
    check: QEpiKit.Utils.equalTo,
    data: WpopData
  },
   alive : {
    key: "dead",
    value: false,
    check: QEpiKit.Utils.equalTo,
    data: WpopData
  },
   exer : {
    key: "exercise",
    value: true,
    check: QEpiKit.Utils.equalTo,
    data: WpopData
  },
   sed : {
    key : "exercise",
    value: false,
    check: QEpiKit.Utils.equalTo,
    data: WpopData
  }
};

actions = {
   mifflinStJeor : function(person) {
    person.BMR = (10 * person.mass) + (6.25 * person.height) + (5.0 * person.age) + 5;
  },
   doBMI : function(person) {
    person.BMI = person.mass / (person.height * person.height);
  },
   calorieBalance : function(person) {
    person.calDifference = person.calIn - (person.calExUse + person.BMR);
  },
   caloriesBurn : function(person) {
    person.calExUse = (person.exerciseAmount / 60) * person.exerciseMETS * person.mass;
  },
   caloriesIn : function(person) {
    person.calIn = person.calRawIntake * person.calAbsorb;
  },
   changeMass : function(person) {
    person.mass = person.mass + (0.13 * person.calDifference / 1000);
    doBMI(person);
  },
   makeDead : function(person) {
    person.dead = true;
  },
   makeOld : function(person) {
    person.age += 1 / 365;
  },
   doExercise : function(person) {
    person.exerciseMETS = 6 + (2 * Math.sin(person.time));
    person.exerciseAmount = 60 + (30 * Math.sin(person.time));
  },
   doDiet : function(person) {
    person.calRawIntake = 1800 + (200 * Math.sin(person.time));
  }
};

//nodes
var LowCalDiet = new QEpiKit.BTAction("low-cal-diet", conditions.specialDiet, actions.doDiet);
var NormalDiet = new QEpiKit.BTCondition("normal-diet", conditions.normalDiet);
var Exercise = new QEpiKit.BTAction("regular-moderate-exercise", conditions.exer, actions.doExercise);
var Sed = new QEpiKit.BTCondition("mostly-sedentary", conditions.sed);
var ExerciseSelect = new QEpiKit.BTSelector("select-exercise", [Sed, Exercise]);
var DietSelect = new QEpiKit.BTSelector("select-diet", [NormalDiet, LowCalDiet]);
var SequenceIntervention = new QEpiKit.BTSequence("intervention-sequence", [DietSelect, ExerciseSelect]);
var BaseMetabolicRate = new QEpiKit.BTAction("base-metabolic-rate", conditions.alive, actions.mifflinStJeor);
var CaloriesBurn = new QEpiKit.BTAction("calorie-burning-activities", conditions.alive, actions.caloriesBurn);
var CaloriesIn = new QEpiKit.BTAction("cals-in-and-absorbed", conditions.alive, actions.caloriesIn);
var CalorieBalance = new QEpiKit.BTAction("cals-in-vs-cals-burned", conditions.alive, actions.calorieBalance);
var ChangeWeight = new QEpiKit.BTAction("mass-change", conditions.alive, actions.changeMass);
var Age = new QEpiKit.BTAction("add-to-age", conditions.alive, actions.makeOld);
var SequenceDaily = new QEpiKit.BTSequence("daily-sequence", [BaseMetabolicRate, CaloriesIn, CaloriesBurn, CalorieBalance, ChangeWeight, Age]);
var Dead = new QEpiKit.BTCondition("is-person-dead", conditions.dead);
var Status = new QEpiKit.BTSequence("select-status", [SequenceIntervention, SequenceDaily]);
var WRoot = new QEpiKit.BTRoot("root", [Status]);
var WBHTree = new QEpiKit.BehaviorTree(WRoot, WpopData);
genPopulation(1000);
