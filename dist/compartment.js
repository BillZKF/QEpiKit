var QKit;
(function (QKit) {
    var CompartmentModel = (function () {
        function CompartmentModel(name, step, compartments, pathogen, vital) {
            this.name = name;
            this.step = step;
            this.compartments = compartments;
            this.transmissionRate = pathogen.transmissionRate * this.step;
            this.recoveryRate = pathogen.recoveryRate * this.step;
            this.basicReproductiveNumber = pathogen.transmissionRate / pathogen.recoveryRate;
            this.totalPop = 0;
            for (var c in this.compartments) {
                this.totalPop += this.compartments[c].pop;
                this.compartments[c].initialPop = this.compartments[c].pop;
            }
        }
        CompartmentModel.prototype.run = function () {
            for (var c in this.compartments) {
                this.compartments[c].update();
            }
            for (var c in this.compartments) {
                this.compartments[c].pop += this.compartments[c].dpop * this.step;
            }
        };
        return CompartmentModel;
    })();
    QKit.CompartmentModel = CompartmentModel;
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
    QKit.Compartment = Compartment;
})(QKit || (QKit = {}));
//# sourceMappingURL=compartment.js.map