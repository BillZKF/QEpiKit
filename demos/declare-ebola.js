//compartments should be an object
//patches should contain an object with the population for each compartment

let setup = {
    experiment: {
        iterations: 100,
        type: 'evolution',
        size: 5
    },
    environment: {
        step: 1,
        until: 150,
        saveInterval: 1,
        spatialType: 'compartmental',
        params: {
            pathogen: {
                contactRate: 0,
                hospitalContactRate: 0,
                funeralContactRate: 0,
                incubationPeriod: 0,
                timeUntilHospital: 0,
                timeFromHospToDeath: 0,
                durationOfFuneral: 0,
                durationOfInfection: 0,
                timeFromInfToDeath: 0,
                timeFromHospToRecov: 0,
                probOfHosp: 0,
                caseFatalityRate: 0,
                hospitalCaseFatalityRate: 0
            }
        }
    },
    patches: [{
        name: 'liberia',
        populations: {
            succeptible: 4502992 / 4503000,
            exposed: 8 / 4503000,
            infectious:  0,
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
                operation: (patch, step) => {
                    let S = patch.succeptible;
                    let E = patch.exposed;
                    let I = patch.infectious;
                    let H = patch.hospitalized;
                    let F = patch.funeral;
                    let R = patch.removed;
                    return -((pathogen.contactRate * S * I * step) + (pathogen.hospitalContactRate * S * H * step) + (pathogen.funeralContactRate * S * F * step));
                }
            },
            'exposed': {
                operation: (patch, step) => {
                    let S = patch.succeptible;
                    let E = patch.exposed;
                    let I = patch.infectious;
                    let H = patch.hospitalized;
                    let F = patch.funeral;
                    let R = patch.removed;
                    return (pathogen.contactRate * S * I * step) + (pathogen.hospitalContactRate * S * H * step) + (pathogen.funeralContactRate * S * F * step) - (E * pathogen.incubationPeriod * step);
                }
            },
            'infectious': {
                operation: (patch, step) => {
                    let S = patch.succeptible;
                    let E = patch.exposed;
                    let I = patch.infectious;
                    let H = patch.hospitalized;
                    let F = patch.funeral;
                    let R = patch.removed;
                    return (E * pathogen.incubationPeriod * step) - ((I * pathogen.timeUntilHospital * step) + (pathogen.durationOfInfection * (1 - pathogen.caseFatalityRate) * I * step) + (I * pathogen.caseFatalityRate * pathogen.timeFromInfToDeath * step));
                }
            },
            'hospitalized': {
                operation: (patch, step) => {
                    let S = patch.succeptible;
                    let E = patch.exposed;
                    let I = patch.infectious;
                    let H = patch.hospitalized;
                    let F = patch.funeral;
                    let R = patch.removed;
                    return (I * pathogen.timeUntilHospital * step) - ((pathogen.timeFromHospToDeath * pathogen.hospitalCaseFatalityRate * H * step) + (pathogen.timeFromHospToRecov * (1 - pathogen.hospitalCaseFatalityRate) * H * step));
                }
            },
            'funeral': {
                operation: (patch, step) => {
                    let S = patch.succeptible;
                    let E = patch.exposed;
                    let I = patch.infectious;
                    let H = patch.hospitalized;
                    let F = patch.funeral;
                    let R = patch.removed;
                    return (I * pathogen.caseFatalityRate * pathogen.timeFromInfToDeath * step) + (pathogen.timeFromHospToDeath * pathogen.hospitalCaseFatalityRate * H * step) - (F * pathogen.durationOfFuneral * step);
                }
            },
            'removed': {
                operation: (patch, step) => {
                    let S = patch.succeptible;
                    let E = patch.exposed;
                    let I = patch.infectious;
                    let H = patch.hospitalized;
                    let F = patch.funeral;
                    let R = patch.removed;
                    return (I * pathogen.durationOfInfection * (1 - pathogen.caseFatalityRate) * step) + (pathogen.timeFromHospToRecov * (1 - pathogen.hospitalCaseFatalityRate) * H * step) + (F * pathogen.durationOfFuneral * step);
                }
            }
        }
    }],
    report: {
        sums: [],
        means: [],
        freqs: [],
        model: [],
        history: [],
        compartments: ['succeptible']
    },
    evolution: {
        params: [{
            level: 'environment',
            group: 'pathogen',
            name: 'contactRate',
            range: [0.1, 0.3]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'hospitalContactRate',
            range: [0.05, 0.1]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'funeralContactRate',
            range: [0.3, 0.5]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'incubationPeriod',
            range: [0.5, 1 / 21]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'timeUntilHospital',
            range: [1 / 2, 1 / 5]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'timeFromHospToDeath',
            range: [1 / 5, 1 / 10]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'durationOfFuneral',
            range: [1 / 2, 1 / 6]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'durationOfInfection',
            range: [1 / 15, 1 / 21]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'timeFromInfToDeath',
            range: [1 / 9, 1 / 14]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'timeFromHospToRecov',
            range: [1 / 14, 1 / 16]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'probOfHosp',
            range: [0.15, 0.2]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'caseFatalityRate',
            range: [0.5, 0.8]
        }, {
            level: 'environment',
            group: 'pathogen',
            name: 'hospitalCaseFatalityRate',
            range: [0.25, 0.6]
        }],
        target: {
            model: {
                succeptible: QEpiKit.normalize(4503000 - 152, 0, 4503000)
            }
        }
    }
}


let env = new QEpiKit.Environment();
let pathogen = setup.environment.params.pathogen;
let exp;

function launch(cfg) {
    exp = new QEpiKit.Evolutionary(env, cfg);
    exp.start(cfg.experiment.iterations, cfg.environment.step, cfg.environment.until);
}
