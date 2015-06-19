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
      min: 65 *( 2.54 / 100),
      max: 72 *(2.54 / 100)
    });
    p.mass = chance.floating({
      min: 150 * 0.453592,
      max: 220 * 0.453592
    });

    p.setting = chance.pick(["rural", "urban"]);
    effects.doBMI(p);

    p.money = chance.integer({
      min: 30,
      max: 90
    });

    p.timeFree = chance.integer({
      min: 40,
      max: 100
    });

    p.kneeProblems = chance.bool();

    popData.push(p);
    p = {};
  }
  popProps = Object.keys(popData[0]);
};
//effects / actions
var effects = {
  dieted: function(person){
    person.calorieBurn = 400 * 200;
    person.mass = person.mass - (0.13 * person.calorieBurn / 1000);
  },
  cycled: function(person){
    person.calorieBurn = 600 * 205;
    person.mass = person.mass - (0.13 * person.calorieBurn / 1000);
  },
  cardio: function(person){
    person.calorieBurn = 700 * 205;
    person.mass = person.mass - (0.13 * person.calorieBurn / 1000);
  },

  ran: function(person){
    person.calorieBurn = 800 * 210;
    person.mass = person.mass - (0.13 * person.calorieBurn / 1000);
  },

  joinedGym: function(person){
    person.gymMember = true;
    person.money -= 45;
  },

  mifflinStJeor : function(person) {
    person.BMR = (10 * person.mass) + (6.25 * person.height) + (5.0 * person.age) + 5;
  },
  doBMI : function(person) {
    person.height = person.height;
    person.BMI = person.mass / (person.height * person.height);
  }
};

var conditions = {
  "hasMoney" : {
    key: "money",
    value: 45,
    check : QKit.Utils.gtEq
  },

  "adult" : {
    key: "age",
    value: 21,
    check: QKit.Utils.gtEq
  },

  "goodKnee" : {
    key: "kneeProblems",
    value : false,
    check: QKit.Utils.equalTo
  },

  "healthyBMI" : {
    key: "BMI",
    value: 24,
    check: QKit.Utils.ltEq
  },
  "freeTime" : {
    key: "timeFree",
    value: 60,
    check: QKit.Utils.gtEq
  },
  "overweight":{
    key: "BMI",
    value: 24,
    check: QKit.Utils.gtEq
  },
  "rural":{
    key: "location",
    value: "rural",
    check: QKit.Utils.equalTo
  },
  "urban":{
    key: "location",
    value: "urban",
    check: QKit.Utils.equalTo
  }


};




//methods are graphs of methods and operators.
var Cycling = new QEpiKit.HTNOperator("go-cycling", null, [effects.cycled, effects.doBMI]);
var Running = new QEpiKit.HTNOperator("go-running", [conditions.goodKnee], [effects.ran, effects.doBMI]);
var CardioEq = new QEpiKit.HTNOperator("use-cardio-eq", null, [effects.cardio, effects.doBMI]);
var JoinGym = new QEpiKit.HTNOperator("join-gym", [conditions.hasMoney], [effects.joinedGym]);
var Gym = new QEpiKit.HTNMethod("at-gym", [conditions.urban], [JoinGym, CardioEq]);
var Outdoors = new QEpiKit.HTNMethod("outdoors", [conditions.rural], [Cycling, Running]);
var Exercise = new QEpiKit.HTNMethod("exercise", [conditions.freeTime],[Gym, Outdoors]);
var Diet = new QEpiKit.HTNOperator("diet", null, [effects.dieted, effects.doBMI]);
var Start = new QEpiKit.HTNMethod("start", [conditions.overweight], [Diet, Exercise]);
var LoseWeight = new QEpiKit.HTNRootTask("lose-weight",[conditions.healthyBMI]);

genPopulation(30);
QEpiKit.HTNPlanner.start(Start,LoseWeight,popData);
