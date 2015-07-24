angular.module("sphereDemoCtrl", function(){

});
var resources = {
  "waterTransportContainers": {
    label : "water transport containers",
    count: 600
  },
  "waterStorageContainers": {
    label : "water storage containers",
    count: 500
  },
  "bathingSoap": {
    label : "bathing soap",
    count: 2500
  },
  "laundrySoap": {
    label : "laundry soap",
    count: 2200
  },
  "menstrualHygeineCotton": {
    label : "menstrual hygeine cotton",
    count: 5500
  },
  "totalWater": {
    label : "total water",
    quantity: 5.25e5
  },
  "waterTaps": {
    label : "water taps",
    count: 7
  },
  "tolietPaper": {
    label : "toilet paper",
    count: 2400
  },
  "latrines": {
    "male": [{
      working: true,
      capacity: 900,
      sex: "male",
      status: 0
    }, {
      working: true,
      capacity: 700,
      sex: "male",
      status: 0
    }, {
      working: true,
      capacity: 800,
      sex: "male",
      status: 0
    }, {
      working: true,
      capacity: 800,
      sex: "male",
      status: 0
    }],
    "female": [{
      working: true,
      capacity: 800,
      sex: "female",
      status: 0
    }, {
      working: true,
      capacity: 700,
      sex: "female",
      status: 0
    }, {
      working: true,
      capacity: 900,
      sex: "female",
      status: 0
    }, {
      working: true,
      capacity: 800,
      sex: "female",
      status: 0
    }]
  }
};


var transaction = function(A, B, item, quantity) {
  if (A[item].count > quantity) {
    if (typeof(B[item]) === 'undefined') {
      B[item] = {};
      B[item].count = 0;
    }
    A[item].count -= quantity;
    B[item].count += quantity;
  } else {
    console.log("out of " + item);
  }
};

var events = {
  "issueSoap": function(person) {
    transaction(campEnv.resources, person.resources, "bathingSoap", 1);
  },
  "issueLaundrySoap": function(person) {
    transaction(campEnv.resources, person.resources, "laundrySoap", 1);
  },
  "issueHygWater": function(person) {
    transaction(campEnv.resources, person.resources, "totalWater", 6);
  },
  "issueMenstrualProd": function(person) {
    transaction(campEnv.resources, person.resources, "menstrualHygeineCotton", 6);
  },
  "issueToiletPaper": function(person) {
    transaction(campEnv.resources, person.resources, "tolietPaper", 1);
  }

};

var eventsQueue = {
  0: {
    trigger: function(agents) {
      for (var i = 0; i < agents.length; i++) {
        events.issueSoap(agents[i]);
        events.issueToiletPaper(agents[i]);
        events.issueLaundrySoap(agents[i]);
        if (agents[i].sex === "female" && agents[i].age >= 8) {
          events.issueMenstrualProd(agents[i]);
        }
      }
    },
    triggered: false
  },
  30: {
    trigger: function(agents) {
      for (var i = 0; i < agents.length; i++) {
        events.issueSoap(agents[i]);
        events.issueToiletPaper(agents[i]);
        events.issueLaundrySoap(agents[i]);
        if (agents[i].sex === "female" && agents[i].age >= 8) {
          events.issueMenstrualProd(agents[i]);
        }
      }
    },
    triggered: false
  },
  60: {
    trigger: function(agents) {
      for (var i = 0; i < agents.length; i++) {
        events.issueSoap(agents[i]);
        events.issueToiletPaper(agents[i]);
        events.issueLaundrySoap(agents[i]);
        if (agents[i].sex === "female" && agents[i].age >= 8) {
          events.issueMenstrualProd(agents[i]);
        }
      }
    },
    triggered: false
  }
};
