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
    actions.doBMI(p);
    actions.mifflinStJeor(p);
    actions.caloriesIn(p);
    actions.caloriesBurn(p);
    actions.calorieBalance(p);
    p.time = 0;
    popData.push(p);
    p = {};
  }
  popProps = Object.keys(popData[0]);
}

//conditions
conditions = {
   dead : {
    key: "dead",
    value: true,
    check: QKit.BehaviorTree.equalTo,
    data: popData
  },
   normalDiet : {
    key: "diet",
    value: false,
    check: QKit.BehaviorTree.equalTo,
    data: popData
  },
   specialDiet : {
    key: "diet",
    value: true,
    check: QKit.BehaviorTree.equalTo,
    data: popData
  },
   alive : {
    key: "dead",
    value: false,
    check: QKit.BehaviorTree.equalTo,
    data: popData
  },
   exer : {
    key: "exercise",
    value: true,
    check: QKit.BehaviorTree.equalTo,
    data: popData
  },
   sed : {
    key : "exercise",
    value: false,
    check: QKit.BehaviorTree.equalTo,
    data: popData
  }
}

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
    person.exerciseAmount = 60 + (30 * Math.sin(person.time))
  },
   doDiet : function(person) {
    person.calRawIntake = 1800 + (200 * Math.sin(person.time));
  }
}

//nodes
var LowCalDiet = new QKit.BTAction("low-cal-diet", conditions.specialDiet, actions.doDiet);
var NormalDiet = new QKit.BTCondition("normal-diet", conditions.normalDiet);
var Exercise = new QKit.BTAction("regular-moderate-exercise", conditions.exer, actions.doExercise);
var Sed = new QKit.BTCondition("mostly-sedentary", conditions.sed);
var ExerciseSelect = new QKit.BTSelector("select-exercise", [Sed, Exercise])
var DietSelect = new QKit.BTSelector("select-diet", [NormalDiet, LowCalDiet])
var SequenceIntervention = new QKit.BTSequence("intervention-sequence", [DietSelect, ExerciseSelect]);
var BaseMetabolicRate = new QKit.BTAction("base-metabolic-rate", conditions.alive, actions.mifflinStJeor);
var CaloriesBurn = new QKit.BTAction("calorie-burning-activities", conditions.alive, actions.caloriesBurn);
var CaloriesIn = new QKit.BTAction("cals-in-and-absorbed", conditions.alive, actions.caloriesIn);
var CalorieBalance = new QKit.BTAction("cals-in-vs-cals-burned", conditions.alive, actions.calorieBalance);
var ChangeWeight = new QKit.BTAction("mass-change", conditions.alive, actions.changeMass);
var Age = new QKit.BTAction("add-to-age", conditions.alive, actions.makeOld);
var SequenceDaily = new QKit.BTSequence("daily-sequence", [BaseMetabolicRate, CaloriesIn, CaloriesBurn, CalorieBalance, ChangeWeight, Age]);
var Dead = new QKit.BTCondition("is-person-dead", conditions.dead);
var Status = new QKit.BTSequence("select-status", [SequenceIntervention, SequenceDaily]);
var Root = new QKit.BTRoot("root", [Status]);
var BHTree = new QKit.BehaviorTree(Root, popData);
