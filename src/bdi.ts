module QEpiKit {
  //Belief Desire Intent
  export class BDIAgent {
    public static SUCCESS: number = 1;
    public static FAILED: number = 2;
    public static RUNNING: number = 3;

    public id: string;
    public name: string;
    public goals: any;
    public plans: any;
    public data: any;
    public policySelector: Function;
    public time: number;
    public beliefHistory: any[];
    public planHistory: any[];

    constructor(name: string, goals: any, plans, data, policySelector) {
      this.id = QEpiKit.Utils.generateUUID();
      this.name = name;
      this.goals = goals;
      this.plans = plans;
      this.data = data;
      this.policySelector = policySelector || BDIAgent.stochasticSelection;
      this.time = 0;
      this.beliefHistory = [];
      this.planHistory = [];
    }

    update(step: number, events: any) {
      try {
        events[this.time](this.data);
      } catch (e) {
        events[this.time] = null;
      }
      var c, policy, intent, achievements = [], belief = this.data, successes = 0;
      policy = this.policySelector(this.plans, this.planHistory);
      intent = this.plans[policy];
      intent(belief);
      for (var i = 0; i < this.goals.length; i++) {
        c = this.goals[i].condition;
        achievements[i] = this.goals[i].temporal(c.check(belief[c.key], c.value));
        if (achievements[i] === BDIAgent.SUCCESS) {
          successes += 1;
        }
      }
      this.planHistory.push({ time: this.time, intention: policy, goals: achievements, r: successes / this.goals.length });
      this.time += step;
    }

    generateTimeData(step: number, limit: number, recordInt: number, events: any) {
      while (this.time <= limit) {
        this.update(step, events);
        var rem = this.time % recordInt;
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

    public static pastRewardSelection(plans, planHistory) {
      var policy, sum =0, mean = 0, planCount =0, variance = 0, score, max = 0, planScore = {};
      if (planHistory.length < 1) {
        policy = BDIAgent.stochasticSelection(plans, planHistory);
      } else {
        for (var p in plans) {
          planScore[p] = 0;
          planCount++;
        }
        for (var plan in planHistory) {
          score = planHistory[plan].r;
          if (score > planScore[planHistory[plan].intention]) {
            score += score * 0.1;
          } else {
            score -= score * 0.15;
          }
          planScore[planHistory[plan].intention] = score
        }
        for (var plan in planScore) {
          sum += planScore[plan];
          if (planScore[plan] > max) {
            max = planScore[plan];
            policy = plan;
          }
        }
        mean = sum / planCount;
         for(var plan in planScore){
           variance += Math.pow(planScore[plan] - mean, 2);
         }
         variance = Math.sqrt(variance / planCount);
         if(variance <= 0.2){
            policy = BDIAgent.stochasticSelection(plans, planHistory);
         }
      }

      return policy;
    }
  }
}
