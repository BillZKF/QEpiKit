give = function(A, B, item, quantity) {
  if (A[item].amount > quantity) {
    if (typeof(B[item]) === 'undefined') {
      B[item] = {};
      B[item].amount = 0;
    }
    A[item].amount -= quantity;
    B[item].amount += quantity;
  } else {
    //console.log("out of " + item);
  }
};

var events = {
  "issueSoap": function(person) {
    give(campEnv.resources, person.resources, "bathingSoap", 1);
  },
  "issueLaundrySoap": function(person) {
    give(campEnv.resources, person.resources, "laundrySoap", 1);
  },
  "issueHygWater": function(person) {
    give(campEnv.resources, person.resources, "totalWater", 6);
  },
  "issueMenstrualProd": function(person) {
    give(campEnv.resources, person.resources, "menstrualHygeineCotton", 6);
  },
  "issueToiletPaper": function(person) {
    give(campEnv.resources, person.resources, "tolietPaper", 1);
  }

};

var eventsQueue = {
  0: {
    trigger: function(agents) {
      for (var i = 0; i < agents.length; i++) {
        events.issueSoap(agents[i]);
        events.issueToiletPaper(agents[i]);
        events.issueLaundrySoap(agents[i]);
        if (agents[i].sex === "female" && agents[i].reproductiveAge) {
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
        if (agents[i].sex === "female" && agents[i].reproductiveAge) {
          events.issueMenstrualProd(agents[i]);
        }
      }
    },
    triggered: false
  },
  50: {
    trigger: function(agents) {
      var l, per = Math.floor(campEnv.resources.facilities.latrines.length * 0.1);
      for (var i = 0; i < per ; i++) {
        l = random.integer(0, campEnv.resources.facilities.latrines.length);
        campEnv.resources.facilities.latrines[l].working = false;
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
