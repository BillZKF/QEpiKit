var popData = [];
var popProps = [];
var genPopulation = function(number){
	var p = {};
	for (var i = 0; i < number; i++){
		p.age = chance.integer({min: 21, max : 70});
		p.bmi = chance.integer({min: 24, max : 32});
		p.doctorFq = chance.floating({min: 0, max : 6/365});
		p.doctor = 0;
		p.exercise = chance.integer({min : 0, max : 7});
		popData.push(p);
		p = {};
	}
	popProps = Object.keys(popData[0]);
	popProps.push('dead');
}

//conditions
var adult = {key:"age", value : 21, check : QKit.BehaviorTree.gtEq, data : popData};
var tiredAdult = {key:"age", value : 28, check : QKit.BehaviorTree.gtEq, data : popData};
var obese = {key: "bmi", value : 28, check : QKit.BehaviorTree.ltEq, data : popData};
var morbidlyObese = {key: "bmi", value :38, check : QKit.BehaviorTree.gtEq, data : popData};
var healthScare = {key: "doctor", value :1.1, check : QKit.BehaviorTree.gtEq, data : popData}; // basically increase chance of seeing doctor
var someExercise = {key: "exercise", value : 3, check : QKit.BehaviorTree.gtEq, data : popData};
var minimalExercise = {key: "exercise", value :3, check : QKit.BehaviorTree.ltEq, data : popData};
var timeForDoctor = {key:"doctor", value : 1, check : QKit.BehaviorTree.gtEq, data : popData};
var dead = {key:"dead", value : true, check : QKit.BehaviorTree.equalTo, data : popData};

//actions
var loseWeight = function(person){ person.bmi = person.bmi - (0.1 * person.exercise);};
var gainWeight = function(person){ person.bmi = person.bmi + 0.001;};
var makeTimeForExercise = function(person){ if(person.exercise < 7){seeDoctor(person); person.exercise += 2;  person.doctorFq *= 2;};};
var makeDead = function(person){ person.dead = true;};
var makeOld = function(person){ person.age += 1 / 365; person.doctor += person.doctorFq;};
var makeSed = function(person){if(person.exercise > 0.1){ person.exercise = person.exercise - 0.01;} else {person.exercise = 0; gainWeight(person);}};
var seeDoctor = function(person){person.doctor = 0;};



//nodes
var HeartAttack = new QKit.BTAction("are-they-at-great-risk-of-a-heart-attack",morbidlyObese , makeDead);
var HealthScare = new QKit.BTAction("health-scare", healthScare, makeTimeForExercise);
var NoContact = new QKit.BTAction("no-doctor-contact",minimalExercise, gainWeight);
var SelectSedObese = new QKit.BTSelector("are-they-sedentary", [HeartAttack, HealthScare, NoContact]);
var ActiveObese = new QKit.BTAction("are-they-active", someExercise, loseWeight);
var CondObese = new QKit.BTCondition("is-the-person-obese", obese);
var SelectObese = new QKit.BTSelector("select-obese", [CondObese, ActiveObese, SelectSedObese]);
var Age = new QKit.BTAction("is-person-an-adult", adult, makeOld);
var Sed = new QKit.BTAction("is-this-person-sedentary", tiredAdult, makeSed);
var Doctor = new QKit.BTAction("is-this-person-seeing-a-doctor", timeForDoctor, seeDoctor);
var SequenceAge = new QKit.BTSequence("sequence-age", [Age, Sed, Doctor]);
var Dead = new QKit.BTCondition("is-person-dead", dead );
var Status = new QKit.BTSelector("select-status", [Dead, SequenceAge, SelectObese]);
var Root = new QKit.BTRoot("root", [Status] );
var BHTree =  new QKit.BehaviorTree(Root, popData);
