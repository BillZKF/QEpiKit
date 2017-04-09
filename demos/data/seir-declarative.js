let pathogen = {
    N50: 4200,
    optParam: 0.000165,
    bestFitModel: 'exponential',
    decayRate: 0.01,
    recoveryTime: 6,
    shedRate: 700,
    mutationTime: 12
};

//setup pathogen
pathogen['beta-Poisson'] = function (dose) {
    let response = 1 - Math.pow((1 + (dose / pathogen.N50) * (Math.pow(2, (1 / pathogen.optParam)) - 1)), (-pathogen.optParam));
    return response;
};

pathogen['exponential'] = function (dose) {
    let response = 1 - Math.exp(-pathogen.optParam * dose);
    return response;
};
pathogen.personToPerson = true;

let setup = {
    experiment: {
        iterations: 5,
        type: 'randomSeed'
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
        params: [
            {
                name: 'movePerDay',
                assign: () => {
                    return jStat.normal.sample(3000, 1000)
                }
            },
            {
                name: 'contactAttempts',
                assign: function (agent) {
                    //how many physical contacts per day: mean 10 sd 4 with a floor of 1
                    return Math.max(1, jStat.normal.sample(30, 6));
                }
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
                assign: function () {
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
                check: QEpiKit.Utils.gt
            },
            'infection': {
                key: 'responseProb',
                value: () => {
                    return Math.random()
                },
                check: QEpiKit.Utils.gt
            },
            'recovery': {
                key: 'timeInfectious',
                value: 5, //pathogen.recoveryTime,
                check: QEpiKit.Utils.gt
            },
            'resucceptible': {
                key: 'timeRecovered',
                value: 4, //pathogen.mutationTime,
                check: QEpiKit.Utils.gt
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
        sum: ['pathogenLoad', 'madeAttempts'],
        mean: ['pathogenLoad', 'madeAttempts'],
        freq: ['illness']
    }
};

let seed = 5437;
let random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
let env = new QEpiKit.Environment();
let agents;
let exp;
let infectedAtStart = 8;
function compile(r, cfg) {
    let groups = {};
    let currentAgentId = 0;
    if (cfg.experiment == 'randomSeed') {
        //iterate the random seed for next run
        seed++;
        if (run % perParam === 0) {
            seed = startSeed;
        }
        random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
    }
    env = new QEpiKit.Environment();

    cfg.agents.forEach((group) => {
        groups[group.name] = generatePop(group.count, group.params, cfg.environment.spatialType, group.boundaries, currentAgentId)
        currentAgentId = groups[group.name][groups[group.name].length - 1].id;
    });
    cfg.components.forEach((cmp) => {
        switch (cmp.type) {
            case 'state-machine':
                let sm = new QEpiKit.StateMachine(cmp.name, cmp.states, cmp.transitions, cmp.conditions, groups[cmp.agents][0]);
                env.add(sm);
                break;
            case 'every-step':
                env.add({
                    id: QEpiKit.Utils.generateUUID(),
                    name: cmp.name,
                    update: cmp.action,
                    data: groups[cmp.agents][0]
                });
                break;
            default:
                break;
        }
    });
    if (r == null) {
        visualize();
    } else {
        agents = env.agents;
        env.run(cfg.environment.step, cfg.environment.until)
    }
}

function report(r, cfg) {
    let sums = {};
    let means = {};
    let freq = {};
    let model = {};
    cfg.report.sum = cfg.report.sum.concat(cfg.report.mean);
    env.agents.forEach((d, i) => {
        cfg.report.sum.forEach((s) => {
            sums[s] = sums[s] == undefined ? d[s] : d[s] + sums[s];
        });
        cfg.report.freq.forEach((f) => {
            freq[f] = freq[f] || {};
            freq[f][d.states[f]] = freq[f][d.states[f]] == undefined ? 1 : freq[f][d.states[f]] + 1;
        })
    });
    cfg.report.mean.forEach((m) => {
        means[m] = sums[m] / env.agents.length;
    })
    return {
        count: env.agents.length,
        sums: sums,
        means: means,
        freq: freq,
        model: model
    }
}

function launch(cfg) {
    exp = new QEpiKit.Experiment(env, compile, report, cfg);
    exp.start(cfg.experiment.iterations, cfg.environment.step, cfg.environment.until)
}


//visualization objects
/* jshint esversion: 6*/
let scene = new THREE.Scene();
let raycaster = new THREE.Raycaster();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
let renderer = new THREE.WebGLRenderer({
    alpha: true
});

function visualize(cb) {
    //live update
    let bounds = setup.environment.bounds;
    camera.position.z = Math.max(bounds[0], bounds[1]) * 0.5;
    camera.position.x = bounds[0] * 0.5;
    camera.position.y = bounds[1] * 0.5;
    camera.rotation.x = 8 * Math.PI / 180;
    document.querySelector('#ex-1').innerHTML = '';
    document.querySelector('#ex-1').appendChild(renderer.domElement);
    renderer.setSize(1280, 720);
    renderer.setClearColor(0xffffff, 0);
    env.init();
    render();
}

function render() {
    if (env.time <= setup.environment.until) {
        requestAnimationFrame(render);
        env.update(setup.environment.step);
        env.time += setup.environment.step;
        renderer.render(scene, camera);
    } else {
        report(null, setup);
    }
}

function generatePop(numAgents, options, type, boundaries, currentAgentId) {
    var pop = [];
    var locs = {
        type: 'FeatureCollection',
        features: []
    };
    options = options || [];
    type = type || 'continuous';
    for (var a = 0; a < numAgents; a++) {
        pop[a] = {
            id: currentAgentId,
            type: type
        };
        //movement params
        pop[a].movePerDay = jStat.normal.inv(Math.random(), 2500 * 24, 1000); // m/day
        pop[a].prevX = 0;
        pop[a].prevY = 0;
        pop[a].movedTotal = 0;

        if (pop[a].type === 'continuous') {

            pop[a].mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 1), new THREE.MeshBasicMaterial({
                color: 0x00ff00
            }));
            pop[a].mesh.qId = pop[a].id;
            pop[a].mesh.type = 'agent';

            pop[a].position = { x: 0, y: 0, z: 0 };

            pop[a].position.x = random.real(boundaries.left, boundaries.right);
            pop[a].position.y = random.real(boundaries.bottom, boundaries.top);

            pop[a].mesh.position.x = pop[a].position.x;
            pop[a].mesh.position.y = pop[a].position.y;

            scene.add(pop[a].mesh);
        }

        if (pop[a].type === 'geospatial') {
            locs.features[a] = turf.point([random.real(-75.1467, -75.1867), random.real(39.9200, 39.9900)]);
            pop[a].location = locs.features[a];
            pop[a].location.properties.agentRefID = pop[a].id;
        }

        options.forEach((d) => {
            if (typeof d.assign === 'function') {
                pop[a][d.name] = d.assign(pop[a]);
            } else {
                pop[a][d.name] = d.assign;
            }
        });
        currentAgentId++;
    }
    for (var r = 0; r < infectedAtStart; r++) {
        pop[r].states.illness = 'infectious';
        pop[r].pathogenLoad = 8e4;
    }
    return [pop, locs];
}
