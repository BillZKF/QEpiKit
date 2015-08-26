describe('A Utility System', function() {
  var Sys, cHealth, cMoney, cFreeTime, oSurgery, oExAndDiet;
  beforeEach(function() {
    cAvailability = {
      name: 'available',
      x: function(subject, optionParams) {
        var t = subject.freeTime - optionParams.timeCommitment;
        if (t < this.extents[0]) t = 0;
        else if (t > this.extents[1]) t = this.extents[1];
        return t / this.extents[1];
      },
      extents: [0, 200],
      f: QEpiKit.exponential,
      m: 0,
      b: 0,
      k: 2
    };
    cAffordability = {
      name: 'affordable',
      x: function(subject, optionParams) {
        var a = subject.wealth - optionParams.cost;
        if (a < this.extents[0]) a = 0;
        else if (a > this.extents[1]) a = this.extents[1];
        return a / this.extents[1];
      },
      extents: [0, 1000],
      f: QEpiKit.linear,
      m: 1 / 3,
      b: 0,
      k: 0
    };
    cEffective = {
      name: 'effective',
      x: function(subject, optionParams) {
        var b = (subject.bmi - subject.bmiGoal);
        var a = b - optionParams.bmiLoss;
        if (a < this.extents[0]) a = 0;
        else if (a > this.extents[1]) a = this.extents[1];
        return a / this.extents[1];
      },
      extents: [0, 10],
      f: QEpiKit.exponential,
      m: 0,
      b: 0,
      k: 2
    };
    people = [{
      bmiGoal: 29,
      wealth: 100000,
      freeTime: 20,
      bmi: 36
    }, {
      bmiGoal: 31,
      wealth: 1000,
      freeTime: 180,
      bmi: 33
    }];
    oSurgery = {
      name: 'gastericBypass',
      params: {
        bmiLoss: 5,
        cost: 10000,
        timeCommitment: 2
      },
      considerations: [cEffective, cAffordability, cAvailability],
      action: function(person) {
        person.bmi = person.bmi - oSurgery.params.bmiLoss;
      }
    };
    oExAndDiet = {
      name: 'exerciseAndDiet',
      params: {
        bmiLoss: 3,
        cost: 100,
        timeCommitment: 200
      },
      considerations: [cEffective, cAffordability, cAvailability],
      action: function(person) {
        person.bmi = person.bmi - oExAndDiet.params.bmiLoss;
      }
    };

    Sys = new QEpiKit.USys('weight-loss-options', [oExAndDiet, oSurgery], people);
  });

  it('should construct a new Usys', function() {
    expect(Sys.id.length).toBe(36);
    expect(Sys.name).toBe('weight-loss-options');
    expect(Sys.data).toBe(people);
    expect(Sys.options[0].name).toBe('exerciseAndDiet');
  });

  it('should have an update method', function() {
    Sys.update(1);
    //person 0 should have selected gastric Bypass
    expect(people[0].top.name).toBe("gastericBypass");
    expect(people[1].top.name).toBe("exerciseAndDiet");
  });
});
