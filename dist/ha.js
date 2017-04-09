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
    var HybridAutomata = (function (_super) {
        __extends(HybridAutomata, _super);
        function HybridAutomata(name, data, flowSet, flowMap, jumpSet, jumpMap) {
            var _this = _super.call(this, name) || this;
            _this.data = data;
            _this.flowSet = flowSet;
            _this.flowMap = flowMap;
            _this.jumpSet = jumpSet;
            _this.jumpMap = jumpMap;
            return _this;
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
                        //no transition this direction;
                        //console.log(Err);
                    }
                }
                for (var key in this.flowMap) {
                    //second order integration
                    var tempD = this.flowMap[key][agent.currentMode](agent[key]);
                    temp[key] = agent[key] + tempD;
                    agent[key] += 0.5 * (tempD + this.flowMap[key][agent.currentMode](temp[key]));
                }
            }
        };
        return HybridAutomata;
    }(QEpiKit.QComponent));
    QEpiKit.HybridAutomata = HybridAutomata;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=ha.js.map