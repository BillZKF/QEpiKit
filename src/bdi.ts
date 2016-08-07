module QEpiKit {
    /**
    * Belief Desire Intent agents are simple planning agents with modular plans / deliberation processes.
    */
    export class BDIAgent extends QComponent {

        public goals: any;
        public plans: any;
        public data: any;
        public results: any[];
        public policySelector: Function;
        public beliefHistory: any[];
        public planHistory: any[];

        constructor(name: string, goals: any = [], plans = {}, data = [], policySelector = BDIAgent.stochasticSelection) {
            super(name);
            this.goals = goals;
            this.plans = plans;
            this.data = data;
            this.policySelector = policySelector;
            this.beliefHistory = [];
            this.planHistory = [];
        }

        /** Take one time step forward, take in beliefs, deliberate, implement policy
        * @param step size of time step (in days by convention)
        */
        update(agent: any, step: number) {
            var policy, intent, evaluation;
            policy = this.policySelector(this.plans, this.planHistory, agent);
            intent = this.plans[policy];
            intent(agent, step);
            evaluation = this.evaluateGoals(agent);
            this.planHistory.push({ time: this.time, id: agent.id, intention: policy, goals: evaluation.achievements, barriers: evaluation.barriers, r: evaluation.successes / this.goals.length });
        }

        evaluateGoals(agent:any) {
            let achievements = [], barriers = [], successes = 0, c, matcher;
            for (var i = 0; i < this.goals.length; i++) {
                c = this.goals[i].condition;
                if(typeof c.data === 'undefined' || c.data === "agent"){
                  c.data = agent; //if no datasource is set, use the agent
                }
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
            return { successes: successes, barriers: barriers, achievements: achievements }
        }
        //good for training
        public static stochasticSelection(plans, planHistory, agent) {
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

        public static lazyPolicySelection = function(plans, planHistory, agent) {
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
