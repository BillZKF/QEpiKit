var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var QEpiKit;
(function (QEpiKit) {
    /**
    * Belief Desire Intent agents are simple planning agents with modular plans / deliberation processes.
    */
    var BDIAgent = (function (_super) {
        __extends(BDIAgent, _super);
        function BDIAgent(name, goals, plans, data, policySelector) {
            if (goals === void 0) { goals = []; }
            if (plans === void 0) { plans = {}; }
            if (data === void 0) { data = []; }
            if (policySelector === void 0) { policySelector = BDIAgent.stochasticSelection; }
            var _this = _super.call(this, name) || this;
            _this.goals = goals;
            _this.plans = plans;
            _this.data = data;
            _this.policySelector = policySelector;
            _this.beliefHistory = [];
            _this.planHistory = [];
            return _this;
        }
        /** Take one time step forward, take in beliefs, deliberate, implement policy
        * @param step size of time step (in days by convention)
        */
        BDIAgent.prototype.update = function (agent, step) {
            var policy, intent, evaluation;
            policy = this.policySelector(this.plans, this.planHistory, agent);
            intent = this.plans[policy];
            intent(agent, step);
            evaluation = this.evaluateGoals(agent);
            this.planHistory.push({ time: this.time, id: agent.id, intention: policy, goals: evaluation.achievements, barriers: evaluation.barriers, r: evaluation.successes / this.goals.length });
        };
        BDIAgent.prototype.evaluateGoals = function (agent) {
            var achievements = [], barriers = [], successes = 0, c, matcher;
            for (var i = 0; i < this.goals.length; i++) {
                c = this.goals[i].condition;
                if (typeof c.data === 'undefined' || c.data === "agent") {
                    c.data = agent; //if no datasource is set, use the agent
                }
                achievements[i] = this.goals[i].temporal(c.check(c.data[c.key], c.value));
                if (achievements[i] === BDIAgent.SUCCESS) {
                    successes += 1;
                }
                else {
                    matcher = QEpiKit.Utils.getMatcherString(c.check);
                    barriers.push({
                        label: c.label,
                        key: c.key,
                        check: matcher,
                        actual: c.data[c.key],
                        expected: c.value
                    });
                }
            }
            return { successes: successes, barriers: barriers, achievements: achievements };
        };
        //good for training
        BDIAgent.stochasticSelection = function (plans, planHistory, agent) {
            var policy, score, max = 0;
            for (var plan in plans) {
                score = Math.random();
                if (score >= max) {
                    max = score;
                    policy = plan;
                }
            }
            return policy;
        };
        return BDIAgent;
    }(QEpiKit.QComponent));
    BDIAgent.lazyPolicySelection = function (plans, planHistory, agent) {
        var options, selection;
        if (this.time > 0) {
            options = Object.keys(plans);
            options = options.slice(1, options.length);
            selection = Math.floor(Math.random() * options.length);
        }
        else {
            options = Object.keys(plans);
            selection = 0;
        }
        return options[selection];
    };
    QEpiKit.BDIAgent = BDIAgent;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=bdi.js.map