var QKit;
(function (QKit) {
    var SIR = (function () {
        function SIR() {
        }
        SIR.prototype.construct = function (pop, path) {
            this.succeptible = pop.succeptible;
            this.infectious = pop.infectious;
            this.removed = pop.removed;
            this.totalPop = this.succeptible + this.infectious + this.removed;
            this.transmissionRate = path.transmissionRate;
            this.recoveryRate = path.recoveryRate;
            this.basicReproductionNumber = this.transmissionRate * this.succeptible / this.recoveryRate;
        };
        SIR.prototype.update = function () {
            this.succeptible -= this.transmissionRate * this.succeptible * this.infectious * this.step;
            this.infectious += this.transmissionRate * this.succeptible * this.infectious - (this.recoveryRate * this.infectious) * this.step;
        };
        SIR.prototype.setTime = function (time) {
            for (var i = 0; i <= time; i++) {
                this.update();
            }
        };
        return SIR;
    })();
    QKit.SIR = SIR;
})(QKit || (QKit = {}));
//# sourceMappingURL=sim.js.map