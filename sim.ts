module QKit {
    export class SIR {
        succeptible: number;
        infectious: number;
        removed: number;
        totalPop: number;
        transmissionRate: number;
        recoveryRate: number;
        basicReproductionNumber: number;
        step: number;

        construct(pop: SIRPop, path: SIRPathogen ) {
            this.succeptible = pop.succeptible;
            this.infectious = pop.infectious;
            this.removed = pop.removed;
            this.totalPop = this.succeptible + this.infectious + this.removed;
            this.transmissionRate = path.transmissionRate;
            this.recoveryRate = path.recoveryRate;
            this.basicReproductionNumber = this.transmissionRate * this.succeptible / this.recoveryRate;
        }

        update() {
            this.succeptible -= this.transmissionRate * this.succeptible * this.infectious * this.step;
            this.infectious += this.transmissionRate * this.succeptible * this.infectious - (this.recoveryRate * this.infectious) * this.step;
        }

        setTime(time: number) {
            for (var i = 0; i <= time; i++) {
                this.update();
            }
        }
    }

    export interface SIRPop {
        succeptible: number;
        infectious: number;
        removed: number;
    }

    export interface SIRPopVital {

    }

    export interface SIRPathogen {
        transmissionRate: number;
        recoveryRate: number;
    }
} 