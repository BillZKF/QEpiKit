/**
*The QEpi main module and namespace.
*@preferred
*/
module QEpiKit {
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
    * The finite resources of the environment
    */
    public resources: any;
    /**
    * Assets (like bathrooms, garbage cans, water tanks) that can be in or out of operation, that can be filled or depleted to and from capacity.
    */
    public facilities: any;
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
    public randF: () => number;

    private _agentIndex: any;

    constructor(resources = [], facilities = [], eventsQueue: QEvent[] = [], activationType: string = 'random', randF: () => number = Math.random) {
      this.time = 0;
      this.timeOfDay = 0;
      this.models = [];
      this.history = [];
      this.agents = [];
      this.resources = resources;
      this.facilities = facilities;
      this.eventsQueue = eventsQueue;
      this.activationType = activationType;
      this.randF = randF;
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
      this.models.forEach(function(c, index) { if (c.id === id) { deleteIndex = index; } });
      while (L > 0 && this.agents.length >= 0) {
        L--;
        if(this.agents[L].modelIndex === deleteIndex){
          this.agents.splice(L, 1);
        }
      }
      this.models.splice(deleteIndex,1);
    }

    /** Run all environment model components from t=0 until t=until using time step = step
    * @param step the step size
    * @param until the end time
    * @param saveInterval save every 'x' steps
    */
    run(step: number, until: number, saveInterval: number) {
      for (var c = 0; c < this.models.length; c++) {
        for (var d = 0; d < this.models[c].data.length; d++) {
          this.models[c].data[d].model = this.models[c].name;
          this.models[c].data[d].modelIndex = c;
        }
        this.agents = this.agents.concat(this.models[c].data);
      }
      while (this.time <= until) {
        this.update(step);
        let rem = (this.time % saveInterval);
        if (rem < step) {
          let copy = JSON.parse(JSON.stringify(this.agents));
          this.history = this.history.concat(copy);
        }
        this.time += step;
        this.formatTime();
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
        QEpiKit.Utils.shuffle(this.agents, this.randF);
<<<<<<< Updated upstream
        this.agents.forEach((agent)=>{
          this.models[agent.modelIndex].update(agent, step);
          agent.time = agent.time + step || 0;
        })
=======
        this.agents.forEach((d, i) => this._agentIndex[d.id] = i);
        for (let a = 0; a < this.agents.length; a++) {
          this.models[this.agents[a].modelIndex].update(this.agents[a], step);
          this.agents[a].time = this.agents[a].time + step || 0;
        }
>>>>>>> Stashed changes
      }

      if (this.activationType === "parallel") {
        let tempAgents = JSON.parse(JSON.stringify(this.agents));
        tempAgents.forEach((agent)=>{
          this.models[agent.modelIndex].update(agent, step);
        })
        this.agents.forEach((agent, i)=>{
          this.models[agent.modelIndex].apply(agent, tempAgents[i], step);
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

    getAgentById(id:number){
      return this.agents[this._agentIndex[id]];
    }
  }
}
