var QEpiKit;
(function (QEpiKit) {
    var QLearner = (function () {
        //TODO - change episode to update
        function QLearner(R, gamma, goal) {
            this.rawMax = 1;
            this.R = R;
            this.gamma = gamma;
            this.goal = goal;
            this.Q = {};
            for (var state in R) {
                this.Q[state] = {};
                for (var action in R[state]) {
                    this.Q[state][action] = 0;
                }
            }
            this.gamma = gamma;
        }
        QLearner.prototype.grow = function (state, actions) {
            for (var i = 0; i < actions.length; i++) {
                //reward is currently unknown
                this.R[state][actions[i]] = null;
            }
        };
        QLearner.prototype.explore = function (prom) {
        };
        QLearner.prototype.transition = function (state, action) {
            //is the state unexamined
            var examined = true;
            var bestAction;
            for (action in this.R[state]) {
                if (this.R[state][action] === null) {
                    bestAction = action;
                    examined = false;
                }
            }
            bestAction = this.max(action);
            this.Q[state][action] = this.R[state][action] + (this.gamma * this.Q[action][bestAction]);
        };
        QLearner.prototype.max = function (state) {
            var max = 0, maxAction = null;
            for (var action in this.Q[state]) {
                if (!maxAction) {
                    max = this.Q[state][action];
                    maxAction = action;
                }
                else if (this.Q[state][action] === max && (Math.random() > 0.5)) {
                    max = this.Q[state][action];
                    maxAction = action;
                }
                else if (this.Q[state][action] > max) {
                    max = this.Q[state][action];
                    maxAction = action;
                }
            }
            return maxAction;
        };
        QLearner.prototype.possible = function (state) {
            var possible = [];
            for (var action in this.R[state]) {
                if (this.R[state][action] > -1) {
                    possible.push(action);
                }
            }
            return possible[Math.floor(Math.random() * possible.length)];
        };
        QLearner.prototype.episode = function (state) {
            this.transition(state, this.possible(state));
            return this.Q;
        };
        QLearner.prototype.normalize = function () {
            for (var state in this.Q) {
                for (var action in this.Q[state]) {
                    if (this.Q[action][state] >= this.rawMax) {
                        this.rawMax = this.Q[action][state];
                    }
                }
            }
            for (var state in this.Q) {
                for (var action in this.Q[state]) {
                    this.Q[action][state] = Math.round(this.Q[action][state] / this.rawMax * 100);
                }
            }
        };
        return QLearner;
    }());
    QEpiKit.QLearner = QLearner;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=QLearner.js.map