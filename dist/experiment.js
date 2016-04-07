var QEpiKit;
(function (QEpiKit) {
    var Experiment = (function () {
        function Experiment(environment, prepFunction, recordFunction) {
            this.environment = environment;
            this.prepFunction = prepFunction;
            this.recordFunction = recordFunction;
            this.experimentLog = [];
        }
        Experiment.prototype.start = function (runs, step, until) {
            var r = 0;
            while (r < runs) {
                this.prepFunction(r);
                this.environment.time = 0;
                this.environment.run(step, until, 0);
                this.experimentLog[r] = this.recordFunction(r);
                r++;
            }
        };
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