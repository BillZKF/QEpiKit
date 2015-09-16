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
    * time current time for the environment (shared with all model components)
    */
    public time: number;
    /**
    * time of day
    */
    public timeOfDay: number;
    /**
    * The models array contains runnable model components
    */
    public models: any[];
    /**
    * The observers for this environment
    */
    public observers: any[];
    /**
    * The eventsQueue is an array of Event objects
    */
    public eventsQueue: Event[];
    /**
    * The history of the environment
    */
    public history: any;
    /**
    * The geographic network
    */
    public geoNetwork: any;
    /**
    * The finite resources of the environment
    */
    public resources: any;
    /**
    * The agents in the simulation
    */
    public agents: any;
    /**
    * Randomness function for shuffling
    */
    public randF: () => number;


    constructor(agents, resources, eventsQueue: Event[], randF: () => number = Math.random) {
      this.time = 0;
      this.geoNetwork = [];
      this.models = [];
      this.observers = [];
      this.history = [];
      this.agents = agents;
      this.resources = resources;
      this.eventsQueue = eventsQueue;
      this.randF = randF;
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
      var deleteIndex;
      this.models.forEach(function(c, index) { if (c.id === id) { deleteIndex = index; } });
      this.models.splice(deleteIndex, 1)
    }

    /** Add an observer to this environment
    * @param observer agent to be called on change
    */
    addObserver(observer) {
      this.observers.push(observer);
    }

    removeObserver(id) {
      var deleteIndex;
      this.observers.forEach(function(c, index) { if (c.id === id) { deleteIndex = index; } });
      this.observers.splice(deleteIndex, 1);
    }

    /** Run all environment model components from t=0 until t=until using time step = step
    * @param step the step size
    * @param until the end time
    * @param saveInterval save every 'x' steps
    */
    run(step: number, until: number, saveInterval: number) {
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
      this.publish("finished");
    }

    publish(eventName) {
      for (var o = 0; o < this.observers.length; o++) {
        this.observers[o].assess(eventName);
      }
    }

    /** Update each model compenent one time step forward
    * @param step the step size
    */
    update(step: number) {
      var eKey = this.time.toString();
      if (this.eventsQueue.hasOwnProperty(eKey)) {
        this.eventsQueue[eKey].trigger(this.agents);
        this.eventsQueue[eKey].triggered = true;
      } else {
        //this.eventsQueue[eKey] = undefined;
      }
      for (var c = 0; c < this.models.length; c++) {
        QEpiKit.Utils.shuffle(this.agents, this.randF);
        this.models[c].update(step);
      }
    }

    formatTime(){
      this.timeOfDay = this.time % 1;
    }
  }
}
