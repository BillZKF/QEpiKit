var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var QEpiKit;
(function (QEpiKit) {
    var StateMachine = (function (_super) {
        __extends(StateMachine, _super);
        function StateMachine(name, states, transitions, conditions, data) {
            _super.call(this, name);
            this.states = states;
            this.transitions = this.checkTransitions(transitions);
            this.conditions = conditions;
            this.data = data;
        }
        StateMachine.prototype.update = function (agent, step) {
            for (var s in agent.states) {
                var state = agent.states[s];
                this.states[state](step, agent);
                for (var i = 0; i < this.transitions.length; i++) {
                    for (var j = 0; j < this.transitions[i].from.length; j++) {
                        var trans = this.transitions[i].from[j];
                        if (trans === agent.states[s]) {
                            var cond = this.conditions[this.transitions[i].name];
                            var value = void 0;
                            if (typeof (cond.value) === 'function') {
                                value = cond.value();
                            }
                            else {
                                value = cond.value;
                            }
                            var r = cond.check(agent[cond.key], value);
                            if (r === StateMachine.SUCCESS) {
                                agent.states[s] = this.transitions[i].to;
                            }
                        }
                    }
                }
            }
        };
        StateMachine.prototype.checkTransitions = function (transitions) {
            for (var t = 0; t < transitions.length; t++) {
                if (typeof transitions[t].from === 'string') {
                    transitions[t].from = [transitions[t].from];
                }
                else {
                    return;
                }
            }
            return transitions;
        };
        return StateMachine;
    })(QEpiKit.QComponent);
    QEpiKit.StateMachine = StateMachine;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=stateMachine.js.map