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
}
//effects / actions
var effects = {
  dieted: function(person){
    var result = person.hasOwnProperty("blackboard") ? person.blackboard : person;
    result.calorieBurn = 400 * 200;
    result.mass = person.mass - (0.13 * result.calorieBurn / 1000)
  },
  cycled: function(person){
    var result = person.hasOwnProperty("blackboard") ? person.blackboard : person;
    result.calorieBurn = 600 * 205;
    result.mass = person.mass - (0.13 * result.calorieBurn / 1000)
  },

  ran: function(person){
    var result = person.hasOwnProperty("blackboard") ? person.blackboard : person;
    result.calorieBurn = 800 * 210;
    result.mass = result.mass - (0.13 * result.calorieBurn / 1000)
  },

  joinedGym: function(person){
    var result = person.hasOwnProperty("blackboard") ? person.blackboard : person;
    result.gymMember = true;
    result.money -= 45;
  },

  mifflinStJeor : function(person) {
    var result = person.hasOwnProperty("blackboard") ? person.blackboard : person;
    result.BMR = (10 * result.mass) + (6.25 * result.height) + (5.0 * result.age) + 5;
  },
  doBMI : function(person) {
    var result = person.hasOwnProperty("blackboard") ? person.blackboard : person;
    result.height = person.height;
    result.BMI = result.mass / (result.height * result.height);
  }
}

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
  }


}




//methods are graphs of methods and operators.
var Cycling = new QEpiKit.HTNOperator("exercise-by-cycling", [conditions.goodKnee], [effects.cycled, effects.doBMI])
var Running = new QEpiKit.HTNOperator("exercise-by-running", [conditions.goodKnee], [effects.ran, effects.doBMI])
var Exercise = new QEpiKit.HTNMethod("exercise", [conditions.freeTime],[Cycling, Running])
var JoinGym = new QEpiKit.HTNOperator("joinGym", [conditions.hasMoney],[effects.joinedGym])
var Diet = new QEpiKit.HTNOperator("diet", null, [effects.dieted, effects.doBMI]);
var Start = new QEpiKit.HTNMethod("start", [conditions.overweight], [Diet, JoinGym, Exercise]);
var LoseWeight = new QEpiKit.HTNRootTask("lose-weight",[conditions.healthyBMI]);

genPopulation(30);
QEpiKit.HTN.start(Start,LoseWeight,popData);
