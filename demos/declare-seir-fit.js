let seed = 5437;
let random = new QEpiKit.RNGBurtle(seed);
let setup = {
    experiment: {
        seed: seed,
        rng: random,
        iterations: 20,
        type: 'evolution',
        size: 5
    },
    environment: {
        step: 0.001,
        until: 1,
        spatialType: 'continuous',
        bounds: [500, 400],
        params: {
            pathogen: {
                personToPerson: true,
                N50: 4200,
                optParam: 0.000165,
                bestFitModel: 'exponential',
                decayRate: 0.1,
                recoveryTime: 6,
                shedRate: 700,
                mutationTime: 12,
                'beta-Poisson': function(dose) {
                    let response = 1 - Math.pow((1 + (dose / this.N50) * (Math.pow(2, (1 / this.optParam)) - 1)), (-this.optParam));
                    return response;
                },
                'exponential': function(dose) {
                    let response = 1 - Math.exp(-this.optParam * dose);
                    return response;
                }
            }
        }
    },
    agents: {
        'people': {
            count: 1000,
            boundaries: {
                left: 1,
                right: 500 - 1,
                top: 400 - 1,
                bottom: 1
            },
            params: {
                'movePerDay': {
                    assign: () => {
                        return jStat.normal.inv(random.random(), 3000, 1000)
                    }
                },
                'contactAttempts': {
                    assign: 0
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
                'states': {
                    assign: function() {
                        return {
                            'illness': 'succeptible'
                        };
                    }
                }
            }
        }
    },
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
                    return random.random()
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
        freqs: ['succeptible', 'infectious']
    },
    evolution: {
        params: [{
            level: 'agents',
            group: 'people',
            name: 'contactAttempts',
            range: [1, 100]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'shedRate',
            range: [100, 1000]
        }],
        target: {
            freqs: {
                infectious: 66
            }
        }
    }
}

let pathogen = setup.environment.params.pathogen;
let env = new QEpiKit.Environment();
let agents;
let exp;
let infectedAtStart = 8;

function launch(cfg) {
    exp = new QEpiKit.Evolutionary(env, cfg);
    exp.start(cfg.experiment.iterations, cfg.environment.step, cfg.environment.until);
}
