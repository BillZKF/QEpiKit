'use strict';
let setupVectorborne = {
    experiment: {
      seed: 12345,
      rng: 'burtle',
      iterations: 8,
      type: 'evolution',
      size: 8
    },
    environment: {
        step: 0.001,
        until: 1,
        saveInterval: 1,
        type: 'continuous',
        boundaries:[500,500],
        params: {}
    },
    evolution: {
      method: "constrained",
      params: [{
        level: 'agents',
        group: 'people',
        name: 'contactAttempts',
        range: [10,100]
      }, {
        level: 'entities',
        group: 'pathogen',
        name: 'shedRate',
        range: [500, 2000]
      }],
      target: {
        freqs: {
          infectious: 100
        }
      }
    },
    report: {
        sums: [],
        means: [],
        freqs: [],
        model: [],
        history: [],
        compartments: ['succeptible','exposed','infectious','removed']
    },
    pathogen: {
        name:'malaria',
        contactRate: 25,
        mosqTransRate: 0.16,
        mosqIncubation: 1 / 3,
        mosqDuration: 1 / 3,
        mosqResuccept: 2,
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
        vectorPatch: 'mosquitoes',
        methods:{
          'beta-Poisson': 'beta-Poisson',
          'exponential': 'exponential'
        }
    },
    patches: [{
        name: 'mosquitoes',
        type: 'patches',
        populations: {
            succeptible: 4999999 / 5000000,
            infectious: 1 / 5000000 ,
            removed: 0
        },
        params:{
          'movePerDay': {
            distribution:{
              name:'normal',
              params:[3000, 1000]
            }
          },
          shedOnBite:{
            assign:1e5
          },
          r: {
            assign : 100
          }
        },
        boundaries: {
          left: 1,
          right: 500 - 1,
          top: 500 - 1,
          bottom: 1
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
            distribution:{
              name:'normal',
              params:[3000, 1000]
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
          'illness': {
            states: {
              params:[['immune','succeptible','exposed','infectious'],[0.3,0.69,0.005,0.005]]
            }
          }
        }
      }
    },
    components: [{
      name: 'mosquito-comp',
      type: 'compartmental',
      patches: ['mosquitoes'],
      compartments: {
        'succeptible': {
          operation: 'mSucceptible'
        },
        'exposed': {
          operation :'mExposed'
        },
        'infectious': {
          operation: 'mInfectious'
        },
        'removed': {
          operation: 'mRemoved'
        }
      }
    },{
      name: 'mosquito-movement',
      type : 'every-step',
      agents: 'mosquitoes',
      action: 'moveWithin'
    },
    {
      name:'mosquito-check',
      type:'every-step',
      agents:'people',
      action: 'mosquitoCheck'
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
      action: 'moveWithin'
    }]
  };
