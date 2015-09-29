var QEpiKit;
(function (QEpiKit) {
    var Environment = (function () {
        function Environment(agents, resources, facilities, eventsQueue, randF) {
            if (randF === void 0) { randF = Math.random; }
            this.time = 0;
            this.timeOfDay = 0;
            this.models = [];
            this.observers = [];
            this.history = [];
            this.agents = agents;
            this.resources = resources;
            this.facilities = facilities;
            this.eventsQueue = eventsQueue;
            this.randF = randF;
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
                var rem = (this.time % saveInterval);
                if (rem < step) {
                    var copy = JSON.parse(JSON.stringify(this.agents));
                    this.history = this.history.concat(copy);
                }
                this.time += step;
                this.formatTime();
            }
            this.publish("finished");
        };
        Environment.prototype.publish = function (eventName) {
            for (var o = 0; o < this.observers.length; o++) {
                this.observers[o].assess(eventName);
            }
        };
        Environment.prototype.update = function (step) {
            var index = 0;
            while (index < this.eventsQueue.length && this.eventsQueue[index].at <= this.time) {
                this.eventsQueue[index].trigger();
                this.eventsQueue[index].triggered = true;
                if (this.eventsQueue[index].until <= this.time) {
                    this.eventsQueue.splice(index, 1);
                }
                index++;
            }
            for (var c = 0; c < this.models.length; c++) {
                QEpiKit.Utils.shuffle(this.agents, this.randF);
                this.models[c].update(step);
            }
        };
        Environment.prototype.formatTime = function () {
            this.timeOfDay = this.time % 1;
        };
        return Environment;
    })();
    QEpiKit.Environment = Environment;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=environment.js.map