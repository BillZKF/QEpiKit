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
        StateMachine.prototype.update = function (step) {
            for (var d = 0; d < this.data.length; d++) {
                for (var s in this.data[d].states) {
                    var state = this.data[d].states[s];
                    this.states[state](step, this.data[d]);
                    for (var i = 0; i < this.transitions.length; i++) {
                        for (var j = 0; j < this.transitions[i].from.length; j++) {
                            var trans = this.transitions[i].from[j];
                            if (trans === this.data[d].states[s]) {
                                var cond = this.conditions[this.transitions[i].name];
                                var value = void 0;
                                if (typeof (cond.value) === 'function') {
                                    value = cond.value();
                                }
                                else {
                                    value = cond.value;
                                }
                                var r = cond.check(this.data[d][cond.key], value);
                                if (r === StateMachine.SUCCESS) {
                                    this.data[d].states[s] = this.transitions[i].to;
                                }
                            }
                        }
                    }
                }
                this.data[d].time += step;
            }
            this.time += step;
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