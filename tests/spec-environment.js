describe('An environment contains resources, a population, and model components', function() {
      var env, agents, resources, facilties, events, model;

      beforeEach(function() {
          agents = [{
            id: 1,
            sex: "male",
            age: 42
          }, {
            id: 2,
            sex: "male",
            age: 32
          }, {
            id: 3,
            sex: "female",
            age: 45
          }, {
            id: 4,
            sex: "female",
            age: 36
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

          var closeDoctorsOffice = {
            trigger: function(){
                facilities[0].working = false;
              }, triggered: false
            };
            events = {
              5: closeDoctorsOffice
            };

            model = {
              update: function(step) {
                for (var a in agents) {
                  agents[a].viralLoad = agents[a].viralLoad || 0;
                  agents[a].viralLoad += Math.random();
                  if (agents[a].viralLoad >= 5) {
                    agents.splice(a, 1);
                  }
                }
              }
            };
            env = new QEpiKit.Environment(agents, resources, events);
            env.add(model);
          });

        it('should be able to add and remove model components', function(){
          var newModel = {id:'3n6k',update:function(){}};
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

        it('should take, and remove observers', function() {
          var observer = {
            id: "34nkg",
            data:[],
            results:[],
            assess: function(name){
              this.results.push(name);
            }
          };
          env.addObserver(observer);
          env.run(1, 5, 1);
          //the time should now be 6 - so the next run starts at 6
          expect(env.time).toBe(6);
          expect(observer.results[0]).toBe("finished");
          //remove an observer
          env.removeObserver("34nkg");
          expect(env.observers.length).toBe(0);
        });
      });
