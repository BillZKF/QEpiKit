module QEpiKit {
  /**
  * Belief Desire Intent agents are simple planning agents with modular plans / deliberation processes.
  */
  export class BDIAgent extends QComponent implements Observer {

    public goals: any;
    public plans: any;
    public data: any;
    public results: any[];
    public policySelector: Function;
    public beliefHistory: any[];
    public planHistory: any[];

    constructor(name: string, goals: any, plans, data, policySelector) {
      super(name);
      this.goals = goals;
      this.plans = plans;
      this.data = data;
      this.policySelector = policySelector || BDIAgent.stochasticSelection;
      this.beliefHistory = [];
      this.planHistory = [];
    }

    /** Take one time step forward, take in beliefs, deliberate, implement policy
    * @param step size of time step (in days by convention)
    */
    update(step: number) {
      var c, matcher, policy, intent, achievements = [], barriers = [], belief = this.data, successes = 0;
      policy = this.policySelector(this.plans, this.planHistory);
      intent = this.plans[policy];
      intent(belief);
      for (var i = 0; i < this.goals.length; i++) {
        c = this.goals[i].condition;
        achievements[i] = this.goals[i].temporal(c.check(c.data[c.key], c.value));
        if (achievements[i] === BDIAgent.SUCCESS) {
          successes += 1;
        } else {
          matcher = Utils.getMatcherString(c.check);
          barriers.push({
            label: c.label,
            key: c.key,
            check: matcher,
            actual: c.data[c.key],
            expected: c.value
          });
        }
      }
      this.planHistory.push({ time: this.time, intention: policy, goals: achievements, barriers: barriers, r: successes / this.goals.length });
      this.time += step;
    }

    /** Assess the current state of the data under observation by evaluating the bdi agent.
    * @param eventName name of the event
    */
    assess(eventName:string){
      var c, matcher, policy, intent, achievements = [], barriers = [], belief = this.data, successes = 0;
      policy = this.policySelector(this.plans, this.planHistory);
      intent = this.plans[policy];
      intent(belief);
      for (var i = 0; i < this.goals.length; i++) {
        c = this.goals[i].condition;
        achievements[i] = this.goals[i].temporal(c.check(c.data[c.key], c.value));
        if (achievements[i] === BDIAgent.SUCCESS) {
          successes += 1;
        } else {
          matcher = Utils.getMatcherString(c.check);
          barriers.push({
            label: c.label,
            key: c.key,
            check: matcher,
            actual: c.data[c.key],
            expected: c.value
          });
        }
      }
      this.planHistory[eventName] = {intention: policy, goals: achievements, barriers: barriers, r: successes / this.goals.length };
    }

    run(step: number, until: number, saveInterval: number) {
      this.time = 0;
      while (this.time <= until) {
        this.update(step);
        let rem = this.time % saveInterval;
        if (rem === 0) {
          this.beliefHistory.push(JSON.parse(JSON.stringify(this.data)));
        }
      }
    }

    public static stochasticSelection(plans, planHistory) {
      var policy, score, max = 0;
      for (var plan in plans) {
        score = Math.random();
        if (score >= max) {
          max = score;
          policy = plan;
        }
      }
      return policy;
    }

    public static lazyPolicySelection = function(plans, planHistory) {
      var options, selection;
      if (this.time > 0) {
        options = Object.keys(plans);
        options = options.slice(1, options.length);
        selection = Math.floor(Math.random() * options.length);
      } else {
        options = Object.keys(plans);
        selection = 0;
      }
      return options[selection];
    };
  }
}
