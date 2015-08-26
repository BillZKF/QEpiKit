var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var QEpiKit;
(function (QEpiKit) {
    var USys = (function (_super) {
        __extends(USys, _super);
        function USys(name, options, data) {
            _super.call(this, name);
            this.options = options;
            this.results = [];
            this.data = data;
        }
        USys.prototype.update = function (step) {
            var tmp = [], max = [], avg, top;
            var dataLen = this.data.length;
            for (var d = 0; d < dataLen; d++) {
                max[d] = 0;
                for (var i = 0; i < this.options.length; i++) {
                    tmp[i] = 0;
                    for (var j = 0; j < this.options[i].considerations.length; j++) {
                        var c = this.options[i].considerations[j];
                        var x = c.x(this.data[d], this.options[i].params);
                        tmp[i] += c.f(x, c.m, c.b, c.k);
                    }
                    avg = tmp[i] / this.options[i].considerations.length;
                    this.results.push({ point: d, opt: this.options[i].name, result: avg });
                    if (avg > max[d]) {
                        this.data[d].top = { name: this.options[i].name, util: avg };
                        top = i;
                        max[d] = avg;
                    }
                }
                this.options[top].action(this.data[d]);
            }
            this.time += step;
        };
        USys.prototype.assess = function (eventName) {
        };
        return USys;
    })(QEpiKit.QComponent);
    QEpiKit.USys = USys;
    function logistic(x, m, b, k) {
        var y = 1 / (m + Math.exp(-k * (x - b)));
        return y;
    }
    QEpiKit.logistic = logistic;
    function logit(x, m, b, k) {
        var y = 1 / Math.log(x / (1 - x));
        return y;
    }
    QEpiKit.logit = logit;
    function linear(x, m, b, k) {
        var y = m * x + b;
        return y;
    }
    QEpiKit.linear = linear;
    function exponential(x, m, b, k) {
        var y = 1 - (Math.pow(x, k) / Math.pow(1, k));
        return y;
    }
    QEpiKit.exponential = exponential;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=USys.js.map