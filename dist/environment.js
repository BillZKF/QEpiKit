var QEpiKit;
(function (QEpiKit) {
    var Environment = (function () {
        function Environment(agents, resources, facilities, eventsQueue, randF) {
            if (randF === void 0) { randF = Math.random; }
            this.time = 0;
            this.timeOfDay = 0;
            this.models = [];
            this.history = [];
            this.agents = agents;
            this.resources = resources;
            this.facilities = facilities;
            this.eventsQueue = eventsQueue;
            this.randF = randF;
        }
        Environment.prototype.add = function (component) {
            var comID = this.models.length;
            component.data.forEach(function (d) {
                d.model = component.name;
                d.modelIndex = comID;
            });
            this.agents = this.agents.concat(component.data);
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
                this.update(step);
                var rem = (this.time % saveInterval);
                if (rem < step) {
                    var copy = JSON.parse(JSON.stringify(this.agents));
                    this.history = this.history.concat(copy);
                }
                this.time += step;
                this.formatTime();
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
            QEpiKit.Utils.shuffle(this.agents, this.randF);
            for (var a = 0; a < this.agents.length; a++) {
                this.models[this.agents[a].modelIndex].update(this.agents[a], step);
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