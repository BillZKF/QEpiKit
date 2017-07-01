"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var compartment_1 = require("./compartment");
var environment_1 = require("./environment");
var stateMachine_1 = require("./stateMachine");
var random_1 = require("./random");
/**
*Batch run environments
*/
var Experiment = (function () {
    function Experiment(environment, setup, target) {
        this.type = 'sweep';
        this.environment = environment;
        this.setup = setup;
        this.rng = setup.experiment.rng === 'xorshift7' ? new random_1.RNGxorshift7(setup.experiment.seed) : new random_1.RNGBurtle(setup.experiment.seed);
        this.experimentLog = [];
        this.currentCFG = {};
        this.genLog = [];
    }
    Experiment.prototype.start = function (runs, step, until, prepCB) {
        var r = 0;
        runs = runs * this.setup.experiment.size;
        while (r < runs) {
            this.prep(r, this.setup, prepCB);
            this.environment.time = 0; //
            this.environment.run(step, until, 0);
            this.experimentLog[r] = this.report(r, this.setup);
            this.after(r, this.setup);
            if (r % this.setup.experiment.size === 0 && r !== 0) {
                this.endGen(r, this.setup);
            }
            r++;
        }
    };
    Experiment.prototype.prep = function (r, cfg, cb) {
        this.parseCFG(cfg);
        if (cb !== undefined) {
            cb();
        }
    };
    Experiment.prototype.endGen = function (run, cfg) {
        var prevStart = Math.min(0, run - cfg.experiment.size);
        this.genLog.push(this.genAvg(this.experimentLog.slice(prevStart, run), cfg));
        this.updateAssignment(cfg, cfg.experiment.params);
    };
    Experiment.prototype.parseCFG = function (cfg) {
        var _this = this;
        var groups = {};
        var currentAgentId = 0;
        cfg = JSON.parse(JSON.stringify(cfg));
        cfg.boundaries = {};
        this.environment = new environment_1.Environment();
        this.environment.rng = this.rng;
        if ('agents' in cfg) {
            for (var grName in cfg.agents) {
                var group = cfg.agents[grName];
                group.params.groupName = grName;
                this.environment.boundaries[grName] = group.boundaries;
                groups[grName] = utils_1.generatePop(group.count, group.params, cfg.environment.spatialType, group.boundaries, currentAgentId, this.rng);
                currentAgentId = groups[grName][groups[grName].length - 1].id;
            }
        }
        if ('patches' in cfg) {
            cfg.patches.forEach(function (patch) {
                _this.environment.boundaries[patch.name] = patch.boundaries;
                patch.params.groupName = patch.name;
                groups[patch.name] = utils_1.generatePop(1, patch.params, cfg.environment.spatialType, patch.boundaries, currentAgentId, _this.rng);
            });
        }
        if ('resources' in cfg) {
            var resources = [];
            for (var rsc in cfg.resources) {
                resources = utils_1.addResources(resources, cfg.resources[rsc], cfg.resources[rsc].quantity);
            }
            this.environment.resources = resources;
        }
        if ('entities' in cfg) {
            for (var entity in cfg.entities) {
                for (var method in cfg.entities[entity].methods) {
                    cfg.entities[entity].methods[method] = QActions[method];
                }
                this.environment.entities[entity] = cfg.entities[entity];
            }
        }
        cfg.components.forEach(function (cmp) {
            switch (cmp.type) {
                case 'state-machine':
                    for (var state in cmp.states) {
                        cmp.states[state] = QActions[cmp.states[state]];
                    }
                    for (var cond in cmp.conditions) {
                        cmp.conditions[cond].check = utils_1.Match[cmp.conditions[cond].check];
                    }
                    var sm = new stateMachine_1.StateMachine(cmp.name, cmp.states, cmp.transitions, cmp.conditions, groups[cmp.agents][0]);
                    _this.environment.add(sm);
                    break;
                case 'compartmental':
                    var patches_1 = [];
                    cfg.patches.forEach(function (patch) {
                        if (cmp.patches.indexOf(patch.name) != -1) {
                            for (var compartment in cmp.compartments) {
                                cmp.compartments[compartment].operation = QActions[cmp.compartments[compartment].operation];
                            }
                            var p = new compartment_1.Patch(patch.name, cmp.compartments, patch.populations);
                            groups[patch.name][0][0] = Object.assign(groups[patch.name][0][0], p);
                            patches_1.push(groups[patch.name][0][0]);
                        }
                    });
                    var cModel = new compartment_1.CompartmentModel(cmp.name, cmp.compartments, patches_1);
                    _this.environment.add(cModel);
                    break;
                case 'every-step':
                    cmp.action = QActions[cmp.action];
                    _this.environment.add({
                        id: utils_1.generateUUID(),
                        name: cmp.name,
                        update: cmp.action,
                        data: groups[cmp.agents][0]
                    });
                    break;
                default:
                    break;
            }
        });
    };
    Experiment.prototype.report = function (r, cfg) {
        var sums = {};
        var means = {};
        var freqs = {};
        var model = {};
        var count = this.environment.agents.length;
        var _loop_1 = function (i) {
            var d = this_1.environment.agents[i];
            cfg.report.sums.forEach(function (s) {
                sums[s] = sums[s] == undefined ? d[s] : d[s] + sums[s];
            });
            cfg.report.freqs.forEach(function (f) {
                if (typeof d[f] === 'number' || typeof d[f] === 'boolean' && !isNaN(d[f])) {
                    freqs[f] = freqs[f] == undefined ? 1 : d[f] + freqs[f];
                }
            });
            if ('compartments' in d) {
                cfg.report.compartments.forEach(function (cm) {
                    model[cm] = model[cm] == undefined ? d.populations[cm] : d.populations[cm] + model[cm];
                });
            }
        };
        var this_1 = this;
        //cfg.report.sum = cfg.report.sum.concat(cfg.report.mean);
        for (var i = 0; i < this.environment.agents.length; i++) {
            _loop_1(i);
        }
        ;
        cfg.report.means.forEach(function (m) {
            means[m] = sums[m] / count;
        });
        return {
            run: r,
            cfg: this.currentCFG,
            count: count,
            sums: sums,
            means: means,
            freqs: freqs,
            model: model,
            score: 0
        };
    };
    //on each run, change one param, hold others constant
    Experiment.prototype.after = function (run, cfg) {
    };
    Experiment.prototype.genAvg = function (logs, cfg) {
        var sums = {};
        var freqs = {};
        var sumMeans = {};
        var means = {};
        logs.forEach(function (log) {
            cfg.report.sums.forEach(function (s) {
                sums[s] = sums[s] == undefined ? log.sums[s] : log.sums[s] + sums[s];
            });
            cfg.report.freqs.forEach(function (f) {
                freqs[f] = freqs[f] == undefined ? log.freqs[f] : log.freqs[f] + freqs[f];
            });
            cfg.report.means.forEach(function (m) {
                sumMeans[m] = sumMeans[m] == undefined ? log.means[m] : log.means[m] + sumMeans[m];
            });
        });
        cfg.report.means.forEach(function (m) {
            means[m] = sumMeans[m] / logs.length;
        });
        cfg.report.freqs.forEach(function (f) {
            means[f] = freqs[f] / logs.length;
        });
        return {
            means: means,
            sums: sums,
            freqs: freqs
        };
    };
    Experiment.prototype.updateAssignment = function (cfg, parameters) {
        for (var pm = 0; pm < parameters.length; pm++) {
            var param = parameters[pm];
            var val = utils_1.assignParam({}, param, param.name, this.rng);
            this.currentCFG[param.level] = this.currentCFG[param.level] || {};
            this.currentCFG[param.level][param.group] = this.currentCFG[param.level][param.group] || {};
            this.currentCFG[param.level][param.group][param.name] = val;
            switch (param.level) {
                case 'agents':
                    if (param.group === 'boundaries') {
                        cfg.agents.boundaries[param.name].assign = val;
                    }
                    else {
                        cfg.agents[param.group].params[param.name].assign = val;
                    }
                    break;
                case 'entities':
                    cfg.entities[param.group][param.name] = val;
                    break;
                default:
                    cfg[param.level].params[param.group][param.name] = val;
                    break;
            }
        }
    };
    return Experiment;
}());
exports.Experiment = Experiment;
