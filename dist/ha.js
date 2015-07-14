var QEpiKit;
(function (QEpiKit) {
    var HybridAutomata = (function () {
        function HybridAutomata(flowSet, flowMap, jumpSet, jumpMap) {
            this.flowSet = flowSet;
            this.flowMap = flowMap;
            this.jumpSet = jumpSet;
            this.jumpMap = jumpMap;
        }
        HybridAutomata.prototype.update = function (agent, step) {
            var temp = JSON.parse(JSON.stringify(agent));
            for (var mode in this.jumpSet) {
                var edge = this.jumpSet[mode];
                var edgeState = edge.check(agent[edge.key], edge.value);
                if (edgeState === QEpiKit.Utils.SUCCESS && mode != agent.currentMode) {
                    try {
                        agent[edge.key] = this.jumpMap[edge.key][agent.currentMode][mode](agent[edge.key]);
                        agent.currentMode = mode;
                    }
                    catch (Err) {
                    }
                }
                for (var key in this.flowMap) {
                    temp[key] = this.flowMap[key][agent.currentMode](agent);
                    agent[key] = 0.5 * (temp[key] + this.flowMap[key][agent.currentMode](temp));
                }
            }
        };
        return HybridAutomata;
    })();
    QEpiKit.HybridAutomata = HybridAutomata;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=ha.js.map