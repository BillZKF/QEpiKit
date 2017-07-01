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
            range: [0.1, 0.3]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'hospitalContactRate',
            range: [0.05, 0.1]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'funeralContactRate',
            range: [0.3, 0.5]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'incubationPeriod',
            range: [0.5, 1/21]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'timeUntilHospital',
            range: [1 / 5, 1 / 2]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'timeFromHospToDeath',
            range: [1 / 10, 1 / 5]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'durationOfFuneral',
            range: [1 / 6, 1 / 2]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'durationOfInfection',
            range: [1 / 15, 1 / 21]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'timeFromInfToDeath',
            range: [1 / 9, 1 / 14]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'timeFromHospToRecov',
            range: [1 / 14, 1 / 16]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'probOfHosp',
            range: [0.15, 0.2]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'caseFatalityRate',
            range: [0.5, 0.8]
        }, {
            level: 'entities',
            group: 'pathogen',
            name: 'hospitalCaseFatalityRate',
            range: [0.25, 0.6]
        }]
    },
    environment: {
        step: 1,
        until: 150,
        saveInterval: 1,
        type: 'compartmental'
    },
    entities: {},
    pathogen: {
        name:'ebola',
        contactRate: 0.2,
        hospitalContactRate: 0.07,
        funeralContactRate: 0.4,
        incubationPeriod: 1/3,
        timeUntilHospital: 1/7,
        timeFromHospToDeath: 1/7,
        durationOfFuneral: 1/3,
        durationOfInfection: 1/20,
        timeFromInfToDeath: 1/10,
        timeFromHospToRecov: 1/15,
        probOfHosp: 0.3,
        caseFatalityRate: 0.6,
        hospitalCaseFatalityRate: 0.4
    },
    patches: [{
        name: 'liberia',
        boundaries:[6,9],
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
        compartments: ['succeptible','exposed','infectious','removed','hospitalized','funeral']
    },
    evolution: {
        target: {
            model: {
                succeptible: QEpiKit.scale(4503000 - 328, 0, 4503000)
            }
        }
    }
};
