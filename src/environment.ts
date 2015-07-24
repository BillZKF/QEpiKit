/**
*The QEpi main module and namespace.
*@preferred
*/
module QEpiKit{
  /**
  *Environments are the executable environment containing the model components,
  *shared resources, and scheduler.
  */
  export class Environment{
    /**
    * time current time for the environment (shared with all model components)
    */
    public time : number;
    /**
    * The models array contains runnable model components
    */
    public models : any[];
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

    constructor(agents, resources, eventsQueue:Event[]){
      this.time = 0;
      this.geoNetwork = [];
      this.models = [];
      this.history = [];
      this.agents = agents;
      this.resources = resources;
      this.eventsQueue = eventsQueue;
    }

    /** Add a model components from the environment
    * @param component the model component object to be added to the environment.
    */
    add(component){
      this.models.push(component);
    }

    /** Remove a model components from the environment by id
    * @param id UUID of the component to be removed.
    */
    remove(id){
      var deleteIndex;
      this.models.forEach(function(c, index){ if (c.id === id){ deleteIndex = index;}});
      this.models.splice(deleteIndex, 1)
    }

    /** Run all environment model components from t=0 until t=until using time step = step
    * @param step the step size
    * @param until the end time
    * @param saveInterval save every 'x' steps
    */
    run(step:number, until:number, saveInterval:number){
      while(this.time <= until){
        this.update(step);
        var rem = (this.time / step) % saveInterval;
        if(rem === 0){
          this.history.push(JSON.parse(JSON.stringify(this.resources)));
        }
        this.time += step;
      }
    }

    /** Update each model compenent one time step forward
    * @param step the step size
    */
    update(step:number){
      var eKey = this.time.toString();
      if(this.eventsQueue.hasOwnProperty(eKey)){
        this.eventsQueue[eKey].trigger(this.agents);
        this.eventsQueue[eKey].triggered = true;
      } else {
        this.eventsQueue[eKey] = null;
      }
      for(var c = 0; c < this.models.length; c++){
        this.models[c].update(step);
      }
    }
  }

  /**
  * Events are triggered at a given time
  */
  export class Event{
    /**
    * trigged false until trigger function is called for event, then set true
    */
    public triggered: boolean;
    /**
    * trigger called at time specified by event
    */
    public trigger: Function;

    constructor(trigger:Function){
      this.trigger = trigger;
    }
  }
}
