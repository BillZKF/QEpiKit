/**
*The QEpi main module and namespace.
*@preferred
*/
var QEpiKit;
(function (QEpiKit) {
    /**
    *Environments are the executable environment containing the model components,
    *shared resources, and scheduler.
    */
    var Environment = (function () {
        function Environment(resources, facilities, eventsQueue, activationType, randF) {
            if (resources === void 0) { resources = []; }
            if (facilities === void 0) { facilities = []; }
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
            this._agentIndex = {};
        }
        /** Add a model components from the environment
        * @param component the model component object to be added to the environment.
        */
        Environment.prototype.add = function (component) {
            this.models.push(component);
        };
        /** Remove a model components from the environment by id
        * @param id UUID of the component to be removed.
        */
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
        /** Run all environment model components from t=0 until t=until using time step = step
        * @param step the step size
        * @param until the end time
        * @param saveInterval save every 'x' steps
        */
        Environment.prototype.run = function (step, until, saveInterval) {
            this.init();
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
        /** Assign all agents to appropriate models
        */
        Environment.prototype.init = function () {
            this._agentIndex = {};
            var _loop_1 = function (c) {
                var alreadyIn = [];
                //assign each agent model indexes to handle agents assigned to multiple models
                for (var d = 0; d < this_1.models[c].data.length; d++) {
                    var id = this_1.models[c].data[d].id;
                    if (id in this_1._agentIndex) {
                        //this agent belongs to multiple models.
                        this_1.models[c].data[d].models.push(this_1.models[c].name);
                        this_1.models[c].data[d].modelIndexes.push(c);
                        alreadyIn.push(id);
                    }
                    else {
                        //this agent belongs to only one model so far.
                        this_1._agentIndex[id] = 0;
                        this_1.models[c].data[d].models = [this_1.models[c].name];
                        this_1.models[c].data[d].modelIndexes = [c];
                    }
                }
                //eliminate any duplicate agents by id
                this_1.models[c].data = this_1.models[c].data.filter(function (d) {
                    if (alreadyIn.indexOf(d.id) !== -1) {
                        return false;
                    }
                    return true;
                });
                //concat the results
                this_1.agents = this_1.agents.concat(this_1.models[c].data);
            };
            var this_1 = this;
            for (var c = 0; c < this.models.length; c++) {
                _loop_1(c);
            }
        };
        /** Update each model compenent one time step forward
        * @param step the step size
        */
        Environment.prototype.update = function (step) {
            var _this = this;
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
                this.agents.forEach(function (agent, i) { _this._agentIndex[agent.id] = i; }); // reassign agent
                this.agents.forEach(function (agent, i) {
                    agent.modelIndexes.forEach(function (modelIndex) {
                        _this.models[modelIndex].update(agent, step);
                    });
                    agent.time = agent.time + step || 0;
                });
            }
            if (this.activationType === "parallel") {
                var tempAgents_1 = JSON.parse(JSON.stringify(this.agents));
                tempAgents_1.forEach(function (agent) {
                    agent.modelIndexes.forEach(function (modelIndex) {
                        _this.models[modelIndex].update(agent, step);
                    });
                });
                this.agents.forEach(function (agent, i) {
                    agent.modelIndexes.forEach(function (modelIndex) {
                        _this.models[modelIndex].apply(agent, tempAgents_1[i], step);
                    });
                    agent.time = agent.time + step || 0;
                });
            }
        };
        /** Format a time of day. Current time % 1.
        *
        */
        Environment.prototype.formatTime = function () {
            this.timeOfDay = this.time % 1;
        };
        /** Gets agent by id. A utility function that
        *
        */
        Environment.prototype.getAgentById = function (id) {
            return this.agents[this._agentIndex[id]];
        };
        return Environment;
    }());
    QEpiKit.Environment = Environment;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=environment.js.map