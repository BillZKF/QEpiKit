var QEpiKit;
(function (QEpiKit) {
    var Environment = (function () {
        function Environment() {
            this.time = 0;
            this.geoNetwork = [];
        }
        Environment.prototype.add = function (component) {
            this.models.push(component);
        };
        Environment.prototype.remove = function (id) {
            var deleteIndex;
            this.models.forEach(function (c, index) { if (c.id === id) {
                deleteIndex = index;
            } });
            this.models.splice(deleteIndex, 1);
        };
        Environment.prototype.run = function (step, until, saveInterval) {
            while (this.time <= until) {
                var rem = (this.time / step) % saveInterval;
                if (rem === 0) {
                }
                this.time += step;
            }
        };
        Environment.prototype.update = function (step) {
            for (var component = 0; component < this.models.length; component++) {
                this.models[component].update(step);
            }
        };
        return Environment;
    })();
    QEpiKit.Environment = Environment;
    var Event = (function () {
        function Event(trigger) {
            this.trigger = trigger;
        }
        return Event;
    })();
    QEpiKit.Event = Event;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=environment.js.map