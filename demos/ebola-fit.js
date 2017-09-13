/** adapted from:
 *Rivers CM, Lofgren ET, Marathe M, Eubank S, Lewis BL. Modeling the Impact of Interventions on an Epidemic of Ebola in Sierra Leone and Liberia. PLOS Currents Outbreaks. 2014 Oct 16 . Edition 1. doi: 10.1371/currents.outbreaks.fd38dd85078565450b0be3fcd78f5ccf.
 */

let setupEBFit = {
  experiment: {
    seed: 12345,
    rng: 'burtle',
    iterations: 10,
    type: 'evolution',
    size: 10,
    params: [{
        level: 'entities',
        group: 'pathogen',
        name: 'contactRate',
        distribution: {
          name: 'uniform',
          params: [0.1, 0.3]
        }
      }, {
        level: 'entities',
        group: 'pathogen',
        name: 'hospitalContactRate',
        distribution: {
          name: 'uniform',
          params: [0.05, 0.15]
        }
      }, {
        level: 'entities',
        group: 'pathogen',
        name: 'funeralContactRate',
        distribution: {
          name: 'uniform',
          params: [0.1, 0.5]
        }
      }, {
        level: 'entities',
        group: 'pathogen',
        name: 'incubationPeriod',
        distribution: {
          name: 'uniform',
          params: [1 / 21, 0.5]
        }
      }, {
        level: 'entities',
        group: 'pathogen',
        name: 'timeUntilHospital',
        distribution: {
          name: 'uniform',
          params: [0.2, 0.5]
        }
      },
      {
        level: 'entities',
        group: 'pathogen',
        name: 'timeFromHospToDeath',
        distribution: {
          name: 'uniform',
          params: [0.1, 0.5]
        }
      },
      {
        level: 'entities',
        group: 'pathogen',
        name: 'durationOfFuneral',
        distribution: {
          name: 'uniform',
          params: [0.1, 0.5]
        }
      },
      {
        level: 'entities',
        group: 'pathogen',
        name: 'durationOfInfection',
        distribution: {
          name: 'uniform',
          params: [0.03, 0.1]
        }
      },
      {
        level: 'entities',
        group: 'pathogen',
        name: 'timeFromInfToDeath',
        distribution: {
          name: 'uniform',
          params: [0.1, 0.2]
        }
      },
      {
        level: 'entities',
        group: 'pathogen',
        name: 'timeFromHospToRecov',
        distribution: {
          name: 'uniform',
          params: [0.05, 0.1]
        }
      },
      {
        level: 'entities',
        group: 'pathogen',
        name: 'probOfHosp',
        distribution: {
          name: 'uniform',
          params: [0.15, 0.2]
        }
      },
      {
        level: 'entities',
        group: 'pathogen',
        name: 'caseFatalityRate',
        distribution: {
          name: 'uniform',
          params: [0.5, 0.8]

        }
      },
      {
        level: 'entities',
        group: 'pathogen',
        name: 'hospitalCaseFatalityRate',
        distribution: {
          name: 'uniform',
          params: [0.25, 0.6]
        }
      }
    ]
  },
  environment: {
    step: 1,
    until: 150,
    saveInterval: 1,
    type: 'compartmental'
  },
  entities: {},
  pathogen: {
      params:{
        name:'ebola',
        caseFatalityRate: {assign:0.6508077221468036},
        contactRate: {assign:0.14801843001980391},
        durationOfFuneral: {assign:0.2985749136118665},
        durationOfInfection: {assign:0.03699999813045079},
        funeralContactRate: {assign:0.1778639535067731},
        hospitalCaseFatalityRate: {assign:0.3987794913063928},
        hospitalContactRate: {assign:0.06499999664081706},
        incubationPeriod: {assign:0.25036826492469616},
        probOfHosp: {assign:0.15999999759314584},
        timeFromHospToDeath: {assign:0.299999994373998},
        timeFromHospToRecov: {assign:0.05499999690929224},
        timeFromInfToDeath: {assign:0.11999999671207001},
        timeUntilHospital: {assign:0.34999999860396325}
    }
  },
  patches: [{
    name: 'liberia',
    boundaries: [6, 9],
    populations: {
      succeptible: 4502992 / 4503000,
      exposed: 8 / 4503000,
      infectious: 0,
      hospitalized: 0,
      funeral: 0,
      removed: 0
    }
  }],
  components: [{
    name: 'ebola-liberia',
    type: 'compartmental',
    patches: ['liberia'],
    compartments: {
      'succeptible': {
        operation: 'cSucceptible'
      },
      'exposed': {
        operation: 'cExposed'
      },
      'infectious': {
        operation: 'cInfectious'
      },
      'hospitalized': {
        operation: 'cHospitalized'
      },
      'funeral': {
        operation: 'cFuneral'
      },
      'removed': {
        operation: 'cRemoved'
      }
    }
  }],
  report: {
    sums: [],
    means: [],
    freqs: [],
    model: [],
    history: [],
    compartments: ['succeptible', 'exposed', 'infectious', 'removed', 'hospitalized', 'funeral']
  },
  evolution: {
    target: {
      model: {
        succeptible: QEpiKit.scale(4503000 - 328, 0, 4503000)
      }
    }
  }
};
