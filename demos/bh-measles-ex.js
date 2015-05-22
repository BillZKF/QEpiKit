//population
var popData = [];
var popProps = [];
var totalPop = 0;
var genPopulation = function(number){
	var p = {};
	for (var i = 0; i < number; i++){
		p.id = i;
		p.age = chance.integer({min: 0, max : 25});
		p.exposed = chance.bool({likelihood : 5});;
		p.succept = p.exposed === true ? false : chance.bool({likelihood : 95});
		p.removed = false;
		p.exposedTime = 0;
		p.recoveryTime = 0;
		p.alive = true;
		popData.push(p);
		p = {};
	}
	totalPop = popData.length;
	popProps = Object.keys(popData[0]);
	popProps.unshift('day');
}


//conditions
var incubating = {key:"exposedTime", value : 3 / 365, check : QKit.BehaviorTree.ltEq, data : popData};
var exposed = {key:"exposed", value : true, check : QKit.BehaviorTree.equalTo, data : popData};
var succeptible = {key:"succept", value : true, check : QKit.BehaviorTree.equalTo, data : popData};
var alive = {key:"alive", value : true, check : QKit.BehaviorTree.equalTo, data : popData};
var recovering = {key:"recoveryTime", value : 4 / 465, check: QKit.BehaviorTree.ltEq, data : popData};
var recovered = {key:"recoveryTime", value : 4 / 465, check: QKit.BehaviorTree.gtEq, data : popData};
var immune = {key:"removed", value : 4 / 465, check: QKit.BehaviorTree.ltEq, data : popData};

//actions
var incubate = function(person){ person.exposedTime += 1 / 365;};
var recover = function(person){ person.recoveryTime += 1 /365;};
var makeOld = function(person){ person.age += 1 / 365;};
var encounter = function(person){
	var random = chance.integer({min : 0, max : totalPop - 1});
	person.exposed = popData[random].exposed;
 };
var unsucceptible = function(person){ person.succept = false;};
var remove = function(person){ person.removed = true;};

//nodes
var Remove = new QKit.BTAction("Remove", recovered, remove);
var Recover = new QKit.BTAction("Recover", recovering, recover);
var Incubate = new QKit.BTAction("Incubate", incubating, incubate);
var SelectPeriod = new QKit.BTSelector("Select-Period", [Incubate, Recover, Remove]);
var Exposed = new QKit.BTCondition("Is-Exposed", exposed);
var SeqExposed = new QKit.BTSequence("Exposed", [Exposed, SelectPeriod]);
var EncounterResult = new QKit.BTAction("Encounter-Result", exposed, unsucceptible);
var Succeptible = new QKit.BTAction("Succeptible-Encounter", succeptible, encounter);
var SeqSucceptible = new QKit.BTSequence("Succeptible", [Succeptible, EncounterResult]);
var Status = new QKit.BTSelector("Branch", [SeqSucceptible, SeqExposed]);
var Root = new QKit.BTRoot("Entry", [Status] );
var BHTree =  new QKit.BehaviorTree(Root, popData);
