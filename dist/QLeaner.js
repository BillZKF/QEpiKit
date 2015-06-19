var QEpiKit;
(function (QEpiKit) {
    var QLearner = (function () {
        function QLearner(R, gamma) {
            this.R = R || [];
            this.Q = [];
            this.gamma = gamma;
        }
        QLearner.prototype.update = function () {
        };
        QLearner.prototype.add = function (state, action) {
            this.Q[state][action];
        };
        return QLearner;
    })();
    QEpiKit.QLearner = QLearner;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=QLeaner.js.map