/*describe("A Belief Desire Intent Agent", function() {
  var Decider, environment = [{
      vaccineCache: 3500000,
      vaccineUsed: 0,
      schoolsOpen: false,
      incidence: 100
    }],
    eventQueue = {
      5: function() {
        environment.incidence += 5;
      },
      10: function() {
        environment.incidence += 30;
      }
    };
  goals = [{
      key: "vaccineCache",
      value: 15000000,
      check: QEpiKit.Utils.gt,
      data: environment
    }, {
      key: "schoolsOpen",
      value: true,
      check: QEpiKit.Utils.equalTo,
      data: environment
    }],
    plans = {
      useVacc: function(amt) {
        if (amt <= enviroment.vaccineCache) {
          environment.vaccineUsed += amt;
          enviroment.vaccineCache -= amt;
        }
      },
      openSchool: function() {
        environment.schoolsOpen = true;
      },
      closeSchool: function() {
        environment.schoolsOpen = false;
      },
      checkIncidence: function() {
        environment.incidence *= environment.vaccineUsed / (environment.vaccineUsed * environment.vaccineCache);
      }
    };

  it("should take the current state of the data, create a new belief", function() {
    Decider = new QEpiKit.BDIAGent(goals, plans, environment);
  });
});*/
