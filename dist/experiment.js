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
                this.experimentLog[r] = this.recordFunction();
                r++;
            }
        };
        return Experiment;
    })();
    QEpiKit.Experiment = Experiment;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=experiment.js.map