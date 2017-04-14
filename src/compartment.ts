import {generateUUID} from './utils';
import {QComponent} from './QComponent';

export class CompartmentModel extends QComponent {
    public name: string;
    public data: Patch[];
    public totalPop: number;
    public compartments: any;

    private _tolerance: number;

    constructor(name: string, compartments: any, data: Patch[]) {
        super(name);
        this.data = data; //an array of Patches. Each patch contains an array of compartments in operational order
        this.totalPop = 0;
        this.compartments = compartments;
        this.history = [];
        for (let d = 0; d < this.data.length; d++) {
            this.totalPop += this.data[d].totalPop;
        }
        this._tolerance = 1e-9;//model err tolerance
    }

    update(patch: Patch, step: number) {
        let temp_pop = {}, temp_d = {}, next_d = {}, lte = {}, err = 1, newStep;
        for (let c  in this.compartments) {
            patch.dpops[c] = this.compartments[c].operation(patch.populations, step);
        }
        //first order (Euler)
        for (let c in this.compartments) {
            temp_pop[c] = patch.populations[c];
            temp_d[c] = patch.dpops[c];
            patch.populations[c] = temp_pop[c] + temp_d[c];
        }

        //second order (Heuns)
        patch.totalPop = 0;
        for (let c in this.compartments) {
            next_d[c] = this.compartments[c].operation(patch.populations, step);
            patch.populations[c] = temp_pop[c] + (0.5 * (temp_d[c] + next_d[c]));
            patch.totalPop += patch.populations[c];
        }
    }
}

export class Compartment {
    public name: string;
    public operation: Function;

    constructor(name: string, pop: number, operation: Function) {
        this.name = name;
        this.operation = operation || null;
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

export class Patch {

    public id: string;
    public name: string;
    public compartments: any;
    public populations: any = {};
    public dpops: any = {};
    public totalPop: number;
    public initialPop: any = {};
    public operation: Function;
    public dpop: number;
    public travelWeight: number;

    constructor(name: string, compartments: any, populations: any) {
        this.id = generateUUID();
        this.name = name;
        this.dpops = {};
        this.compartments = compartments;
        this.totalPop = 0;
        for (let c in populations) {
            this.dpops[c] = 0;
            this.initialPop[c] = populations[c];
            this.populations[c] = populations[c];
            this.totalPop += this.populations[c];
        }
    }
}
