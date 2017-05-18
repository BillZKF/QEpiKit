
let r = 100;
let bounds = [400, 300]; // for margin
let boundaries = {
  'people': {top:bounds[1], left:10, bottom:10, right:bounds[0]},
  'mosquitoes': {top:bounds[1] - 100, left:10, bottom:10, right:bounds[0] - 100},
}

let setupMosquitos = {
    experiment: {
        seed: 12345,
        rng: new QEpiKit.RNGBurtle(this.seed),
        iterations: 50,
        iterations: 5,
        type: 'evolution',
        size: 5
    },
    environment: {
        step: 1,
        until: 150,
        saveInterval: 1,
        type: 'compartmental',
        //bounds: [0, 0],
        params: {}
    },
    pathogen: {
        name:'malaria',
        contactRate: 25,
        mosqTransRate: 0.16,
        mosqIncubation: 1 / 3,
        mosqDuration: 1 / this.durationOfInfection,
        incubationPeriod: 0,
        durationOfInfection: 0,
        timeFromInfToDeath: 0,
        probOfHosp: 0,
        caseFatalityRate: 0,
        personToPerson: true,
        vectorBorne: true,
        N50: 9.45e5,
        optParam: 5.81e-1,
        bestFitModel: 'beta-Poisson',
        decayRate: 4.5,
        recoveryTime: 6,
        shedRate: 700,
        mutationTime: 36,
        'beta-Poisson': function(dose) {
          let response = 1 - Math.pow((1 + (dose / this.N50) * (Math.pow(2, (1 / this.optParam)) - 1)), (-this.optParam));
          return response;
        },
        'exponential': function(dose) {
          let response = 1 - Math.exp(-this.optParam * dose);
          return response;
        }
    },
    patches: [{
        name: 'mosquitoes',
        type: 'patches',
        populations: {
            succeptible: 4502992 / 4503000,
            infectious: 8 / 4503000 ,
            removed: 0
        }
        params:{
          shedOnBite:1e5
        }
    }],
    agents: {
      'people': {
        name: 'people',
        count: 1000,
        boundaries: {
          left: 1,
          right: 500 - 1,
          top: 500 - 1,
          bottom: 1
        },
        params: {
          'movePerDay': {
            assign: () => {
              return random.normal(3000, 1000);
            }
          },
          'contactAttempts': {
            assign: 20
          },
          'newAttempt': {
            assign: 0
          },
          'madeAttempts': {
            assign: 0
          },
          'pathogenLoad': {
            assign: 0
          },
          'responseProb': {
            assign: 0
          },
          'timeInfectious': {
            assign: 0
          },
          'timeRecovered': {
            assign: 0
          },
          'infected': {
            assign:false
          },
          'percentImmune': {
            assign: 0.4
          },
          'percentInfected': {
            assign: 0.1
          },
          'states': {
            assign: function() {
              let r = random.random();
              let state = 'succeptible'
              if (r < 0.2) {
                state = 'immune';
              }
              if (r >= 0.2 && r < 0.22) {
                state = 'infectious';
              }
              return {
                'illness': state
              };
            }
          }
        }
      }
    },
    components: [{
      name: 'mosquitoes-comp',
      type: 'compartmental',
      patches: ['mosquitoes'],
      compartments: {
        'succeptible': {
          operation: function(patch, step) {
            return (patch.removed * mosqPathParams.resuccept * step) - (mosqPathParams.transmissionRate * patch.succeptible * (patch.infectious + patch.exposed) * step);
          }
        },
        'exposed': {
          operation = function(patch, step) {
            return (mosqPathParams.transmissionRate * patch.succeptible * (patch.infectious + patch.exposed) * step) - (patch.exposed * mosqPathParams.latentTime * step);
          }
        },
        'infectious': {
          operation: function(patch, step) {
            return (patch.exposed * mosqPathParams.latentTime * step) - (patch.infectious * mosqPathParams.recoveryRate * step);
          }
        },
        'removed': {
          operation: function(patch.step) {
            return (patch.infectious * mosqPathParams.recoveryRate * step) - (patch.removed * mosqPathParams.resuccept * step);
          }
        }

      }
    },{
      name: 'mosqMovementModel',
      type : 'every-step',
      patches: ['mosquitoes']
      update: function(agent, step){
        agent.mesh.material.color.g = patch.succeptible;
        agent.mesh.material.color.r = patch.infectious;
        agent.mesh.material.color.b = patch.removed;
        QActions.moveWithin(step, agent, boundaries.mosquitoes);
      }
    },
    {
      name: 'SEIR',
      type: 'state-machine',
      agents: 'people',
      states: {
        'immune': 'immune',
        'succeptible': 'succeptible',
        'exposed': 'exposed',
        'infectious': 'infectious',
        'removed': 'removed'
      },
      conditions: {
        'exposure': {
          key: 'pathogenLoad',
          value: 0,
          check: 'gt'
        },
        'infection': {
          key: 'infected',
          value: true,
          check: 'equalTo'
        },
        'recovery': {
          key: 'timeInfectious',
          value: 5, //pathogen.recoveryTime,
          check: 'gt'
        },
        'resucceptible': {
          key: 'timeRecovered',
          value: 4, //pathogen.mutationTime,
          check: 'gt'
        }
      },
      transitions: [{
        name: 'exposure',
        from: 'succeptible',
        to: 'exposed'
      }, {
        name: 'infection',
        from: 'exposed',
        to: 'infectious'
      }, {
        name: 'recovery',
        from: 'infectious',
        to: 'removed'
      }, {
        name: 'resucceptible',
        from: 'removed',
        to: 'succeptible'
      }]
    },
    {
      name: 'Movement',
      type: 'every-step',
      agents: 'people',
      action: function(agent, step){
        QActions.moveWithin(step, agent, boundaries.people);
        if(pathogen.vectorBorne){
          let dist = distance(agent.position, mainPatch.position) + 1e-16;
          if(dist < r){
            if(random.random() < patch.infectious / dist){
              agent.pathogenLoad += mainPatch.shedOnBite * step;
            }
          }
        }
      }
    }]
  }
