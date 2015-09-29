describe('An events list', function() {
  beforeEach(function() {
    randomEvents = [{
      name: 'early bird',
      at: 1.5,
      trigger: function() {
        //console.log('second bird enters');
      },
      triggered: false
    }, {
      name: 'earlier bird',
      at: 0.5,
      trigger: function() {
        //console.log('first bird enters');
      },
      triggered: false
    }, {
      name: 'quiet worm',
      at: 0,
      until: 3,
      trigger: function() {
        //console.log('worm slithers about');
      },
      triggered: false
    }, {
      name: 'later bird',
      at: 3,
      trigger: function() {
        //console.log('third bird gets worm');
      },
      triggered: false
    }];
    environment = new QEpiKit.Environment([], [], [], []);
  });
  it('should take an array of events, and organize them', function() {
    var orderedEvents = new QEpiKit.Events(randomEvents);
    expect(orderedEvents.queue[0].name).toBe('quiet worm');
  });

  it('it should feed the environment an optimized array of events', function() {
    var orderedEvents = new QEpiKit.Events(randomEvents);
    environment.eventsQueue = orderedEvents.queue;
    environment.run(0.25, 50, 1);
    expect(environment.eventsQueue.length).toBe(0);
  });

  it('it should be able to schedule recurring events', function() {
    var events = new QEpiKit.Events(randomEvents);

    events.scheduleRecurring({
      name: 'gotowork',
      at: 0.25,
      until: 0.75,
      trigger: function() {
        //console.log('still at work', environment.time);
      },
      triggered: false
    }, 1, 5);
    environment.eventsQueue = events.queue;
    environment.run(0.05, 7, 1);
  });

});
