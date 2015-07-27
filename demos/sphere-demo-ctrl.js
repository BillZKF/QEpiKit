angular.module("sphereApp", ['ngRoute'])
  .config(["$routeProvider", function($routeProvider) {
    $routeProvider
      .when('/new/', {
        templateUrl: 'sphere-new.html',
        controller: 'sphereDemoCtrl'
      })
      .when('/update/', {
        templateUrl: 'sphere-current.html',
        controller: 'sphereDemoCtrl'
      })
      .when('/forecast/', {
        templateUrl: 'sphere-forecast.html',
        controller: 'sphereDemoCtrl'
      });
  }])

.controller("sphereDemoCtrl", function($scope, $rootScope) {
  $scope.householdCount = $rootScope.householdCount || 1;
  $scope.forecastLength = $rootScope.forecastLength || 60;
  $scope.resources = $rootScope.resources || {
    "waterTransportContainers": {
      label: "water transport containers",
      amount: 0,
      units: "10-20 litre"
    },
    "waterStorageContainers": {
      label: "water storage containers",
      amount: 0,
      units: "10-20 litre"
    },
    "bathingSoap": {
      label: "bathing soap",
      amount: 0,
      units: "250g bars"
    },
    "laundrySoap": {
      label: "laundry soap",
      amount: 0,
      units: "200g packet"
    },
    "menstrualHygeineCotton": {
      label: "menstrual hygeine cotton",
      amount: 0,
      units: "standard issue"
    },
    "totalWater": {
      label: "total water",
      amount: 0,
      units: "liters"
    },
    "waterTaps": {
      label: "water taps",
      amount: 0,
      units: "taps"
    },
    "tolietPaper": {
      label: "toilet paper",
      amount: 0,
      units: "rolls"
    }
  };

  $scope.facilities = $rootScope.facilities || {
    "latrines": [{
      label: "pit latrine",
      working: true,
      capacity: 0.5,
      type: "male",
      units: "m3",
      status: 0
    }, {
      label: "ventilated latrine",
      working: true,
      capacity: 0.5,
      type: "female",
      units: "m",
      status: 0
    }]
  };

  $scope.getAgents = function() {
    $scope.agents = genPop(Math.ceil($scope.householdCount * 3.3));
    $rootScope.agents = $scope.agents;
  };

  $scope.sphereAllocations = {
    waterPerPerson: 15,
    totalWater: function(pop, days) {
      return pop * this.waterPerPerson * days;
    },
    perHouseholdOtherItems: function(hh, days, interval) {
      return hh * Math.ceil(days / interval);
    },
    perPersonOtherItems: function(pop, days, interval) {
      return pop * Math.ceil(days / interval);
    }
  };

  $scope.demographics = function() {
    var demos = {
      "0-1": {
        "male": 0,
        "female": 0
      },
      "2-4": {
        "male": 0,
        "female": 0
      },
      "under5": {
        "male": 0,
        "female": 0
      },
      "5-7": {
        "male": 0,
        "female": 0
      },
      "8-14": {
        "male": 0,
        "female": 0
      },
      "15-20": {
        "male": 0,
        "female": 0
      },
      "21-30": {
        "male": 0,
        "female": 0
      },
      "31-40": {
        "male": 0,
        "female": 0
      },
      "41-50": {
        "male": 0,
        "female": 0
      },
      "50+": {
        "male": 0,
        "female": 0
      },
      "reproductiveAge": {
        "male": 0,
        "female": 0
      },
      "all": {
        "male": 0,
        "female": 0
      }
    };

    $scope.agents.forEach(function(a) {
      if (a.age < 5) {
        demos.under5[a.sex] += 1;
      } else if (a.age > 8 && a.age < 50) {
        demos.reproductiveAge[a.sex] += 1;
        a.reproductiveAge = true;
      }
      demos.all[a.sex] += 1;
    });
    return demos;
  };

  $scope.calcNeeds = function() {
    var withBuffer = $scope.forecastLength + 10;
    var pop = $scope.agents.length + Math.round($scope.agents.length * 0.2);
    var hh = $scope.householdCount + Math.round($scope.householdCount * 0.2);
    var mhi = $scope.sphereAllocations.perHouseholdOtherItems(hh, withBuffer, 30);
    var mpi = $scope.sphereAllocations.perPersonOtherItems(pop, withBuffer, 30);
    var demo = $scope.demographics();
    $scope.resources.totalWater.amount = $scope.sphereAllocations.totalWater(pop, withBuffer);
    $scope.resources.waterTaps.amount = Math.ceil(pop / 200);
    $scope.resources.tolietPaper.amount = mpi;
    $scope.resources.laundrySoap.amount = mpi;
    $scope.resources.bathingSoap.amount = mpi;
    $scope.resources.waterStorageContainers.amount = hh;
    $scope.resources.waterTransportContainers.amount = hh;
    $scope.resources.menstrualHygeineCotton.amount = demo.reproductiveAge.female * 20;
    //facilities
    var femaleMin = Math.ceil(demo.all.female / 20);
    var maleMin = Math.ceil(demo.all.male / 20);
    $scope.facilities = {
      latrines: []
    };
    $scope.addFacility({
      label: "pit latrine",
      working: true,
      capacity: 0.5,
      type: "female",
      units: "m3",
      status: 0
    }, "latrines", femaleMin);

    $scope.addFacility({
      label: "pit latrine",
      working: true,
      capacity: 0.5,
      type: "male",
      units: "m3",
      status: 0
    }, "latrines", maleMin);
    $rootScope.resources = $scope.resources;
    $rootScope.facilities = $scope.facilities;
    $rootScope.householdCount = $scope.householdCount;
    $rootScope.forecastLength = $scope.forecastLength;
  };

  $scope.addFacility = function(template, type, number) {
    for (var i = 0; i < number; i++) {
      $scope.facilities[type].push(JSON.parse(JSON.stringify(template)));
    }
  };

  $scope.forecast = function() {
    if ($rootScope.resources) {
      $scope.w = new Worker("sphere-main.js");
      var modelData = [$rootScope.agents, $rootScope.resources, $rootScope.facilities, $rootScope.forecastLength];
      $scope.w.postMessage(modelData);

      $scope.w.onmessage = function(event) {
        var ResDiagram = new QEpiKit.renderer.resourceLineChart(event.data[0], event.data[1], "resources-forecast", "amount");
        var FacDiagram = new QEpiKit.renderer.facilitiesLineChart(event.data[0], event.data[1], "facilities-forecast", "latrines");
        $scope.barriers = event.data[2][0].barriers;
        $scope.$digest();
      };
    }
  };
});
