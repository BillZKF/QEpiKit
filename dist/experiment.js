var QEpiKit;
(function (QEpiKit) {
    /**Batch run environments
    *
    */
    var Experiment = (function () {
        function Experiment(environment, setup, target) {
            this.environment = environment;
            this.setup = setup;
            this.target = setup.target;
            this.experimentLog = [];
        }
        Experiment.prototype.start = function (runs, step, until) {
            var r = 0;
            while (r < runs) {
                this.prep(r, this.setup);
                this.environment.time = 0; //
                this.environment.run(step, until, 0);
                this.experimentLog[r] = this.report(r, this.setup);
                r++;
            }
        };
        Experiment.prototype.prep = function (r, cfg, agents, visualize) {
            var _this = this;
            var groups = {};
            var currentAgentId = 0;
            this.environment = new QEpiKit.Environment();
            cfg.agents.forEach(function (group) {
                //groups[group.name] = generatePop(group.count, group.params, cfg.environment.spatialType, group.boundaries, currentAgentId)
                currentAgentId = groups[group.name][groups[group.name].length - 1].id;
            });
            cfg.components.forEach(function (cmp) {
                switch (cmp.type) {
                    case 'state-machine':
                        var sm = new QEpiKit.StateMachine(cmp.name, cmp.states, cmp.transitions, cmp.conditions, groups[cmp.agents][0]);
                        _this.environment.add(sm);
                        break;
                    case 'every-step':
                        _this.environment.add({
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
            switch (cfg.experiment) {
                default:
                    if (r == null) {
                        visualize();
                    }
                    else {
                        agents = this.environment.agents;
                        this.environment.run(cfg.environment.step, cfg.environment.until, 0);
                    }
                    break;
            }
        };
        Experiment.prototype.report = function (r, cfg) {
            var _this = this;
            var sums = {};
            var means = {};
            var freq = {};
            var model = {};
            cfg.report.sum = cfg.report.sum.concat(cfg.report.mean);
            this.environment.agents.forEach(function (d, i) {
                cfg.report.sum.forEach(function (s) {
                    sums[s] = sums[s] == undefined ? d[s] : d[s] + sums[s];
                });
                cfg.report.freq.forEach(function (f) {
                    freq[f] = freq[f] || {};
                    freq[f][d[f]] = freq[f][d[f]] == undefined ? 1 : freq[f][d[f]] + 1;
                });
            });
            cfg.report.mean.forEach(function (m) {
                means[m] = sums[m] / _this.environment.agents.length;
            });
            return {
                count: this.environment.agents.length,
                sums: sums,
                means: means,
                freq: freq,
                model: model
            };
        };
        //on each run, change one param, hold others constant
        Experiment.prototype.sweep = function (params, runsPer, baseline) {
            if (baseline === void 0) { baseline = true; }
            var expPlan = [];
            if (baseline === true) {
                params.baseline = [true];
            }
            for (var prop in params) {
                for (var i = 0; i < params[prop].length; i++) {
                    for (var k = 0; k < runsPer; k++) {
                        expPlan.push({
                            param: prop,
                            value: params[prop][i],
                            run: k
                        });
                    }
                }
            }
            this.plans = expPlan;
        };
        Experiment.prototype.boot = function (params) {
            var runs;
            for (var param in params) {
                if (typeof runs === 'undefined') {
                    runs = params[param].length;
                }
                if (params[param].length !== runs) {
                    throw "length of parameter arrays did not match";
                }
            }
            this.plans = params;
        };
        return Experiment;
    }());
    QEpiKit.Experiment = Experiment;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=experiment.js.map