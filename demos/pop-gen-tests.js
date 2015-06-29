self.importScripts("http://localhost:7683/bower_components/chance/chance.js","../dist/utils.js","../dist/behaviorTree.js","libs/jstat.min.js");
//BTREE pop gen method
postMessage("Initializing: ");
var chance1 = chance;

function empty(number) {
  var emptyData = [];
  for (var i = 0; i < number; i++) {
    emptyData[i] = {
      id: i,
      alive: true
    };
  }
  return emptyData;
}

function emptyPatch(number, starter, capacity) {
  var emptyData = [];
  for (var i = 0; i < number; i++) {
    emptyData[i] = {
      id: i
    };
    if (starter) {
      emptyData[i].capacity = chance1.integer({
        max: capacity,
        min: Math.round(0.68 * capacity)
      });
      emptyData[i].count = 0;
      emptyData[i][starter] = {};
    }
  }
  return emptyData;
}

var popData = empty(2500);
var regions = emptyPatch(25, "residents", 600);
var schools = emptyPatch(15, "students", 500);
var workplaces = emptyPatch(15, "workers", 700);

var conditions = {
  "existsAge": {
    key: "age",
    value: false,
    check: QKit.Utils.hasProp,
    data: popData
  },
  "existsSex": {
    key: "sex",
    value: false,
    check: QKit.Utils.hasProp,
    data: popData
  },
  "existsIncomeGroup": {
    key: "incomeGroup",
    value: false,
    check: QKit.Utils.hasProp,
    data: popData
  },
  "existsMass": {
    key: "mass",
    value: false,
    check: QKit.Utils.hasProp,
    data: popData
  },
  "existsLocation": {
    key: "location",
    value: false,
    check: QKit.Utils.hasProp,
    data: popData
  },
  "existsExposed": {
    key: "exposed",
    value: false,
    check: QKit.Utils.hasProp,
    data: popData
  },
  "existsInfectious": {
    key: "infectious",
    value: false,
    check: QKit.Utils.hasProp,
    data: popData
  },
  "existsSucceptible": {
    key: "succeptible",
    value: false,
    check: QKit.Utils.hasProp,
    data: popData
  },
  "isUnder3": {
    key: "age",
    value: 3,
    check: QKit.Utils.lt,
    data: popData
  },
  "isUnder19": {
    key: "age",
    value: 19,
    check: QKit.Utils.lt,
    data: popData
  },
  "isUnder65": {
    key: "age",
    value: 65,
    check: QKit.Utils.lt,
    data: popData
  },
  "isOver19": {
    key: "age",
    value: 19,
    check: QKit.Utils.gtEq,
    data: popData
  },
  'incubating': {
    key: "exposedT",
    value: 3 / 365,
    check: QKit.Utils.ltEq,
    data: popData
  },
  'exposed': {
    key: "exposed",
    value: true,
    check: QKit.Utils.equalTo,
    data: popData
  },
  'succeptible': {
    key: "succept",
    value: true,
    check: QKit.Utils.equalTo,
    data: popData
  },
  'alive': {
    key: "alive",
    value: true,
    check: QKit.Utils.equalTo,
    data: popData
  },
  'recovering': {
    key: "infectiousT",
    value: 4 / 365,
    check: QKit.Utils.ltEq,
    data: popData
  },
  'recovered': {
    key: "infectiousT",
    value: 4 / 365,
    check: QKit.Utils.gtEq,
    data: popData
  },
  'immune': {
    key: "removed",
    value: 4 / 365,
    check: QKit.Utils.ltEq,
    data: popData
  }
};

