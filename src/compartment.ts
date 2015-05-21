module QKit {
    export class CompartmentModel {
        public name: string;
        public step: number;
        public vital: Vital;
        public pathogen: Pathogen;
        public compartments: Compartment[];
        public totalPop: number;
        public transmissionRate: number;
        public recoveryRate: number;
        public basicReproductiveNumber: number;

        constructor(name: string, step: number, compartments: Compartment[], pathogen: Pathogen, vital: Vital) {
            this.name = name;
            this.step = step;
            this.compartments = compartments;
            this.transmissionRate = pathogen.transmissionRate * this.step;
            this.recoveryRate = pathogen.recoveryRate;
            this.basicReproductiveNumber = pathogen.transmissionRate / pathogen.recoveryRate;
            this.totalPop = 0;
            for (var c in this.compartments) {
                this.totalPop += this.compartments[c].pop;
            }
        }

        public run() {
            for (var c in this.compartments) {
                this.compartments[c].update();
            }

            for (var c in this.compartments) {
                this.compartments[c].pop += this.compartments[c].delta;

            }
        }
    }

    export class Compartment {
        public name: string;
        public pop: number;
        public operation: Function;
        public delta: number;

        constructor(name: string, pop: number, operation: Function) {
            this.name = name;
            this.pop = pop;
            this.operation = operation || null;
        }

        public update() {
            this.delta = this.operation();
        }
    }

    export interface Vital {
        birthRate: number;
        mortalityRate: number;
    }

    export interface Pathogen {
        transmissionRate: number;
        recoveryRate: number;
        latentInfectiousRate: number;
    }

    export interface Patch {
      pop : number;
      location : number[];
    }
}
