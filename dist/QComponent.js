import { generateUUID } from './utils';
/**
*QComponents are the base class for many model components.
*/
export class QComponent {
    constructor(name) {
        this.id = generateUUID();
        this.name = name;
        this.time = 0;
        this.history = [];
    }
    /** Take one time step forward (most subclasses override the base method)
    * @param step size of time step (in days by convention)
    */
    update(agent, step) {
        //something super!
    }
}
QComponent.SUCCESS = 1;
QComponent.FAILED = 2;
QComponent.RUNNING = 3;
//# sourceMappingURL=QComponent.js.map