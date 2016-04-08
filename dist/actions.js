"use strict";
var QEpiKit;
(function (QEpiKit) {
    var Actions = (function () {
        function Actions() {
        }
        Actions.move = function (step, agent) {
            var x = random.real(-1, 1) * agent.distMovePerDay + (agent.prevX * 0.98);
            var y = random.real(-1, 1) * agent.distMovePerDay + (agent.prevY * 0.98);
            agent.mesh.position.y += x * step;
            agent.mesh.position.x += y * step;
            agent.mesh.rotation.z = Math.atan2(x * step, y * step);
            agent.prevX = x;
            agent.prevY = y;
        };
        return Actions;
    }());
    QEpiKit.Actions = Actions;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=actions.js.map