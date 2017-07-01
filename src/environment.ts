import {QEvent} from './events';
import {shuffle} from './utils';
/**
*Environments are the executable environment containing the model components,
*shared resources, and scheduler.
*/
export class Environment {
    /**
    * current time for the environment (shared with all model components)
    */
    public time: number;
    /**
    * time of day
    */
    public timeOfDay: number;
    /**
    * The model's array contains runnable model components
    */
    public models: any[];
    /**
    * The eventsQueue is an array of Event objects
    */
    public eventsQueue: QEvent[];
    /**
    * The history of the environment
    */
    public history: any;
    /**
    * spatial boundaries
    **/
    public boundaries: any = {};
    /**
    * The finite resources of the environment
    */
    public resources: any;
    /**
    * key indexed, methods.
    */
    public entities: any;
    /**
    * The agents in the simulation
    */
    public agents: any;
    /**
    * The activationType, 'random' (default) or 'parrallel'. 'parrallel' activation requires an additional apply function within each model.
    */
    public activationType: string;
    /**
    * Randomness function for shuffling
    */
    public rng: any;

    private _agentIndex: any;

    constructor(resources = [], entities = {}, eventsQueue: QEvent[] = [], activationType: string = 'random', rng: any = Math) {
        this.time = 0;
        this.timeOfDay = 0;
        this.models = [];
        this.history = [];
        this.agents = [];
        this.resources = resources;
        this.entities = entities;
        this.eventsQueue = eventsQueue;
        this.activationType = activationType;
        this.rng = rng;
        this._agentIndex = {};
    }

    /** Add a model components from the environment
    * @param component the model component object to be added to the environment.
    */
    add(component) {
        this.models.push(component);
    }

    /** Remove a model components from the environment by id
    * @param id UUID of the component to be removed.
    */
    remove(id) {
        var deleteIndex, L = this.agents.length;
        this.models.forEach(function(c, index) {
          if (c.id === id) {
            deleteIndex = index;
          }
        });
        while (L > 0 && this.agents.length >= 0) {
            L--;
            if (this.agents[L].modelIndex === deleteIndex) {
                this.agents.splice(L, 1);
            }
        }
        this.models.splice(deleteIndex, 1);
    }

    /** Run all environment model components from t=0 until t=until using time step = step
    * @param step the step size
    * @param until the end time
    * @param saveInterval save every 'x' steps
    */
    run(step: number, until: number, saveInterval: number) {
        this.init();
        while (this.time <= until) {
            this.update(step);
            let rem = (this.time % saveInterval);
            if (rem < step) {
                let copy = JSON.parse(JSON.stringify(this.agents));
                this.history = this.history.concat(copy);
            }
            this.time += step;
        }
    }

    /** Assign all agents to appropriate models
    */
    init() {
        this._agentIndex = {};
        for (let c = 0; c < this.models.length; c++) {
            let alreadyIn = [];
            //assign each agent model indexes to handle agents assigned to multiple models
            for (let d = 0; d < this.models[c].data.length; d++) {
                let id = this.models[c].data[d].id;
                if (id in this._agentIndex) {
                    //this agent belongs to multiple models.
                    this.models[c].data[d].models.push(this.models[c].name);
                    this.models[c].data[d].modelIndexes.push(c);
                    alreadyIn.push(id);
                } else {
                    //this agent belongs to only one model so far.
                    this._agentIndex[id] = 0;
                    this.models[c].data[d].models = [this.models[c].name];
                    this.models[c].data[d].modelIndexes = [c];
                }
            }
            //eliminate any duplicate agents by id
            this.models[c].data = this.models[c].data.filter((d) => {
                if (alreadyIn.indexOf(d.id) !== -1) {
                    return false;
                }
                return true;
            })
            //concat the results
            this.agents = this.agents.concat(this.models[c].data);
        }
    }


    /** Update each model compenent one time step forward
    * @param step the step size
    */
    update(step: number) {
        var index = 0;
        while (index < this.eventsQueue.length && this.eventsQueue[index].at <= this.time) {
            this.eventsQueue[index].trigger();
            this.eventsQueue[index].triggered = true;
            if (this.eventsQueue[index].until <= this.time) {
                this.eventsQueue.splice(index, 1);
            }
            index++;
        }
        if (this.activationType === "random") {
            shuffle(this.agents, this.rng);
            this.agents.forEach((agent, i) => { this._agentIndex[agent.id] = i }); // reassign agent
            this.agents.forEach((agent, i) => {
                agent.modelIndexes.forEach((modelIndex) => {
                    this.models[modelIndex].update(agent, step);
                });
                agent.time = agent.time + step || 0;
            })
        }
        if (this.activationType === "parallel") {
            let tempAgents = JSON.parse(JSON.stringify(this.agents));
            tempAgents.forEach((agent) => {
                agent.modelIndexes.forEach((modelIndex) => {
                    this.models[modelIndex].update(agent, step);
                });
            })
            this.agents.forEach((agent, i) => {
                agent.modelIndexes.forEach((modelIndex) => {
                    this.models[modelIndex].apply(agent, tempAgents[i], step);
                });
                agent.time = agent.time + step || 0;
            })
        }
    }

    /** Format a time of day. Current time % 1.
    *
    */
    formatTime() {
        this.timeOfDay = this.time % 1;
    }

    /** Gets agent by id. A utility function that
    *
    */
    getAgentById(id: number) {
        return this.agents[this._agentIndex[id]];
    }
}