var actions = {
  "setAge": function(person) {
    person.age = chance1.integer({
      min: 1,
      max: 85
    });
  },
  "setSex": function(person) {
    person.sex = chance1.pick(["male", "female"]);
  },
  "setIncomeGroup": function(person) {
    //low to high
    person.incomeGroup = chance1({
      min: 1,
      max: 5
    });
  },
  "setMass": function(person) {
    var percentile = chance1.floating({
      min: 0,
      max: 1
    });
    person.mass = person.sex === "female" ? jStat.normal.inv(percentile, 60, 5) : jStat.normal.inv(percentile, 75, 8);
  },
  "setParent": function(person) {
    person.parent = null;
    var reg = regions[person.region].residents;
    var percentile = chance1.floating({
      min: 0,
      max: 1
    });
    for (var res in reg) {
      if (person.parent === null) {
        if (Number(res) !== person.id && !isNaN(Number(res))) {
          var ageDiff = popData[res].age - person.age;
          if (ageDiff >= 19 && ageDiff <= 50 && popData[res].sex === "female") {
            var currentKids = popData[res].children || [];
            var maxKids = popData[res].maxKids || Math.round(jStat.normal.inv(percentile, 2.1, 1.8));
            if (currentKids.length < maxKids) {
              person.parent = res;
              currentKids.push({
                id: person.id,
                age: person.age
              });
              popData[res].children = currentKids;
            }
          }
        }
      }
    }
  },
  "setExposed": function(person) {
    person.exposed = chance1.bool({
      likelihood: 1
    });
    person.exposedT = 0;
  },
  "setInfectious": function(person) {
    person.infectious = false;
    person.infectiousT = 0;
  },
  "setSucceptible": function(person) {
    if (person.exposed) {
      person.succeptible = false;
    } else {
      person.succeptible = true;
    }
    person.removed = false;
  },
  "setLocation": function(person) {
    person.location = null;
    for (var i = 0; i < regions.length; i++) {
      if (person.location === null && regions[i].count <= regions[i].capacity) {

        var residents = regions[i].residents;
        residents[person.id] = {
          age: person.age
        };
        for (var other in residents) {
          if (Number(other) !== person.id && !isNaN(Number(other))) {
            contactFreq = (44 - Math.abs(person.age - 44)) / 44;
            residents[person.id][other] = contactFreq;
            residents[other][person.id] = contactFreq;
          }
        }
        regions[i].count++;
        person.region = i;
        person.location = chance1.coordinates();
      }
    }
  },
  "setWork": function(person) {
    person.work = null;
    for (var i = 0; i < workplaces.length; i++) {
      if (person.work === null && workplaces[i].count <= workplaces[i].capacity) {
        var workers = workplaces[i].workers,
          workerCount = workplaces[i].count;
        workers[person.id] = {
          age: person.age
        };
        for (var other in workers) {
          if (Number(other) !== person.id && !isNaN(Number(other))) {
            contactFreq = (46 - Math.abs(person.age - workers[other].age)) / 46;
            workers[person.id][other] = contactFreq * 0.8;
            workers[other][person.id] = contactFreq * 0.8;
          }
        }
        workplaces[i].count += 1;
        person.work = Number(workplaces[i].id);
      }
    }
  },
  "setSchool": function(person) {
    person.school = null;
    for (var i = 0; i < schools.length; i++) {
      if (person.school === null && schools[i].count <= schools[i].capacity) {
        var stdnts = schools[i].students,
          stdntCount = schools[i].count;
        stdnts[person.id] = {
          age: person.age
        };
        for (var other in stdnts) {
          if (Number(other) !== person.id && !isNaN(Number(other))) {
            contactFreq = (16 - Math.abs(person.age - stdnts[other].age)) / 16;
            stdnts[person.id][other] = contactFreq;
            stdnts[other][person.id] = contactFreq;
          }
        }
        schools[i].count += 1;
        person.school = i;
      }
    }
  },
  "parentEncounters": function(person) {
    if (!person.removed && popData[person.parent].succeptible) {
      popData[person.parent].exposed = chance1.bool({
        likelihood: 80
      });
      if (popData[person.parent].exposed) {
        popData[person.parent].succeptible = false;
        WhomInfectsWhom.push({
          type: "parentByChild",
          infected: person.parent,
          by: person.id,
          infectedAge: popData[person.parent].age,
          byAge: person.age,
          time: person.time
        });
      }

    }
  },
  "childEncounters": function(person) {
    if (!person.removed) {
      for (var i = 0; i < person.children.length; i++) {
        if (!popData[person.children[i].id].exposed) {
          popData[person.children[i].id].exposed = chance1.bool({
            likelihood: 60
          });
          if (popData[person.children[i].id].exposed) {
            popData[person.children[i].id].succeptible = false;
            WhomInfectsWhom.push({
              type: "childByParent",
              infected: popData[person.children[i].id].id,
              by: person.id,
              infectedAge:  popData[person.children[i].id].age,
              byAge: person.age,
              time: person.time
            });
          }
        }
      }
    }
  },
  "workEncounters": function(person) {
    if (!person.removed) {
      for (var con in workplaces[person.work].workers[person.id]) {
        if (con !== "age") {
          var contact = person.time % Math.round(11  - (10 * workplaces[person.work].workers[person.id][con]));
          if (contact === 0 && popData[con].succeptible) {
            popData[con].exposed = chance1.bool({
              likelihood: 1.5
            });
            if (popData[con].exposed) {
              popData[con].succeptible = false;
              WhomInfectsWhom.push({
                type: "workplace",
                infected: con,
                by: person.id,
                infectedAge: popData[con].age,
                byAge: person.age,
                time: person.time
              });
            }
          }
        }
      }
    }
  },
  "communityEncounters": function(person) {
    if (!person.removed) {
      for (var con in regions[person.region].residents[person.id]) {
        if (con !== "age") {
          var contact = person.time % Math.round(11  - (10 * regions[person.region].residents[person.id][con]));
          if (contact === 0 && popData[con].succeptible) {
            popData[con].exposed = chance1.bool({
              likelihood: 0.5
            });
            if (popData[con].exposed) {
              popData[con].succeptible = false;
              WhomInfectsWhom.push({
                type: "community",
                infected: Number(con),
                by: person.id,
                infectedAge: popData[con].age,
                byAge: person.age,
                time: person.time
              });
            }
          }
        }
      }
    }
  },
  "schoolEncounters": function(person) {
    if (!person.removed) {
      for (var con in schools[person.school].students[person.id]) {
        if (con !== "age") {
          var contact = person.time % Math.round(11  - (10 * schools[person.school].students[person.id][con]));
          if (contact === 0 && popData[con].succeptible) {
            popData[con].exposed = chance1.bool({
              likelihood: 2.0
            });
            if (popData[con].exposed) {
              popData[con].succeptible = false;
              WhomInfectsWhom.push({
                type: "school",
                infected: con,
                by: person.id,
                infectedAge: popData[con].age,
                byAge: person.age,
                time: person.time
              });
            }
          }
        }
      }
    }
  },
  'incubate': function(person) {
    person.exposedT += 1 / 365;
    person.exposed = true;
    person.succeptible = false;
  },
  'recover': function(person) {
    person.infectiousT += 1 / 365;
    person.infectious = true;
  },
  'makeOld': function(person) {
    person.age += 1 / 365;
    person.time += 1;
  },
  'encounters': function(person) {
    if (person.parent) {
      actions.parentEncounters(person);
    }
    if (person.children) {
      actions.childEncounters(person);
    }
    if (person.school || person.school === 0) {
      actions.schoolEncounters(person);
    }
    if (person.work || person.work === 0) {
      actions.workEncounters(person);
    }
    if (person.region || person.region === 0) {
      actions.communityEncounters(person);
    }
  },
  'unsucceptible': function(person) {
    person.succeptible = false;
  },
  'remove': function(person) {
    person.removed = true;
    person.infectious = false;
    person.succeptible = false;
  }
};

