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
            this.transitions = transitions;
            this.conditions = conditions;
            this.data = data;
        }
        StateMachine.prototype.update = function (step) {
            for (var d = 0; d < this.data.length; d++) {
                this.states[this.data[d].current](step, this.data[d]);
                for (var i = 0; i < this.transitions.length; i++) {
                    if (this.transitions[i].from === this.data[d].current) {
                        var cond = this.conditions[this.transitions[i].name];
                        var r = cond.check(this.data[d][cond.key], cond.value);
                        if (r === StateMachine.SUCCESS) {
                            this.data[d].current = this.transitions[i].to;
                        }
                    }
                }
            }
            this.time += step;
        };
        StateMachine.prototype.assess = function (eventName) {
        };
        return StateMachine;
    })(QEpiKit.QComponent);
    QEpiKit.StateMachine = StateMachine;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=stateMachine.js.map