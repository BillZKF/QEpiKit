describe('An environment contains resources, a population, and model components', function() {
  var env, agents, resources, facilties, events, model;

  beforeEach(function() {
    agents = [{
      id: 1,
      sex: "male",
      age: 42,
      hasShot: false
    }, {
      id: 2,
      sex: "female",
      age: 32,
      hasShot: false
    }, {
      id: 3,
      sex: "female",
      age: 45,
      hasShot: false
    }, {
      id: 4,
      sex: "female",
      age: 36,
      hasShot: false
    }];

    resources = [{
      label: "Tamiflu",
      amount: 3,
      distributed: 0,
      units: "boxes of 30 pills"
    }, {
      label: "Flushots",
      amount: 3,
      distributed: 0,
      units: "doses"
    }];

    facilities = [{
      label: "Primary care office",
      capacity: 2,
      status: 0,
      units: "people",
      working: true,
      type: "doctor"
    }, {
      label: "Drug store",
      capacity: 20,
      status: 0,
      units: "people",
      working: true,
      type: "pharmacy"
    }];

    model = {
      update: function(person, step) {
        person.viralLoad = person.viralLoad || 0;
        person.viralLoad += Math.random();
        if (person.viralLoad >= 5) {
          env.agents.forEach(function(d, i) {
            if (d.id === person.id) {
              a = i;
            }
          });
          env.agents.splice(a, 1);
        }
      },
      name: 'sick',
      data: agents
    };
    events = new QEpiKit.Events([{
      name: 'deliver-shots',
      at: 3,
      trigger: function() {
        env.resources[1].amount += 1
      },
      triggered: false
    }]);
    env = new QEpiKit.Environment(resources, facilties, events.queue);
    env.add(model);
  });

  it('should be able to add and remove model components', function() {
    var newModel = {
      id: '3n6k',
      name: 'walking',
      update: function(step) {},
      data: []
    };
    env.add(newModel);
    expect(env.models.length).toBe(2);
    //now remove it
    env.remove('3n6k');
  });

  it('should start at time 0', function() {
    expect(env.time).toBe(0);
  });

  it('should run for 20 days', function() {
    env.run(1, 20, 1);
    //the time should now be 21 - so the next run starts at 21
    expect(env.time).toBe(21);
    expect(env.agents.length).toBeLessThan(4);
  });

  it('should handle mutliple models', function() {
    var doctors = [{
      id: 200,
      sex: "female",
      age: 42,
      treated: []
    }];
    var doctorModel = {
      id: '457',
      update: function(doc, step) {
        var a = Math.floor(Math.random() * agents.length);
        agents[a].viralLoad = 0;
        doc.treated.push(agents[a].id);
      },
      data: doctors
    };

    env.add(doctorModel);
    env.run(1, 10, 1);
    expect(doctors[0].treated.length).toBeGreaterThan(1);
  });

  it('should be able to activate agents in parallel', function() {
    var shotsWanted = 0;
    model.update = function(person, step) {
      //everyone who is not sick wants to get a flu shot, but only three available
      if (person.hasShot === false) {
        person.wantsShot = true;
      } else {
        person.wantsShot = false;
      }
      getShotsWanted();
    };

    model.apply = function(oldVals, newVals, step) {
      //give preference to age
      if (newVals.wantsShot) {
        if (shotsWanted > env.resources[1].amount) {
          if (newVals.age > 35) {
            newVals.hasShot = true;
            newVals.wantsShot = false;
            env.resources[1].amount--;
            shotsWanted -= 1;
          }
        } else {
          newVals.hasShot = true;
          newVals.wantsShot = false;
          env.resources[1].amount--;
          shotsWanted -= 1;
        }
      }
      return newVals;
    };

    getShotsWanted = function() {
      shotsWanted = 0;
      env.agents.forEach(function(d) {
        shotsWanted = d.hasShot === false ? shotsWanted + 1 : shotsWanted;
      });
    };

    env = new QEpiKit.Environment(resources, facilties, events.queue, 'parallel');
    env.add(model);
    env.run(1, 1, 1);
    expect(shotsWanted).toBe(1);
  });

  it('should handle interaction between agents and events', function(){
    /*
    * open the office, start scheduling appts. when appt is triggered, agent is no longer ill.
    */
    events = new QEpiKit.Events([{
      name: 'doctor-opens',
      at: 7,
      trigger: function() {

      }
    }]);

    env = new QEpiKit.Environment([], [], events.queue);

    function scheduleAppointment(step, agent) {
      let soonest = events.queue[events.queue.length - 1].at || step;
      let event = {
        name: 'appt-for-' + agent.id,
        at: soonest + step,
        trigger: function() {
          seeDoctor(agent);
        }
      };
      events.schedule([event]);
      env.eventsQueue = events.queue;
      agent.scheduled = true;
    }

    function seeDoctor(agent){
      agent.ill = false;
    }

    model = {
      data: agents,
      update: function(agent, step) {
        if (!agent.scheduled) {
          agent.ill = true;
          scheduleAppointment(step, agent);
        }
      }
    };

    env.add(model);
    env.run(1, 20, 0);
    expect(agents[0].ill).toBe(false);
  });
});
