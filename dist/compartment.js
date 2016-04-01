var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var QEpiKit;
(function (QEpiKit) {
    var CompartmentModel = (function (_super) {
        __extends(CompartmentModel, _super);
        function CompartmentModel(name, data) {
            _super.call(this, name);
            this.data = data;
            this.totalPop = 0;
            this.history = [];
            for (var d = 0; d < this.data.length; d++) {
                this.totalPop += this.data[d].totalPop;
            }
            this._tolerance = 1e-9;
        }
        CompartmentModel.prototype.update = function (patch, step) {
            var temp_pop = [], temp_d = [], next_d = [], lte = [], err = 1, newStep;
            var compartments = patch.compartments;
            for (var c = 0; c < compartments.length; c++) {
                compartments[c].dpop = compartments[c].operation(step);
            }
            for (var c = 0; c < compartments.length; c++) {
                temp_pop[c] = compartments[c].pop;
                temp_d[c] = compartments[c].dpop;
                compartments[c].pop = temp_pop[c] + temp_d[c];
            }
            patch.totalPop = 0;
            for (var c = 0; c < compartments.length; c++) {
                next_d[c] = compartments[c].operation(step);
                compartments[c].pop = temp_pop[c] + (0.5 * (temp_d[c] + next_d[c]));
                patch.totalPop += compartments[c].pop;
            }
        };
        return CompartmentModel;
    }(QEpiKit.QComponent));
    QEpiKit.CompartmentModel = CompartmentModel;
    var Compartment = (function () {
        function Compartment(name, pop, operation) {
            this.name = name;
            this.pop = pop;
            this.operation = operation || null;
            this.dpop = 0;
        }
        return Compartment;
    }());
    QEpiKit.Compartment = Compartment;
    var Patch = (function () {
        function Patch(name, compartments) {
            this.id = Patch.newId();
            this.name = name;
            this.compartments = compartments;
            this.totalPop = 0;
            for (var c = 0; c < this.compartments.length; c++) {
                this.totalPop += this.compartments[c].pop;
                this.compartments[c].initialPop = this.compartments[c].pop;
            }
        }
        Patch.newId = function () {
            Patch.cId++;
            return Patch.cId;
        };
        Patch.cId = 0;
        return Patch;
    }());
    QEpiKit.Patch = Patch;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=compartment.js.map