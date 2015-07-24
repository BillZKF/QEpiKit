var QEpiKit;
(function (QEpiKit) {
    var BDIAgent = (function () {
        function BDIAgent(name, goals, plans, data, policySelector) {
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
        BDIAgent.prototype.update = function (step, events) {
            try {
                events[this.time](this.data);
            }
            catch (e) {
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
        };
        BDIAgent.prototype.generateTimeData = function (step, limit, recordInt, events) {
            while (this.time <= limit) {
                this.update(step, events);
                var rem = this.time % recordInt;
                if (rem === 0) {
                    this.beliefHistory.push(JSON.parse(JSON.stringify(this.data)));
                }
            }
        };
        BDIAgent.stochasticSelection = function (plans, planHistory) {
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
        BDIAgent.SUCCESS = 1;
        BDIAgent.FAILED = 2;
        BDIAgent.RUNNING = 3;
        return BDIAgent;
    })();
    QEpiKit.BDIAgent = BDIAgent;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=bdi.js.map