var QEpiKit;
(function (QEpiKit) {
    var CompartmentModel = (function () {
        function CompartmentModel(name, step, compartments, pathogen, vital) {
            this.name = name;
            this.step = step;
            this.compartments = compartments;
            this.transmissionRate = pathogen.transmissionRate * this.step;
            this.recoveryRate = pathogen.recoveryRate * this.step;
            this.basicReproductiveNumber = pathogen.transmissionRate / pathogen.recoveryRate;
            this.totalPop = 0;
            this.time = 0;
            this.history = [];
            for (var c in this.compartments) {
                this.totalPop += this.compartments[c].pop;
                this.compartments[c].initialPop = this.compartments[c].pop;
            }
            this.tolerance = 1e-9;
        }
        CompartmentModel.prototype.run = function (step, until, saveInterval) {
            var rem;
            while (this.time <= until) {
                this.update();
                rem = (this.time / step) % saveInterval;
                if (rem === 0) {
                    this.history[this.time / step] = JSON.parse(JSON.stringify(this.compartments));
                }
                this.time += this.step;
            }
        };
        CompartmentModel.prototype.update = function () {
            var temp_pop = [], temp_d = [], next_d = [], lte = [], err = 1, newStep;
            for (var c in this.compartments) {
                this.compartments[c].update();
            }
            for (var c in this.compartments) {
                temp_pop[c] = this.compartments[c].pop;
                temp_d[c] = this.compartments[c].dpop;
                this.compartments[c].pop = temp_pop[c] + temp_d[c];
            }
            this.totalPop = 0;
            for (var c in this.compartments) {
                next_d[c] = this.compartments[c].operation();
                this.compartments[c].pop = temp_pop[c] + (0.5 * (temp_d[c] + next_d[c]));
                this.totalPop += this.compartments[c].pop;
            }
        };
        return CompartmentModel;
    })();
    QEpiKit.CompartmentModel = CompartmentModel;
    var Compartment = (function () {
        function Compartment(name, pop, operation) {
            this.name = name;
            this.pop = pop;
            this.operation = operation || null;
            this.dpop = 0;
        }
        Compartment.prototype.update = function () {
            this.dpop = this.operation();
        };
        return Compartment;
    })();
    QEpiKit.Compartment = Compartment;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=compartment.js.map