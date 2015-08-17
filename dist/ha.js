var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var QEpiKit;
(function (QEpiKit) {
    var HybridAutomata = (function (_super) {
        __extends(HybridAutomata, _super);
        function HybridAutomata(name, data, flowSet, flowMap, jumpSet, jumpMap) {
            _super.call(this, name);
            this.data = data;
            this.flowSet = flowSet;
            this.flowMap = flowMap;
            this.jumpSet = jumpSet;
            this.jumpMap = jumpMap;
        }
        HybridAutomata.prototype.update = function (step) {
            for (var i = 0; i < this.data.length; i++) {
                var agent = this.data[i];
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
                            console.log(Err);
                        }
                    }
                    for (var key in this.flowMap) {
                        temp[key] = this.flowMap[key][agent.currentMode](agent);
                        agent[key] = 0.5 * (temp[key] + this.flowMap[key][agent.currentMode](temp));
                    }
                }
            }
            this.time += step;
        };
        HybridAutomata.prototype.run = function (step, until, saveInterval) {
            this.time = 0;
            while (this.time <= until) {
                this.update(step);
                var rem = (this.time / step) % saveInterval;
                if (rem == 0) {
                    this.history.push(JSON.parse(JSON.stringify(this.data)));
                }
            }
        };
        HybridAutomata.prototype.assess = function () {
        };
        return HybridAutomata;
    })(QEpiKit.QComponent);
    QEpiKit.HybridAutomata = HybridAutomata;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=ha.js.map