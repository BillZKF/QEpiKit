//population
var mpopData = [];
var mpopProps = [];
var mtotalPop = 0;
var genPopulation = function(number) {
  for (var i = 0; i < number; i++) {
    var p = {};
    p.time = 0;
		p.active = false;
		p.id = i;
    p.age = chance.integer({
      min: 0,
      max: 25
    });
    p.exposed = chance.bool({
      likelihood: 5
    });
    p.succept = p.exposed === true ? false : chance.bool({
      likelihood: 95
    });
    p.removed = false;
    p.exposedTime = 0;
    p.recoveryTime = 0;
    p.alive = true;
    mpopData.push(p);
  }
  totalPop = mpopData.length;
  mpopProps = Object.keys(mpopData[0]);
};


//conditions
conditions = {
  'incubating': {
    key: "exposedTime",
    value: 3 / 365,
    check: QKit.Utils.ltEq,
    data: mpopData
  },
  'exposed': {
    key: "exposed",
    value: true,
    check: QKit.Utils.equalTo,
    data: mpopData
  },
  'succeptible': {
    key: "succept",
    value: true,
    check: QKit.Utils.equalTo,
    data: mpopData
  },
  'alive': {
    key: "alive",
    value: true,
    check: QKit.Utils.equalTo,
    data: mpopData
  },
  'recovering': {
    key: "recoveryTime",
    value: 4 / 365,
    check: QKit.Utils.ltEq,
    data: mpopData
  },
  'recovered': {
    key: "recoveryTime",
    value: 4 / 365,
    check: QKit.Utils.gtEq,
    data: mpopData
  },
  'immune': {
    key: "removed",
    value: 4 / 365,
    check: QKit.Utils.ltEq,
    data: mpopData
  }
};

//actions
actions = {
  'incubate': function(person) {
    person.exposedTime += 1 / 365;
  },
  'recover': function(person) {
    person.recoveryTime += 1 / 365;
  },
  'makeOld': function(person) {
    person.age += 1 / 365;
  },
  'encounter': function(person) {
    random = chance.integer({
      min: 0,
      max: totalPop - 1
    });
    person.exposed = mpopData[random].exposed;
  },
  'unsucceptible': function(person) {
    person.succept = false;
  },
  'remove': function(person) {
    person.removed = true;
  }
};

//nodes
var Remove = new QKit.BTAction("Remove", conditions.recovered, actions.remove);
var Recover = new QKit.BTAction("Recover", conditions.recovering, actions.recover);
var Incubate = new QKit.BTAction("Incubate", conditions.incubating, actions.incubate);
var SelectPeriod = new QKit.BTSelector("Select-Period", [Incubate, Recover, Remove]);
var Exposed = new QKit.BTCondition("Is-Exposed", conditions.exposed);
var SeqExposed = new QKit.BTSequence("Exposed", [Exposed, SelectPeriod]);
var EncounterResult = new QKit.BTAction("Encounter-Result", conditions.exposed, actions.unsucceptible);
var Succeptible = new QKit.BTAction("Succeptible-Encounter", conditions.succeptible, actions.encounter);
var SeqSucceptible = new QKit.BTSequence("Succeptible", [Succeptible, EncounterResult]);
var Status = new QKit.BTSelector("Branch", [SeqSucceptible, SeqExposed]);
var MRoot = new QKit.BTRoot("Entry", [Status]);
var MBHTree = new QKit.BehaviorTree(MRoot, mpopData, conditions, actions);
genPopulation(1000);
