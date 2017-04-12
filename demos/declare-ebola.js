//compartments should be an object
//patches should contain an object with the population for each compartment

let setup = {
    experiment: {
        iterations: 1,
        type: 'evolution',
        size: 5
    },
    environment: {
        step: 1,
        until: 150,
        saveInterval: 1,
        spatialType: 'compartmental',
        params: {
            ebola: {
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
            },
            vitals: {
                births: function(total) {
                    return total * 0.0000002;
                },
                deaths: function(total) {
                    return -total * 0.0000001;
                }
            }
        }
    },
    patches: [{
        name: 'liberia',
    }],
    components: [{
        name: 'ebola-liberia',
        type: 'compartmental',
        patches: ['liberia'],
        compartments: [
            {
                name:'succeptible',
                pop: 4502992 / 4503000,
                operation: (patch, step) => {
                    let S = patch[0]; let E = patch[1]; let I = patch[2]; let H = patch[3]; let F = patch[4]; let R = patch[5];
                    return (ebola.contactRate * S.pop * I.pop * step) + (ebola.hospitalContactRate * S.pop * H.pop * step) + (ebola.funeralContactRate * S.pop * F.pop * step);
                }
            },{
                name: 'exposed',
                pop: 8 / 4503000,
                operation: (patch, step) => {
                  let S = patch[0]; let E = patch[1]; let I = patch[2]; let H = patch[3]; let F = patch[4]; let R = patch[5];
                  return (ebola.contactRate * S.pop * I.pop * step) + (ebola.hospitalContactRate * S.pop * H.pop * step) + (ebola.funeralContactRate * S.pop * F.pop * step) - (E.pop * ebola.incubationPeriod * step);
                }
            },{
                name: 'infectious',
                pop: 0,
                operation: (patch, step) => {
                  let S = patch[0]; let E = patch[1]; let I = patch[2]; let H = patch[3]; let F = patch[4]; let R = patch[5];
                  return (E.pop * ebola.incubationPeriod * step) - ((I.pop * ebola.timeUntilHospital * step) + (ebola.durationOfInfection * (1 - ebola.caseFatalityRate) * I.pop * step) + (I.pop * ebola.caseFatalityRate * ebola.timeFromInfToDeath * step));
                }
            },{
                name:'hospitalized',
                pop: 0,
                operation: (patch,step) => {
                  let S = patch[0]; let E = patch[1]; let I = patch[2]; let H = patch[3]; let F = patch[4]; let R = patch[5];
                  return (I.pop * ebola.timeUntilHospital * step) - ((ebola.timeFromHospToDeath * ebola.hospitalCaseFatalityRate * H.pop * step) + (ebola.timeFromHospToRecov * (1 - ebola.hospitalCaseFatalityRate) * H.pop * step));
                }
            },{
                name: 'funeral',
                pop: 0,
                operation: (patch,step) => {
                  let S = patch[0]; let E = patch[1]; let I = patch[2]; let H = patch[3]; let F = patch[4]; let R = patch[5];
                  return (I.pop * ebola.caseFatalityRate * ebola.timeFromInfToDeath * step) + (ebola.timeFromHospToDeath * ebola.hospitalCaseFatalityRate * H.pop * step) - (F.pop * ebola.durationOfFuneral * step);
                }
            },{
                name:'removed',
                pop : 0,
                operation: (patch,step) => {
                  let S = patch[0]; let E = patch[1]; let I = patch[2]; let H = patch[3]; let F = patch[4]; let R = patch[5];
                  return (I.pop * ebola.durationOfInfection * (1 - ebola.caseFatalityRate) * step) + (ebola.timeFromHospToRecov * (1 - ebola.hospitalCaseFatalityRate) * H.pop * step) + (F.pop * ebola.durationOfFuneral * step);
                }
            }
        ]
    }],
    report: {
        sums: [],
        means: [],
        freqs:[],
        model: [],
        compartments:['succeptible']
    },
    evolution: {
        params: [{
            level: 'environment',
            group: 'ebola',
            name: 'contactRate',
            range: [0.1, 0.3]
        }, {
            level: 'environment',
            group: 'ebola',
            name: 'hospitalContactRate',
            range: [0.05, 0.1]
        }, {
            level: 'environment',
            group: 'ebola',
            name: 'funeralContactRate',
            range: [0.3, 0.5]
        }, {
            level: 'environment',
            group: 'ebola',
            name: 'incubationPeriod',
            range: [0.5, 1 / 21]
        }, {
            level: 'environment',
            group: 'ebola',
            name: 'timeUntilHospital',
            range: [1 / 2, 1 / 5]
        }, {
            level: 'environment',
            group: 'ebola',
            name: 'timeFromHospToDeath',
            range: [1 / 5, 1 / 10]
        }, {
            level: 'environment',
            group: 'ebola',
            name: 'durationOfFuneral',
            range: [1 / 2, 1 / 6]
        }, {
            level: 'environment',
            group: 'ebola',
            name: 'durationOfInfection',
            range: [1 / 15, 1 / 21]
        }, {
            level: 'environment',
            group: 'ebola',
            name: 'timeFromInfToDeath',
            range: [1 / 9, 1 / 14]
        }, {
            level: 'environment',
            group: 'ebola',
            name: 'timeFromHospToRecov',
            range: [1 / 14, 1 / 16]
        }, {
            level: 'environment',
            group: 'ebola',
            name: 'probOfHosp',
            range: [0.15, 0.2]
        }, {
            level: 'environment',
            group: 'ebola',
            name: 'caseFatalityRate',
            range: [0.5, 0.8]
        }, {
            level: 'environment',
            group: 'ebola',
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
let ebola = setup.environment.params.ebola;
let exp;

function launch(cfg) {
    exp = new QEpiKit.Evolutionary(env, cfg);
    exp.start(cfg.experiment.iterations, cfg.environment.step, cfg.environment.until);
}
