describe('An Experiment', function() {
  beforeEach(function() {
    var agents = [],
      facilities,
      resources, events;

    function  getRandom(max){
      return Math.round(Math.random() * max);
    }

    prepFunction = function() {
      agents = [];
      for (var i = 0; i < getRandom(2000); i++) {
        agents[i] = {
          id: i,
          time: 0,
          age: getRandom(100),
          weight: getRandom(100),
          height: getRandom(80),
          needBed: getRandom(20),
          inBed: false,
          removed: false,
          waitedFor: 0,
          modelIndex: 0
        };
      }

      facilities = [];
      for (var j = 0; j <  20; j++) {
        facilities[j] = {
          id: j,
          label: 'hospitalBed',
          dirty: 0,
          capacity: 1,
          status: 0
        };
      }

      resources = {
        'linen': {
          label: 'linen',
          amount: 50
        }
      };

      agentModel.data = agents;
      environment.agents = agents;
    };


    agentModel = {
      name:"regular",
      data: agents
    };

    agentModel.update = function(person, step) {
        if(person.removed === false){
          behavior(person);
        }
    };

   behavior = function(person) {
      if (person.inBed) {
        if (person.needBed >= 0) {
          person.needBed -= 1;
          facilities[person.bedID].dirty += 0.2;
          if (facilities[person.bedID].dirty > 1) {
            person.inBed = false;
            facilities[person.bedID].status = 0;
            resources.linen.status -= 1;
            facilities[person.bedID].dirty = 0;
          }
        } else {
          facilities[person.bedID].status -= 0;
          person.inBed = false;
          person.removed = true;
        }
      } else {
        for (var l = 0; l < facilities.length; l++) {
          if (facilities[l].status < facilities[l].capacity) {
            if (person.inBed === false) {
              person.bedID = facilities[l].id;
              facilities[l].status += 1;
              person.inBed = true;
            }
          }
        }
        if (person.inBed === false) {
          person.waitedFor += 1;
        }
      }
      person.time += 1;
    };


    recordFunction = function() {
      var record = {};
      record.totalWait = 0;
      record.agentsWaited = 0;
      record.inBedAtFinal = 0;
      record.avgDirtiness = 0;
      record.removed = 0;
      environment.agents.map(function(d) {
        record.totalWait += d.waitedFor;
        if (d.waitedFor > 0) {
          record.agentsWaited += 1;
        }
        if (d.inBed) {
          record.inBedAtFinal += 1;
        }
        if(d.removed){
          record.removed += 1;
        }
      });
      record.beds = facilities.length;
      var totalDirt = 0;
      facilities.map(function(d){
        totalDirt += d.dirty;
      });
      record.avgDirtiness = totalDirt / record.beds;
      record.linenRemaining = resources.linen.amount;
      record.avgWait = record.totalWait / environment.agents.length;
      record.agentsCount = environment.agents.length;
      record = JSON.parse(JSON.stringify(record));
      return record;
    };

    environment = new QEpiKit.Environment([], resources, [], []);
    environment.add(agentModel);
    ex = new QEpiKit.Experiment(environment, prepFunction, recordFunction);
  });

  it('takes an environment, a number of runs, a prep function, and record function', function() {
    expect(ex).toBeDefined();
  });

  it('should run for 10 runs', function() {
    var runCounter = 0;
    ex.start(10, 1, 30);
    expect(ex.experimentLog.length).toBe(10);
  });
});
