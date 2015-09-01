describe('State machines', function() {
  var SEIRMachine, events, people, conditions;


  beforeEach(function() {
    people = [ {
      id: 5,
      current: 'exposed',
      pathogenLoad: 400,
      location: [3, 1]
    },{
      id: 1,
      current: 'succeptible',
      pathogenLoad: 0,
      location: [1, 1]
    }, {
      id: 2,
      current: 'succeptible',
      pathogenLoad: 0,
      location: [1, 2]
    }, {
      id: 3,
      current: 'succeptible',
      pathogenLoad: 0,
      location: [2, 1]
    }, {
      id: 4,
      current: 'succeptible',
      pathogenLoad: 0,
      location: [1, 3]
    }];

    transitionMap = [{
      name: 'exposure',
      from: 'succeptible',
      to: 'exposed'
    }, {
      name: 'incubated',
      from: 'exposed',
      to: 'infectious'
    }, {
      name: 'recovering',
      from: 'infectious',
      to: 'recovered'
    }];

    conditions = {
      'exposed' :{
        key:'pathogenLoad',
        value:0,
        check: QEpiKit.Utils.gt
      },
      'incubated':{
        key:'pathogenLoad',
        value:1000,
        check:QEpiKit.Utils.gtEq
      },
      'recovered':{
        key:'pathogenLoad',
        value:0,
        check:QEpiKit.Utils.ltEq
      }
    };

    states = {
      'succeptible': function(step, person) {
        actions.move(person);
      },
      'exposed': function(step, person) {
        person.pathogenLoad += 100 * step;
        actions.move(person);
      },
      'infectious': function(step, person) {
        var xDis, yDis;
        for (var other = 0; other < people.length; other++) {
          if (people[other].current === 'succeptible') {
            xDis = Math.abs(people[other].location[0] - person.location[0]);
            yDis = Math.abs(people[other].location[1] - person.location[1]);
            if (xDis <= 1 && yDis <= 1) {
              people[other].pathogenLoad += 100;
            }
          }
        }
        person.pathogenLoad -= 25 * step;
      },
      'recovered': function(step, person) {
        actions.move(person);
      }
    };

    actions = {
      'move': function(person) {
        person.location[0] = Math.round(Math.random() * 2 - (Math.random() * 2));
        person.location[1] = Math.round(Math.random() * 2 - (Math.random() * 2));
      }
    };

    SEIRMachine = new QEpiKit.StateMachine('SEIRMachine', people, events);
    it('should create a state machine', function(){
      expect(SEIRMachine.id.length).toBe(36);
    });

    it('should update one time step', function(){
      console.log('hello');
      SEIRMachine.update(1);
      expect(SEIRMachine.time).toBe(1);
      expect(person[3].curent).toBe('asdfasdfase');
    });

  });
});
