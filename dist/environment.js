var QEpiKit;
(function (QEpiKit) {
    var Environment = (function () {
        function Environment(agents, resources, eventsQueue) {
            this.time = 0;
            this.geoNetwork = [];
            this.models = [];
            this.observers = [];
            this.history = [];
            this.agents = agents;
            this.resources = resources;
            this.eventsQueue = eventsQueue;
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
        Environment.prototype.addObserver = function (observer) {
            this.observers.push(observer);
        };
        Environment.prototype.removeObserver = function (id) {
            var deleteIndex;
            this.observers.forEach(function (c, index) { if (c.id === id) {
                deleteIndex = index;
            } });
            this.observers.splice(deleteIndex, 1);
        };
        Environment.prototype.run = function (step, until, saveInterval) {
            while (this.time <= until) {
                this.update(step);
                var rem = (this.time / step) % saveInterval;
                if (rem === 0) {
                    this.history.push(JSON.parse(JSON.stringify(this.resources)));
                }
                this.time += step;
            }
            this.publish("finished", this.agents, this.resources);
        };
        Environment.prototype.publish = function (eventName, agents, resources) {
            for (var o = 0; o < this.observers.length; o++) {
                this.observers[o].assess(eventName, this.agents, this.resources);
            }
        };
        Environment.prototype.update = function (step) {
            var eKey = this.time.toString();
            if (this.eventsQueue.hasOwnProperty(eKey)) {
                this.eventsQueue[eKey].trigger(this.agents);
                this.eventsQueue[eKey].triggered = true;
            }
            else {
                this.eventsQueue[eKey] = null;
            }
            for (var c = 0; c < this.models.length; c++) {
                this.models[c].update(step);
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