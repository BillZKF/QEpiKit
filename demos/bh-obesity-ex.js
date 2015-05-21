var popData = [
		{age:30, bmi: 25, doctorFq: 1 / 365, doctor: 0, exercise: 1},
		{age:70, bmi: 31, doctorFq: 3/ 365, doctor: 0, exercise: 1},
	];
	
var loseWeight = function(person){ person.bmi = person.bmi - (0.1 * person.exercise);};
var gainWeight = function(person){ person.bmi = person.bmi + 0.001;};
var makeTime = function(person){ if(person.exercise < 7){seeDoctor(person); person.exercise += 2;  person.doctorFq *= 2;};};
var makeDead = function(person){ person.dead = true;};
var makeOld = function(person){ person.age += 1 / 365; person.doctor += person.doctorFq;};
var makeSed = function(person){if(person.exercise > 0.1){ person.exercise = person.exercise - 0.01;} else {person.exercise = 0; gainWeight(person);}};
var seeDoctor = function(person){person.doctor = 0;};


var HeartAttack = new QKit.BTAction("are-they-at-great-risk-of-a-heart-attack", {key: "bmi", value :45, check : QKit.BehaviorTree.gtEq, data : popData}, makeDead);
var HealthScare = new QKit.BTAction("health-scare", {key: "doctor", value :0.5, check : QKit.BehaviorTree.gtEq, data : popData}, makeTime);
var NoContact = new QKit.BTAction("no-doctor-contact", {key: "exercise", value :3, check : QKit.BehaviorTree.ltEq, data : popData}, gainWeight);
var SelectSedObese = new QKit.BTSelector("are-they-sedentary", [HeartAttack, HealthScare, NoContact]);
var ActiveObese = new QKit.BTAction("are-they-active", {key: "exercise", value : 3, check : QKit.BehaviorTree.gtEq, data : popData}, loseWeight);
var CondObese = new QKit.BTCondition("is-the-person-obese", {key: "bmi", value : 28, check : QKit.BehaviorTree.ltEq, data : popData});
var SelectObese = new QKit.BTSelector("select-obese", [CondObese, ActiveObese, SelectSedObese]);
var Age = new QKit.BTAction("is-person-an-adult", {key:"age", value : 21, check : QKit.BehaviorTree.gtEq, data : popData}, makeOld);
var Sed = new QKit.BTAction("is-this-person-sedentary", {key:"age", value : 28, check : QKit.BehaviorTree.gtEq, data : popData}, makeSed);
var Doctor = new QKit.BTAction("is-this-person-seeing-a-doctor", {key:"doctor", value : 1, check : QKit.BehaviorTree.gtEq, data : popData}, seeDoctor);
var SequenceAge = new QKit.BTSequence("sequence-age", [Age, Sed, Doctor]);
var Dead = new QKit.BTCondition("is-person-dead", {key:"dead", value : true, check : QKit.BehaviorTree.equalTo, data : popData});
var Status = new QKit.BTSelector("select-status", [Dead, SequenceAge, SelectObese]);
var Root = new QKit.BTRoot("root", [Status] );
var BHTree =  new QKit.BehaviorTree(Root, popData);