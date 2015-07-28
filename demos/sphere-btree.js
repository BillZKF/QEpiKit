var conditions = {
  "hasSoap": {
    key: "bathingSoap",
    value: 0,
    check: QEpiKit.Utils.gt
  },
  "hasHygWater": {
    key: "hygWater",
    value: 0,
    check: QEpiKit.Utils.gt
  },
  "hasMenstrualProduct": {
    key: "menstrualHygeineCotton",
    value: 0,
    check: QEpiKit.Utils.gt
  },
  "hasLaundrySoap": {
    key: "menstrualHygeineCotton",
    value: 0,
    check: QEpiKit.Utils.gt
  },
  "isActive": {
    key: "active",
    value: true,
    check: QEpiKit.Utils.equalTo
  },
  "isFemale": {
    key: "sex",
    value: "female",
    check: QEpiKit.Utils.equalTo
  },
  "isReproductiveAge": {
    key: "reproductiveAge",
    value: true,
    check: QEpiKit.Utils.gtEq
  }
};

var actions = {
  "useSoap": function(person) {
    //use  250g soap bar at ~8.5g per day
    person.resources.bathingSoap.amount -= 0.031 * step;
  },
  "useHygWater": function(person) {
    //use 6l per day
    campEnv.resources.totalWater.amount -= 3.5 * step + random.integer(-1, 2);
  },
  "useCookingWater": function(person) {
    //use 6l per day
    campEnv.resources.totalWater.amount -= 3.5 * step + random.integer(-1, 2);
  },
  "useDrinkingWater": function(person) {
    //use 6l per day
    campEnv.resources.totalWater.amount -= 4.5 * step + random.integer(-1, 2);
  },
  "useMenstrualProd": function(person) {
    //use 8 every 28 days
    person.resources.menstrualHygeineCotton.amount -= (6 / 28) * step;
  },
  "useTP": function(person) {
    //use 8 every 28 days
    person.resources.tolietPaper.amount -= (1 / 30) * step;
  },
  "useLatrine": function(person) {
    //FIXME not optimized
    var options = [],
      selection, excretion;
    person.needsLatrine = true;

    campEnv.resources.facilities.latrines.forEach(function(d, index) {
      if (d.working && d.type === person.sex) {
        options.push(index);
      }
    });
    if (options.length > 0) {
      selection = options[Math.floor(random.real(0, 1) * options.length)];
      excretion = (0.15 + (person.mass * 0.001)) * 0.001;
      campEnv.resources.facilities.latrines[selection].status += excretion;
      person.needsLatrine = false;
      if (campEnv.resources.facilities.latrines[selection].status >= campEnv.resources.facilities.latrines[selection].capacity) {
        campEnv.resources.facilities.latrines[selection].working = false;
      }
    }
  },
  "doLaundry": function(person) {
    //use 30 grams laundry soap every five days and 2.5 liters of water every five days.
    person.resources.laundrySoap.amount -= 0.15 / 5 * step;
    campEnv.resources.totalWater.quantity -= 2.5 / 5 * step;
  }
};

//What do the people actually do!? By Behavior Tree!
var UseMenstrualProduct = new QEpiKit.BTAction("use-menstr-prod", conditions.isReproductiveAge, actions.useMenstrualProd);
var IsFemale = new QEpiKit.BTCondition("female-8-50?", conditions.isFemale);
var Menstration = new QEpiKit.BTSequence("menstruates", [IsFemale, UseMenstrualProduct]);
var UseHygWater = new QEpiKit.BTAction("use-bathing-water", conditions.isActive, actions.useHygWater);
var DoLaundry = new QEpiKit.BTAction("do-laundry", conditions.isActive, actions.doLaundry);
var UseSoap = new QEpiKit.BTAction("use-soap", conditions.isActive, actions.useSoap);
var HygieneSequence = new QEpiKit.BTSequence("hygiene-sequence", [UseHygWater, UseSoap, DoLaundry, Menstration]);
var UseTP = new QEpiKit.BTAction("use-toilet-paper", conditions.isActive, actions.useTP);
var UseLatrine = new QEpiKit.BTAction("use-latrine", conditions.isActive, actions.useLatrine);
var UseDrinkingWater = new QEpiKit.BTAction("use-drinking-water", conditions.isActive, actions.useDrinkingWater);
var UseCookingWater = new QEpiKit.BTAction("use-cooking-water", conditions.isActive, actions.useCookingWater);
var WasteSequence = new QEpiKit.BTSequence("waste-sequence", [UseLatrine]);
var ConsumeSequence = new QEpiKit.BTSequence("water-use-sequence", [UseDrinkingWater, UseCookingWater]);
var DailySequence = new QEpiKit.BTSequence("daily", [ WasteSequence, ConsumeSequence,HygieneSequence]);
var BTRoot = new QEpiKit.BTRoot("start", [DailySequence]);
