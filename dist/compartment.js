import { QComponent } from './QComponent';
export class CompartmentModel extends QComponent {
    constructor(name, data) {
        super(name);
        this.data = data; //an array of Patches. Each patch contains an array of compartments in operational order
        this.totalPop = 0;
        this.history = [];
        for (let d = 0; d < this.data.length; d++) {
            this.totalPop += this.data[d].totalPop;
        }
        this._tolerance = 1e-9; //model err tolerance
    }
    update(patch, step) {
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
    constructor(name, pop, operation) {
        this.name = name;
        this.pop = pop;
        this.operation = operation || null;
        this.dpop = 0;
    }
}
export class Patch {
    constructor(name, compartments) {
        this.id = Patch.newId();
        this.name = name;
        this.compartments = compartments;
        this.totalPop = 0;
        for (var c = 0; c < this.compartments.length; c++) {
            this.totalPop += this.compartments[c].pop;
            this.compartments[c].initialPop = this.compartments[c].pop;
        }
    }
    static newId() {
        Patch.cId++;
        return Patch.cId;
    }
}
Patch.cId = 0;
//# sourceMappingURL=compartment.js.map