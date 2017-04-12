import {QComponent} from './QComponent';
export class CompartmentModel extends QComponent {
    public name: string;
    public data: Patch[];
    public totalPop: number;

    private _tolerance: number;

    constructor(name: string, data: Patch[]) {
        super(name);
        this.data = data; //an array of Patches. Each patch contains an array of compartments in operational order
        this.totalPop = 0;
        this.history = [];
        for (let d = 0; d < this.data.length; d++) {
            this.totalPop += this.data[d].totalPop;
        }
        this._tolerance = 1e-9;//model err tolerance
    }

    update(patch: Patch, step: number) {
        let temp_pop = [], temp_d = [], next_d = [], lte = [], err = 1, newStep;
        let compartments = patch.compartments;
        for (let c = 0; c < compartments.length; c++) {
            compartments[c].dpop = compartments[c].operation(compartments, step);
        }
        //first order (Euler)
        for (let c = 0; c < compartments.length; c++) {
            temp_pop[c] = compartments[c].pop;
            temp_d[c] = compartments[c].dpop;
            compartments[c].pop = temp_pop[c] + temp_d[c];
        }
        //second order (Heuns)
        patch.totalPop = 0;
        for (let c = 0; c < compartments.length; c++) {
            next_d[c] = compartments[c].operation(compartments, step);
            compartments[c].pop = temp_pop[c] + (0.5 * (temp_d[c] + next_d[c]));
            patch.totalPop += compartments[c].pop;
        }
    }
}

export class Compartment {
    public name: string;
    public pop: number;
    public initialPop: number;
    public operation: Function;
    public dpop: number;
    public travelWeight: number;

    constructor(name: string, pop: number, operation: Function) {
        this.name = name;
        this.pop = pop;
        this.operation = operation || null;
        this.dpop = 0;
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
    public static cId = 0;

    public id: number;
    public name: string;
    public compartments: Compartment[];
    public totalPop: number;
    public initialPop: number;
    public operation: Function;
    public dpop: number;
    public travelWeight: number;

    static newId() {
        Patch.cId++;
        return Patch.cId;
    }

    constructor(name: string, compartments: Compartment[]) {
        this.id = Patch.newId();
        this.name = name;
        this.compartments = compartments;
        this.totalPop = 0;
        for (var c = 0; c < this.compartments.length; c++) {
            this.totalPop += this.compartments[c].pop;
            this.compartments[c].initialPop = this.compartments[c].pop;
        }
    }
}
