angular.module("sphereDemo", []).controller("sphereDemoCtrl", function($scope) {
  console.log("init demo");
  $scope.resources = {
    "waterTransportContainers": {
      label: "water transport containers",
      amount: 600,
      units: "5 liter buckets"
    },
    "waterStorageContainers": {
      label: "water storage containers",
      amount: 500,
      units: "5 liter buckets"
    },
    "bathingSoap": {
      label: "bathing soap",
      amount: 2500,
      units: "250g bars"
    },
    "laundrySoap": {
      label: "laundry soap",
      amount: 2200,
      units: "200g packet"
    },
    "menstrualHygeineCotton": {
      label: "menstrual hygeine cotton",
      amount: 5500,
      units: "standard issue"
    },
    "totalWater": {
      label: "total water",
      amount: 5.25e5,
      units: "liters"
    },
    "waterTaps": {
      label: "water taps",
      amount: 7,
      units: "taps"
    },
    "tolietPaper": {
      label: "toilet paper",
      amount: 2400,
      units: "rolls"
    }
  };

  $scope.facilities = {
    "latrines": [{
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
      },
      {
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
    };


  transaction = function(A, B, item, quantity) {
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

  $scope.events = {
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

  $scope.eventsQueue = {
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
});
