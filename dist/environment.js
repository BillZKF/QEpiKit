var QEpiKit;
(function (QEpiKit) {
    var Environment = (function () {
        function Environment(resources, facilities, eventsQueue, activationType, randF) {
            if (eventsQueue === void 0) { eventsQueue = []; }
            if (activationType === void 0) { activationType = 'random'; }
            if (randF === void 0) { randF = Math.random; }
            this.time = 0;
            this.timeOfDay = 0;
            this.models = [];
            this.history = [];
            this.agents = [];
            this.resources = resources;
            this.facilities = facilities;
            this.eventsQueue = eventsQueue;
            this.activationType = activationType;
            this.randF = randF;
        }
        Environment.prototype.add = function (component) {
            this.models.push(component);
        };
        Environment.prototype.remove = function (id) {
            var deleteIndex, L = this.agents.length;
            this.models.forEach(function (c, index) { if (c.id === id) {
                deleteIndex = index;
            } });
            while (L > 0 && this.agents.length >= 0) {
                L--;
                if (this.agents[L].modelIndex === deleteIndex) {
                    this.agents.splice(L, 1);
                }
            }
            this.models.splice(deleteIndex, 1);
        };
        Environment.prototype.run = function (step, until, saveInterval) {
            for (var c = 0; c < this.models.length; c++) {
                for (var d = 0; d < this.models[c].data.length; d++) {
                    this.models[c].data[d].model = this.models[c].name;
                    this.models[c].data[d].modelIndex = c;
                }
                this.agents = this.agents.concat(this.models[c].data);
            }
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
            if (this.activationType === "random") {
                QEpiKit.Utils.shuffle(this.agents, this.randF);
                for (var a = 0; a < this.agents.length; a++) {
                    this.models[this.agents[a].modelIndex].update(this.agents[a], step);
                    this.agents[a].time += 0 || step;
                }
            }
            if (this.activationType === "parallel") {
                var tempAgents = JSON.parse(JSON.stringify(this.agents));
                for (var i = 0; i < tempAgents.length; i++) {
                    this.models[tempAgents[i].modelIndex].update(tempAgents[i], step);
                }
                for (var a = 0; a < this.agents.length; a++) {
                    this.agents[a] = this.models[this.agents[a].modelIndex].apply(this.agents[a], tempAgents[a], step);
                }
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