var WhomInfectsWhom = [];
//Set Demographics & State
var SetSucceptible = new QKit.BTAction("set-succeptible", conditions.existsSucceptible, actions.setSucceptible);
var SetInfectious = new QKit.BTAction("set-infectious", conditions.existsInfectious, actions.setInfectious);
var SetExposed = new QKit.BTAction("set-exposed", conditions.existsExposed, actions.setExposed);
var SequenceState = new QKit.BTSequence("sequence-state", [SetExposed, SetInfectious, SetSucceptible]);
var SetLocation = new QKit.BTAction("set-location", conditions.existsLocation, actions.setLocation);
var SetMass = new QKit.BTAction("set-mass", conditions.existsMass, actions.setMass);
var SetParent = new QKit.BTAction("set-sex", conditions.isUnder19, actions.setParent);
var SetSex = new QKit.BTAction("set-sex", conditions.existsSex, actions.setSex);
var SetAge = new QKit.BTAction("set-age", conditions.existsAge, actions.setAge);
var SequenceDemographic = new QKit.BTSequence("sequence-demographic", [SetAge, SetSex, SetMass, SetLocation, SequenceState]);
//Set Contacts
var SetWork = new QKit.BTAction("set-work", conditions.isUnder65, actions.setWork);
var SetSchool = new QKit.BTAction("set-school", conditions.isUnder19, actions.setSchool);
var CheckAge = new QKit.BTCondition("is-too-young", conditions.isUnder3);
var SelectActivityGroup = new QKit.BTSelector("select-activity-group", [CheckAge, SetSchool, SetWork]);
var IsAdult = new QKit.BTCondition("is-adult", conditions.isOver19);
var SelectHousehold = new QKit.BTSelector("select-household", [IsAdult, SetParent]);
var SequenceContact = new QKit.BTSequence("sequence-contact", [SelectHousehold, SelectActivityGroup]);
var SelectPhase = new QKit.BTSelector("select-phase", [SequenceDemographic, SequenceContact]);
var Root = new QKit.BTRoot("start", [SelectPhase]);
var PopGen = new QKit.BehaviorTree(Root, popData, conditions, actions);
PopGen.history = [];
PopGen.generateTimeData(1, 1, 1);

