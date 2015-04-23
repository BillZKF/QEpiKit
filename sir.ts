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

        constructor(pop: SIRPop, path: SIRPathogen) {
            this.succeptible = pop.succeptible;
            this.infectious = pop.infectious || 0;
            this.removed = pop.removed;
            this.totalPop = this.succeptible + this.infectious + this.removed;
            this.transmissionRate = path.transmissionRate;
            this.recoveryRate = path.recoveryRate;
            this.basicReproductionNumber = this.transmissionRate * this.succeptible / this.recoveryRate;
            this.step = 0.000694;            
        }

       public update() {
           var deltaS = this.transmissionRate * this.succeptible * this.infectious * this.step;
           var deltaI = deltaS - (this.recoveryRate * this.infectious) * this.step;
           console.log(deltaS);
           if (this.succeptible >= 0 && this.infectious >= 0) {
               this.succeptible -= deltaS;
               this.infectious += deltaI;

               this.totalPop = this.succeptible + this.infectious + this.removed;
           }
       }

       public setTime(time: number) {
            for (var i = 0; i <= time; i++) {
                this.update();
            }
        }
    }

    export interface SIRPop {
        succeptible: number;
        infectious: number;
        removed: number;
        birthRate: number;
    }

    export interface SIRPathogen {
        transmissionRate: number;
        recoveryRate: number;
    }
} 