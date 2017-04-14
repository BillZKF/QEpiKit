let setup = {
    experiment: {
        iterations: 10,
        type: 'evolution',
        size: 6
    },
    environment: {
        step: 0.001,
        until: 1,
        spatialType: 'continuous',
        bounds: [500, 400]
    },
    agents: [{
        name: 'people',
        count: 1000,
        boundaries: {
            left: 1,
            right: 500 - 1,
            top: 400 - 1,
            bottom: 1
        },
        params: [{
                name: 'movePerDay',
                assign: () => {
                    return jStat.normal.sample(3000, 1000)
                }
            },
            {
                name: 'contactAttempts',
                assign: 0
            },
            {
                name: 'newAttempt',
                assign: 0
            },
            {
                name: 'madeAttempts',
                assign: 0
            },
            {
                name: 'pathogenLoad',
                assign: 0
            },
            {
                name: 'responseProb',
                assign: 0
            },
            {
                name: 'timeInfectious',
                assign: 0
            },
            {
                name: 'timeRecovered',
                assign: 0
            },
            {
                name: 'states',
                assign: function() {
                    return {
                        'illness': 'succeptible'
                    };
                }
            }
        ]
    }],
    components: [{
        name: 'SEIR',
        type: 'state-machine',
        agents: 'people',
        states: {
            'succeptible': QActions.succeptible,
            'exposed': QActions.exposed,
            'infectious': QActions.infectious,
            'removed': QActions.removed
        },
        conditions: {
            'exposure': {
                key: 'pathogenLoad',
                value: 0,
                check: QEpiKit.gt
            },
            'infection': {
                key: 'responseProb',
                value: () => {
                    return Math.random()
                },
                check: QEpiKit.gt
            },
            'recovery': {
                key: 'timeInfectious',
                value: 5, //pathogen.recoveryTime,
                check: QEpiKit.gt
            },
            'resucceptible': {
                key: 'timeRecovered',
                value: 4, //pathogen.mutationTime,
                check: QEpiKit.gt
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
    }, {
        name: 'Movement',
        type: 'every-step',
        agents: 'people',
        action: QActions.move
    }],
    report: {
        sums: ['pathogenLoad', 'madeAttempts', 'contactAttempts'],
        means: ['pathogenLoad', 'madeAttempts', 'contactAttempts'],
        freqs: ['succeptible','infectious']
    },
    evolution: {
        params: [{
            group: 'people',
            name: 'contactAttempts',
            range: [1, 100]
        }],
        target: {
            freqs: {
                infectious: 66
            }
        }
    }
}

let pathogen = {
    N50: 4200,
    optParam: 0.000165,
    bestFitModel: 'exponential',
    decayRate: 0.1,
    recoveryTime: 6,
    shedRate: 700,
    mutationTime: 12
};

//setup pathogen
pathogen['beta-Poisson'] = function(dose) {
    let response = 1 - Math.pow((1 + (dose / pathogen.N50) * (Math.pow(2, (1 / pathogen.optParam)) - 1)), (-pathogen.optParam));
    return response;
};

pathogen['exponential'] = function(dose) {
    let response = 1 - Math.exp(-pathogen.optParam * dose);
    return response;
};
pathogen.personToPerson = true;

let seed = 5437;
let random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
let env = new QEpiKit.Environment();
let agents;
let exp;
let infectedAtStart = 8;

function launch(cfg) {
    exp = new QEpiKit.Evolutionary(env, cfg);
    exp.start(cfg.experiment.iterations, cfg.environment.step, cfg.environment.until);
}