//operating
var Encounter = new QKit.BTAction("expose-others", conditions.incubating, actions.encounters);
var Remove = new QKit.BTAction("Remove", conditions.recovered, actions.remove);
var Recover = new QKit.BTAction("Recover", conditions.recovering, actions.recover);
var Incubate = new QKit.BTAction("Incubate", conditions.incubating, actions.incubate);
var JustExposed = new QKit.BTSequence("Incubating", [Incubate, Encounter]);
var SelectPeriod = new QKit.BTSelector("Select-Period", [JustExposed, Recover, Remove]);
var Exposed = new QKit.BTCondition("exposed", conditions.exposed);
var SeqExp = new QKit.BTSequence("exposure-sequence", [Exposed, SelectPeriod]);
var MakeOld = new QKit.BTAction("makeOld", conditions.alive, actions.makeOld);
var General = new QKit.BTSequence("general", [MakeOld]);
var Daily = new QKit.BTSequence("daily", [General, SeqExp]);
var Root = new QKit.BTRoot("Entry", [Daily]);
var BHTree = new QKit.BehaviorTree(Root, popData, conditions, actions);
BHTree.history = [];
BHTree.generateTimeData(1, 90, 3);

var summarizeTimeData = function(data, keys) {
  var results = [];
  for (var step = 0; step < data.length; step++) {
    results[step] = {};
    for (var d in data[step]) {
      for (var key = 0; key < keys.length; key++) {
        if (data[step][d][keys[key]] === true) {
          results[step][keys[key]] = results[step][keys[key]] + 1 || 1;
        }
      }
    }
  }
  return results;
};

postMessage(summarizeTimeData(BHTree.history, ["succeptible","exposed","infectious","removed"]));
postMessage(WhomInfectsWhom);
