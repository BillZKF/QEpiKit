var QKit;
(function (QKit) {
    var SIR = (function () {
        function SIR(pop, path) {
            this.succeptible = pop.succeptible;
            this.infectious = pop.infectious || 0;
            this.removed = pop.removed;
            this.totalPop = this.succeptible + this.infectious + this.removed;
            this.transmissionRate = path.transmissionRate;
            this.recoveryRate = path.recoveryRate;
            this.basicReproductionNumber = this.transmissionRate * this.succeptible / this.recoveryRate;
            this.step = 0.000694;
        }
        SIR.prototype.update = function () {
            var deltaS = this.transmissionRate * this.succeptible * this.infectious * this.step;
            var deltaI = deltaS - (this.recoveryRate * this.infectious) * this.step;
            console.log(deltaS);
            if (this.succeptible >= 0 && this.infectious >= 0) {
                this.succeptible -= deltaS;
                this.infectious += deltaI;
                this.totalPop = this.succeptible + this.infectious + this.removed;
            }
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
//# sourceMappingURL=sir.js.map