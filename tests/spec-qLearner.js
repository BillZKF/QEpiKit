describe("Q Learner is a reinforncement learning method", function() {
  beforeEach(function() {
    R = {
      0: {
        0: -1,
        1: -1,
        2: -1,
        3: -1,
        4: 0,
        5: -1
      },
      1: {
        0: -1,
        1: -1,
        2: -1,
        3: 0,
        4: -1,
        5: 100
      },
      2: {
        0: -1,
        1: -1,
        2: -1,
        3: 0,
        4: -1,
        5: -1
      },
      3: {
        0: -1,
        1: 0,
        2: 0,
        3: -1,
        4: 0,
        5: -1
      },
      4: {
        0: 0,
        1: -1,
        2: -1,
        3: 0,
        4: -1,
        5: 100
      },
      5: {
        0: -1,
        1: 0,
        2: -1,
        3: -1,
        4: 0,
        5: 100
      }
    };

    Learner = new QEpiKit.QLearner(R, 0.8, '5');
  });

  it("should learn and change it's Q matrix each learning episode", function(){
      var i =0;
      while(i < 50){
        var random = String(Math.round(Math.random() * 5));
        Learner.episode(random);
        i++;
      }
      Learner.normalize();
      expect(Learner.Q['1']['5']).toBeGreaterThan(0);
  });
});
