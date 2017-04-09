var QEpiKit;
(function (QEpiKit) {
    /**
    *QComponents are the base class for many model components.
    */
    var QComponent = (function () {
        function QComponent(name) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.time = 0;
            this.history = [];
        }
        /** Take one time step forward (most subclasses override the base method)
        * @param step size of time step (in days by convention)
        */
        QComponent.prototype.update = function (agent, step) {
            //something super!
        };
        return QComponent;
    }());
    QComponent.SUCCESS = 1;
    QComponent.FAILED = 2;
    QComponent.RUNNING = 3;
    QEpiKit.QComponent = QComponent;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=QComponent.js.map
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
    /**
    * Belief Desire Intent agents are simple planning agents with modular plans / deliberation processes.
    */
    var BDIAgent = (function (_super) {
        __extends(BDIAgent, _super);
        function BDIAgent(name, goals, plans, data, policySelector) {
            if (goals === void 0) { goals = []; }
            if (plans === void 0) { plans = {}; }
            if (data === void 0) { data = []; }
            if (policySelector === void 0) { policySelector = BDIAgent.stochasticSelection; }
            var _this = _super.call(this, name) || this;
            _this.goals = goals;
            _this.plans = plans;
            _this.data = data;
            _this.policySelector = policySelector;
            _this.beliefHistory = [];
            _this.planHistory = [];
            return _this;
        }
        /** Take one time step forward, take in beliefs, deliberate, implement policy
        * @param step size of time step (in days by convention)
        */
        BDIAgent.prototype.update = function (agent, step) {
            var policy, intent, evaluation;
            policy = this.policySelector(this.plans, this.planHistory, agent);
            intent = this.plans[policy];
            intent(agent, step);
            evaluation = this.evaluateGoals(agent);
            this.planHistory.push({ time: this.time, id: agent.id, intention: policy, goals: evaluation.achievements, barriers: evaluation.barriers, r: evaluation.successes / this.goals.length });
        };
        BDIAgent.prototype.evaluateGoals = function (agent) {
            var achievements = [], barriers = [], successes = 0, c, matcher;
            for (var i = 0; i < this.goals.length; i++) {
                c = this.goals[i].condition;
                if (typeof c.data === 'undefined' || c.data === "agent") {
                    c.data = agent; //if no datasource is set, use the agent
                }
                achievements[i] = this.goals[i].temporal(c.check(c.data[c.key], c.value));
                if (achievements[i] === BDIAgent.SUCCESS) {
                    successes += 1;
                }
                else {
                    matcher = QEpiKit.Utils.getMatcherString(c.check);
                    barriers.push({
                        label: c.label,
                        key: c.key,
                        check: matcher,
                        actual: c.data[c.key],
                        expected: c.value
                    });
                }
            }
            return { successes: successes, barriers: barriers, achievements: achievements };
        };
        //good for training
        BDIAgent.stochasticSelection = function (plans, planHistory, agent) {
            var policy, score, max = 0;
            for (var plan in plans) {
                score = Math.random();
                if (score >= max) {
                    max = score;
                    policy = plan;
                }
            }
            return policy;
        };
        return BDIAgent;
    }(QEpiKit.QComponent));
    BDIAgent.lazyPolicySelection = function (plans, planHistory, agent) {
        var options, selection;
        if (this.time > 0) {
            options = Object.keys(plans);
            options = options.slice(1, options.length);
            selection = Math.floor(Math.random() * options.length);
        }
        else {
            options = Object.keys(plans);
            selection = 0;
        }
        return options[selection];
    };
    QEpiKit.BDIAgent = BDIAgent;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=bdi.js.map
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
    /**
    * Behavior Tree
    **/
    var BehaviorTree = (function (_super) {
        __extends(BehaviorTree, _super);
        function BehaviorTree(name, root, data) {
            var _this = _super.call(this, name) || this;
            _this.root = root;
            _this.data = data;
            _this.results = [];
            return _this;
        }
        BehaviorTree.tick = function (node, agent) {
            var state = node.operate(agent);
            return state;
        };
        BehaviorTree.prototype.update = function (agent, step) {
            var state;
            agent.active = true;
            while (agent.active === true) {
                state = BehaviorTree.tick(this.root, agent);
                agent.time = this.time;
                agent.active = false;
            }
            return state;
        };
        return BehaviorTree;
    }(QEpiKit.QComponent));
    QEpiKit.BehaviorTree = BehaviorTree;
    var BTNode = (function () {
        function BTNode(name) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
        }
        return BTNode;
    }());
    QEpiKit.BTNode = BTNode;
    var BTControlNode = (function (_super) {
        __extends(BTControlNode, _super);
        function BTControlNode(name, children) {
            var _this = _super.call(this, name) || this;
            _this.children = children;
            return _this;
        }
        return BTControlNode;
    }(BTNode));
    QEpiKit.BTControlNode = BTControlNode;
    var BTRoot = (function (_super) {
        __extends(BTRoot, _super);
        function BTRoot(name, children) {
            var _this = _super.call(this, name, children) || this;
            _this.type = "root";
            _this.operate = function (agent) {
                var state = BehaviorTree.tick(this.children[0], agent);
                return state;
            };
            return _this;
        }
        return BTRoot;
    }(BTControlNode));
    QEpiKit.BTRoot = BTRoot;
    var BTSelector = (function (_super) {
        __extends(BTSelector, _super);
        function BTSelector(name, children) {
            var _this = _super.call(this, name, children) || this;
            _this.type = "selector";
            _this.operate = function (agent) {
                var childState;
                for (var child in this.children) {
                    childState = BehaviorTree.tick(this.children[child], agent);
                    if (childState === BehaviorTree.RUNNING) {
                        return BehaviorTree.RUNNING;
                    }
                    if (childState === BehaviorTree.SUCCESS) {
                        return BehaviorTree.SUCCESS;
                    }
                }
                return BehaviorTree.FAILED;
            };
            return _this;
        }
        return BTSelector;
    }(BTControlNode));
    QEpiKit.BTSelector = BTSelector;
    var BTSequence = (function (_super) {
        __extends(BTSequence, _super);
        function BTSequence(name, children) {
            var _this = _super.call(this, name, children) || this;
            _this.type = "sequence";
            _this.operate = function (agent) {
                var childState;
                for (var child in this.children) {
                    childState = BehaviorTree.tick(this.children[child], agent);
                    if (childState === BehaviorTree.RUNNING) {
                        return BehaviorTree.RUNNING;
                    }
                    if (childState === BehaviorTree.FAILED) {
                        return BehaviorTree.FAILED;
                    }
                }
                return BehaviorTree.SUCCESS;
            };
            return _this;
        }
        return BTSequence;
    }(BTControlNode));
    QEpiKit.BTSequence = BTSequence;
    var BTParallel = (function (_super) {
        __extends(BTParallel, _super);
        function BTParallel(name, children, successes) {
            var _this = _super.call(this, name, children) || this;
            _this.type = "parallel";
            _this.successes = successes;
            _this.operate = function (agent) {
                var succeeded = [], failures = [], childState, majority;
                for (var child in this.children) {
                    childState = BehaviorTree.tick(this.children[child], agent);
                    if (childState === BehaviorTree.SUCCESS) {
                        succeeded.push(childState);
                    }
                    else if (childState === BehaviorTree.FAILED) {
                        failures.push(childState);
                    }
                    else if (childState === BehaviorTree.RUNNING) {
                        return BehaviorTree.RUNNING;
                    }
                }
                if (succeeded.length >= this.successes) {
                    return BehaviorTree.SUCCESS;
                }
                else {
                    return BehaviorTree.FAILED;
                }
            };
            return _this;
        }
        return BTParallel;
    }(BTControlNode));
    QEpiKit.BTParallel = BTParallel;
    var BTCondition = (function (_super) {
        __extends(BTCondition, _super);
        function BTCondition(name, condition) {
            var _this = _super.call(this, name) || this;
            _this.type = "condition";
            _this.condition = condition;
            _this.operate = function (agent) {
                var state;
                state = condition.check(agent[condition.key], condition.value);
                return state;
            };
            return _this;
        }
        return BTCondition;
    }(BTNode));
    QEpiKit.BTCondition = BTCondition;
    var BTAction = (function (_super) {
        __extends(BTAction, _super);
        function BTAction(name, condition, action) {
            var _this = _super.call(this, name) || this;
            _this.type = "action";
            _this.condition = condition;
            _this.action = action;
            _this.operate = function (agent) {
                var state;
                state = condition.check(agent[condition.key], condition.value);
                if (state === BehaviorTree.SUCCESS) {
                    this.action(agent);
                }
                return state;
            };
            return _this;
        }
        return BTAction;
    }(BTNode));
    QEpiKit.BTAction = BTAction;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=behaviorTree.js.map
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
    var CompartmentModel = (function (_super) {
        __extends(CompartmentModel, _super);
        function CompartmentModel(name, data) {
            var _this = _super.call(this, name) || this;
            _this.data = data; //an array of Patches. Each patch contains an array of compartments in operational order
            _this.totalPop = 0;
            _this.history = [];
            for (var d = 0; d < _this.data.length; d++) {
                _this.totalPop += _this.data[d].totalPop;
            }
            _this._tolerance = 1e-9; //model err tolerance
            return _this;
        }
        CompartmentModel.prototype.update = function (patch, step) {
            var temp_pop = [], temp_d = [], next_d = [], lte = [], err = 1, newStep;
            var compartments = patch.compartments;
            for (var c = 0; c < compartments.length; c++) {
                compartments[c].dpop = compartments[c].operation(step);
            }
            //first order (Euler)
            for (var c = 0; c < compartments.length; c++) {
                temp_pop[c] = compartments[c].pop;
                temp_d[c] = compartments[c].dpop;
                compartments[c].pop = temp_pop[c] + temp_d[c];
            }
            //second order (Heuns)
            patch.totalPop = 0;
            for (var c = 0; c < compartments.length; c++) {
                next_d[c] = compartments[c].operation(step);
                compartments[c].pop = temp_pop[c] + (0.5 * (temp_d[c] + next_d[c]));
                patch.totalPop += compartments[c].pop;
            }
        };
        return CompartmentModel;
    }(QEpiKit.QComponent));
    QEpiKit.CompartmentModel = CompartmentModel;
    var Compartment = (function () {
        function Compartment(name, pop, operation) {
            this.name = name;
            this.pop = pop;
            this.operation = operation || null;
            this.dpop = 0;
        }
        return Compartment;
    }());
    QEpiKit.Compartment = Compartment;
    var Patch = (function () {
        function Patch(name, compartments) {
            this.id = Patch.newId();
            this.name = name;
            this.compartments = compartments;
            this.totalPop = 0;
            for (var c = 0; c < this.compartments.length; c++) {
                this.totalPop += this.compartments[c].pop;
                this.compartments[c].initialPop = this.compartments[c].pop;
            }
        }
        Patch.newId = function () {
            Patch.cId++;
            return Patch.cId;
        };
        return Patch;
    }());
    Patch.cId = 0;
    QEpiKit.Patch = Patch;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=compartment.js.map
var QEpiKit;
(function (QEpiKit) {
    var ContactPatch = (function () {
        function ContactPatch(name, capacity) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.capacity = capacity;
            this.pop = 0;
            this.members = {};
        }
        ContactPatch.defaultFreqF = function (a, b) {
            var val = (50 - Math.abs(a.age - b.age)) / 100;
            return val;
        };
        ContactPatch.defaultContactF = function (a, time) {
            var c = 2 * Math.sin(time) + a;
            if (c >= 1) {
                return true;
            }
            else {
                return false;
            }
        };
        ContactPatch.prototype.assign = function (agent, contactValueFunc) {
            var contactValue;
            contactValueFunc = contactValueFunc || ContactPatch.defaultFreqF;
            if (this.pop < this.capacity) {
                this.members[agent.id] = { properties: agent };
                for (var other in this.members) {
                    other = Number(other);
                    if (other !== agent.id && !isNaN(other)) {
                        contactValue = contactValueFunc(this.members[other].properties, agent);
                        this.members[agent.id][other] = contactValue;
                        this.members[other][agent.id] = contactValue;
                    }
                }
                this.pop++;
                return this.id;
            }
            else {
                return null;
            }
        };
        ContactPatch.prototype.encounters = function (agent, precondition, contactFunc, resultKey, save) {
            if (save === void 0) { save = false; }
            contactFunc = contactFunc || ContactPatch.defaultContactF;
            var contactVal;
            for (var contact in this.members) {
                if (precondition.key === 'states') {
                    contactVal = JSON.stringify(this.members[contact].properties[precondition.key]);
                }
                else {
                    contactVal = this.members[contact].properties[precondition.key];
                }
                if (precondition.check(this.members[contact].properties[precondition.key], precondition.value) && Number(contact) !== agent.id) {
                    var oldVal = this.members[contact].properties[resultKey];
                    var newVal = contactFunc(this.members[contact], agent);
                    if (oldVal !== newVal && save === true) {
                        this.members[contact].properties[resultKey] = newVal;
                        ContactPatch.WIWArray.push({
                            patchID: this.id,
                            name: this.name,
                            infected: contact,
                            infectedAge: this.members[contact].properties.age,
                            result: this.members[contact].properties[resultKey],
                            resultKey: resultKey,
                            by: agent.id,
                            byAge: agent.age,
                            time: agent.time
                        });
                    }
                }
            }
        };
        return ContactPatch;
    }());
    ContactPatch.WIWArray = [];
    QEpiKit.ContactPatch = ContactPatch;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=contactPatch.js.map
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
var QEpiKit;
(function (QEpiKit) {
    var Epi = (function () {
        function Epi() {
        }
        Epi.prevalence = function (cases, total) {
            var prev = cases / total;
            return prev;
        };
        Epi.riskDifference = function (table) {
            var rd = table.a / (table.a + table.b) - table.c / (table.c + table.d);
            return rd;
        };
        Epi.riskRatio = function (table) {
            var rratio = (table.a / (table.a + table.b)) / (table.c / (table.c + table.d));
            return rratio;
        };
        Epi.oddsRatio = function (table) {
            var or = (table.a * table.d) / (table.b * table.c);
            return or;
        };
        Epi.IPF2D = function (rowTotals, colTotals, iterations, seeds) {
            var rT = 0, cT = 0, seedCells = seeds;
            rowTotals.forEach(function (r, i) {
                rT += r;
                seedCells[i] = seedCells[i] || [];
            });
            colTotals.forEach(function (c, j) {
                cT += c;
                seedCells.forEach(function (row, k) {
                    seedCells[k][j] = seedCells[k][j] || Math.round(rowTotals[k] / rowTotals.length + (colTotals[j] / colTotals.length) / 2 * Math.random());
                });
            });
            if (rT === cT) {
                for (var iter = 0; iter < iterations; iter++) {
                    seedCells.forEach(function (row, ii) {
                        var currentRowTotal = 0;
                        row.forEach(function (cell, j) {
                            currentRowTotal += cell;
                        });
                        row.forEach(function (cell, jj) {
                            seedCells[ii][jj] = cell / currentRowTotal;
                            seedCells[ii][jj] *= rowTotals[ii];
                        });
                    });
                    for (var col = 0; col < colTotals.length; col++) {
                        var currentColTotal = 0;
                        seedCells.forEach(function (r, k) {
                            currentColTotal += r[col];
                        });
                        seedCells.forEach(function (row, kk) {
                            seedCells[kk][col] = row[col] / currentColTotal;
                            seedCells[kk][col] *= colTotals[col];
                        });
                    }
                }
                return seedCells;
            }
        };
        return Epi;
    }());
    QEpiKit.Epi = Epi;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=epi.js.map
var QEpiKit;
(function (QEpiKit) {
    /** Events class includes methods for organizing events.
    *
    */
    var Events = (function () {
        function Events(events) {
            if (events === void 0) { events = []; }
            this.queue = [];
            this.schedule(events);
        }
        /**
        * schedule an event with the same trigger multiple times.
        * @param qevent is the event to be scheduled. The at parameter should contain the time at first instance.
        * @param every interval for each occurnce
        * @param end until
        */
        Events.prototype.scheduleRecurring = function (qevent, every, end) {
            var recur = [];
            var duration = end - qevent.at;
            var occurences = Math.floor(duration / every);
            if (!qevent.until) {
                qevent.until = qevent.at;
            }
            for (var i = 0; i <= occurences; i++) {
                recur.push({ name: qevent.name + i, at: qevent.at + (i * every), until: qevent.until + (i * every), trigger: qevent.trigger, triggered: false });
            }
            this.schedule(recur);
        };
        /*
        * schedule a one time events. this arranges the event queue in chronological order.
        * @param qevents an array of events to be schedules.
        */
        Events.prototype.schedule = function (qevents) {
            qevents.forEach(function (d) {
                d.until = d.until || d.at;
            });
            this.queue = this.queue.concat(qevents);
            this.queue = this.organize(this.queue, 0, this.queue.length);
        };
        Events.prototype.partition = function (array, left, right) {
            var cmp = array[right - 1].at, minEnd = left, maxEnd;
            for (maxEnd = left; maxEnd < right - 1; maxEnd += 1) {
                if (array[maxEnd].at <= cmp) {
                    this.swap(array, maxEnd, minEnd);
                    minEnd += 1;
                }
            }
            this.swap(array, minEnd, right - 1);
            return minEnd;
        };
        Events.prototype.swap = function (array, i, j) {
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
            return array;
        };
        Events.prototype.organize = function (events, left, right) {
            if (left < right) {
                var p = this.partition(events, left, right);
                this.organize(events, left, p);
                this.organize(events, p + 1, right);
            }
            return events;
        };
        return Events;
    }());
    QEpiKit.Events = Events;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=events.js.map
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
    var Evolutionary = (function (_super) {
        __extends(Evolutionary, _super);
        function Evolutionary(environment, setup, discrete, gradient) {
            if (discrete === void 0) { discrete = false; }
            if (gradient === void 0) { gradient = true; }
            var _this = _super.call(this, environment, setup) || this;
            _this.ranges = setup.evolution.params;
            _this.size = setup.experiment.size;
            _this.discrete = discrete;
            _this.gradient = gradient;
            _this.population = [];
            for (var i = 0; i < _this.size; i++) {
                var chroma = new QEpiKit.Chromasome();
                for (var k = 0; k < _this.ranges.length; k++) {
                    chroma.genes.push(new QEpiKit.Gene(_this.ranges[k].ranges, _this.discrete));
                }
                _this.population.push(chroma);
            }
            return _this;
        }
        Evolutionary.prototype.dscSort = function (a, b) {
            if (a.score > b.score) {
                return -1;
            }
            else if (a.score < b.score) {
                return 1;
            }
            return 0;
        };
        Evolutionary.prototype.ascSort = function (a, b) {
            if (a.score > b.score) {
                return 1;
            }
            else if (a.score < b.score) {
                return -1;
            }
            return 0;
        };
        Evolutionary.prototype.prep = function (r, cfg) {
            if (this.mating) {
                var topPercent = Math.round(0.1 * this.size) + 2; //ten percent of original size + 2
                var children = this.mate(topPercent);
                this.population = this.population.concat(children);
            }
            for (var i = 0; i < this.population.length; i++) {
                this.mutate(this.population[i], 1);
            }
            for (var j = 0; j < this.population.length; j++) {
                var _loop_1 = function (pm) {
                    var cfgPm = this_1.ranges[pm];
                    var groupIdx = cfg.agents.map(function (d, i) { if (cfgPm.group == d.name) {
                        return i;
                    } });
                    var paramIdx = cfg.agents[groupIdx[0]].map(function (dd, ii) { if (cfgPm.name == dd.name) {
                        return ii;
                    } });
                    cfg.agents[groupIdx[0]].params[paramIdx[0]] = QEpiKit.Utils.invNorm(this_1.population[j].genes[pm].code, cfgPm.range[0], cfgPm.range[1]);
                };
                var this_1 = this;
                for (var pm = 0; pm < this.ranges.length; pm++) {
                    _loop_1(pm);
                }
                _super.prototype.prep.call(this, r, cfg);
                var predict = this.report(r, cfg);
                this.population[j].score = this.cost(predict, this.target);
            }
        };
        Evolutionary.prototype.cost = function (predict, target) {
            var dev = 0;
            for (var key in target.mean) {
                dev += Math.pow(target.mean[key] - predict.mean[key], 2);
            }
            return dev;
        };
        Evolutionary.prototype.report = function (r, cfg) {
            return _super.prototype.report.call(this, r, cfg);
        };
        Evolutionary.prototype.mate = function (parents) {
            var numChildren = 0.5 * this.ranges.length * this.ranges.length;
            var children = [];
            for (var i = 0; i < numChildren; i++) {
                var child = new QEpiKit.Chromasome();
                for (var j = 0; j < this.ranges.length; j++) {
                    var gene = new QEpiKit.Gene([this.ranges[j].range[0], this.ranges[j].range[1]], this.discrete);
                    var rand = Math.floor(Math.random() * parents);
                    var expressed = this.population[rand].genes.slice(j, j + 1);
                    gene.code = expressed[0].code;
                    child.genes.push(gene);
                }
                children.push(child);
            }
            return children;
        };
        Evolutionary.prototype.mutate = function (chroma, chance) {
            if (Math.random() > chance) {
                return;
            }
            var best = this.population[0].genes;
            for (var j = 0; j < chroma.genes.length; j++) {
                var gene = chroma.genes[j];
                var diff = void 0;
                if (this.gradient) {
                    diff = best[j].code - gene.code;
                }
                else {
                    diff = QEpiKit.Utils.randRange(-1, 1);
                }
                var upOrDown = diff > 0 ? 1 : -1;
                if (!this.discrete) {
                    gene.code += upOrDown * this.mutateRate * Math.random();
                }
                else {
                    gene.code += upOrDown;
                }
                gene.code = Math.min(Math.max(0, gene.code), 1);
            }
        };
        return Evolutionary;
    }(QEpiKit.Experiment));
    QEpiKit.Evolutionary = Evolutionary;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=evolutionary.js.map
var QEpiKit;
(function (QEpiKit) {
    /**Batch run environments
    *
    */
    var Experiment = (function () {
        function Experiment(environment, setup, target) {
            this.environment = environment;
            this.setup = setup;
            this.target = setup.target;
            this.experimentLog = [];
        }
        Experiment.prototype.start = function (runs, step, until) {
            var r = 0;
            while (r < runs) {
                this.prep(r, this.setup);
                this.environment.time = 0; //
                this.environment.run(step, until, 0);
                this.experimentLog[r] = this.report(r, this.setup);
                r++;
            }
        };
        Experiment.prototype.prep = function (r, cfg, agents, visualize) {
            var _this = this;
            var groups = {};
            var currentAgentId = 0;
            this.environment = new QEpiKit.Environment();
            cfg.agents.forEach(function (group) {
                //groups[group.name] = generatePop(group.count, group.params, cfg.environment.spatialType, group.boundaries, currentAgentId)
                currentAgentId = groups[group.name][groups[group.name].length - 1].id;
            });
            cfg.components.forEach(function (cmp) {
                switch (cmp.type) {
                    case 'state-machine':
                        var sm = new QEpiKit.StateMachine(cmp.name, cmp.states, cmp.transitions, cmp.conditions, groups[cmp.agents][0]);
                        _this.environment.add(sm);
                        break;
                    case 'every-step':
                        _this.environment.add({
                            id: QEpiKit.Utils.generateUUID(),
                            name: cmp.name,
                            update: cmp.action,
                            data: groups[cmp.agents][0]
                        });
                        break;
                    default:
                        break;
                }
            });
            switch (cfg.experiment) {
                default:
                    if (r == null) {
                        visualize();
                    }
                    else {
                        agents = this.environment.agents;
                        this.environment.run(cfg.environment.step, cfg.environment.until, 0);
                    }
                    break;
            }
        };
        Experiment.prototype.report = function (r, cfg) {
            var _this = this;
            var sums = {};
            var means = {};
            var freq = {};
            var model = {};
            cfg.report.sum = cfg.report.sum.concat(cfg.report.mean);
            this.environment.agents.forEach(function (d, i) {
                cfg.report.sum.forEach(function (s) {
                    sums[s] = sums[s] == undefined ? d[s] : d[s] + sums[s];
                });
                cfg.report.freq.forEach(function (f) {
                    freq[f] = freq[f] || {};
                    freq[f][d[f]] = freq[f][d[f]] == undefined ? 1 : freq[f][d[f]] + 1;
                });
            });
            cfg.report.mean.forEach(function (m) {
                means[m] = sums[m] / _this.environment.agents.length;
            });
            return {
                count: this.environment.agents.length,
                sums: sums,
                means: means,
                freq: freq,
                model: model
            };
        };
        //on each run, change one param, hold others constant
        Experiment.prototype.sweep = function (params, runsPer, baseline) {
            if (baseline === void 0) { baseline = true; }
            var expPlan = [];
            if (baseline === true) {
                params.baseline = [true];
            }
            for (var prop in params) {
                for (var i = 0; i < params[prop].length; i++) {
                    for (var k = 0; k < runsPer; k++) {
                        expPlan.push({
                            param: prop,
                            value: params[prop][i],
                            run: k
                        });
                    }
                }
            }
            this.plans = expPlan;
        };
        Experiment.prototype.boot = function (params) {
            var runs;
            for (var param in params) {
                if (typeof runs === 'undefined') {
                    runs = params[param].length;
                }
                if (params[param].length !== runs) {
                    throw "length of parameter arrays did not match";
                }
            }
            this.plans = params;
        };
        return Experiment;
    }());
    QEpiKit.Experiment = Experiment;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=experiment.js.map
var QEpiKit;
(function (QEpiKit) {
    var Gene = (function () {
        function Gene(range, discrete) {
            var val = QEpiKit.Utils.randRange(range[0], range[1]);
            if (!discrete) {
                this.code = QEpiKit.Utils.normalize(val, range[0], range[1]);
            }
            else {
                this.code = Math.floor(val);
            }
        }
        return Gene;
    }());
    QEpiKit.Gene = Gene;
    var Chromasome = (function () {
        function Chromasome() {
            this.genes = [];
        }
        return Chromasome;
    }());
    QEpiKit.Chromasome = Chromasome;
    var Genetic = (function () {
        function Genetic(size, ranges, target, cost, discrete, gradient) {
            if (discrete === void 0) { discrete = false; }
            if (gradient === void 0) { gradient = true; }
            this.ranges = ranges;
            this.target = target;
            this.discrete = discrete;
            this.cost = cost;
            this.size = size;
            this.gradient = gradient;
            this.population = [];
            for (var i = 0; i < this.size; i++) {
                var chroma = new Chromasome();
                for (var k = 0; k < ranges.length; k++) {
                    chroma.genes.push(new Gene(this.ranges[k], this.discrete));
                }
                this.population.push(chroma);
            }
        }
        Genetic.prototype.run = function (generations, mating) {
            if (mating === void 0) { mating = false; }
            this.mutateRate = 0.01;
            this.mating = mating;
            while (generations--) {
                this.generation();
                this.population.sort(this.ascSort);
            }
            return this.population;
        };
        Genetic.prototype.dscSort = function (a, b) {
            if (a.score > b.score) {
                return -1;
            }
            else if (a.score < b.score) {
                return 1;
            }
            return 0;
        };
        Genetic.prototype.ascSort = function (a, b) {
            if (a.score > b.score) {
                return 1;
            }
            else if (a.score < b.score) {
                return -1;
            }
            return 0;
        };
        Genetic.prototype.generation = function () {
            if (this.mating) {
                var topOnePercent = Math.round(0.01 * this.size) + 2; //ten percent of original size + 2
                var children = this.mate(topOnePercent);
                this.population = this.population.concat(children);
            }
            for (var i = 0; i < this.population.length; i++) {
                this.mutate(this.population[i], 1);
            }
            for (var j = 0; j < this.population.length; j++) {
                this.population[j].score = this.cost(this.population[j], this.target);
            }
        };
        Genetic.prototype.mate = function (parents) {
            var numChildren = 0.5 * this.ranges.length * this.ranges.length;
            var children = [];
            for (var i = 0; i < numChildren; i++) {
                var child = new Chromasome();
                for (var j = 0; j < this.ranges.length; j++) {
                    var gene = new Gene([this.ranges[j][0], this.ranges[j][1]], this.discrete);
                    var rand = Math.floor(Math.random() * parents);
                    var expressed = this.population[rand].genes.slice(j, j + 1);
                    gene.code = expressed[0].code;
                    child.genes.push(gene);
                }
                children.push(child);
            }
            return children;
        };
        Genetic.prototype.mutate = function (chroma, chance) {
            if (Math.random() > chance) {
                return;
            }
            var best = this.population[0].genes;
            for (var j = 0; j < chroma.genes.length; j++) {
                var gene = chroma.genes[j];
                var diff = void 0;
                if (this.gradient) {
                    diff = best[j].code - gene.code;
                }
                else {
                    diff = QEpiKit.Utils.randRange(-1, 1);
                }
                var upOrDown = diff > 0 ? 1 : -1;
                if (!this.discrete) {
                    gene.code += upOrDown * this.mutateRate * Math.random();
                }
                else {
                    gene.code += upOrDown;
                }
                gene.code = Math.min(Math.max(0, gene.code), 1);
            }
        };
        return Genetic;
    }());
    QEpiKit.Genetic = Genetic;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=genetic.js.map
var QEpiKit;
(function (QEpiKit) {
    var GeoPatch = (function () {
        function GeoPatch(name, geoJSON) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.geoJSON = JSON;
        }
        return GeoPatch;
    })();
    QEpiKit.GeoPatch = GeoPatch;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=geoPatch.js.map
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
    //Hierarchal Task Network
    var HTNPlanner = (function (_super) {
        __extends(HTNPlanner, _super);
        function HTNPlanner(name, root, task, data) {
            var _this = _super.call(this, name) || this;
            _this.root = root;
            _this.data = data;
            _this.summary = [];
            _this.results = [];
            _this.task = task;
            return _this;
        }
        HTNPlanner.tick = function (node, task, agent) {
            if (agent.runningList) {
                agent.runningList.push(node.name);
            }
            else {
                agent.runningList = [node.name];
                agent.successList = [];
                agent.barrierList = [];
                agent.blackboard = [];
            }
            var state = node.visit(agent, task);
            return state;
        };
        HTNPlanner.prototype.update = function (agent, step) {
            //iterate an agent(data) through the task network
            agent.active = true;
            HTNPlanner.tick(this.root, this.task, agent);
            if (agent.successList.length > 0) {
                agent.succeed = true;
            }
            else {
                agent.succeed = false;
            }
            agent.active = false;
        };
        return HTNPlanner;
    }(QEpiKit.QComponent));
    QEpiKit.HTNPlanner = HTNPlanner;
    var HTNRootTask = (function () {
        function HTNRootTask(name, goals) {
            this.name = name;
            this.goals = goals;
        }
        HTNRootTask.prototype.evaluateGoal = function (agent) {
            var result, g;
            for (var p = 0; p < this.goals.length; p++) {
                g = this.goals[p];
                if (g.data) {
                    result = g.check(g.data[g.key], g.value);
                }
                else {
                    result = g.check(agent[g.key], g.value);
                }
                return result;
            }
        };
        return HTNRootTask;
    }());
    QEpiKit.HTNRootTask = HTNRootTask;
    var HTNNode = (function () {
        function HTNNode(name, preconditions) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.preconditions = preconditions;
        }
        HTNNode.prototype.evaluatePreConds = function (agent) {
            var result;
            if (this.preconditions instanceof Array) {
                for (var p = 0; p < this.preconditions.length; p++) {
                    result = this.preconditions[p].check(agent[this.preconditions[p].key], this.preconditions[p].value);
                    if (result === HTNPlanner.FAILED) {
                        return HTNPlanner.FAILED;
                    }
                }
            }
            return HTNPlanner.SUCCESS;
        };
        return HTNNode;
    }());
    QEpiKit.HTNNode = HTNNode;
    var HTNOperator = (function (_super) {
        __extends(HTNOperator, _super);
        function HTNOperator(name, preconditions, effects) {
            var _this = _super.call(this, name, preconditions) || this;
            _this.type = "operator";
            _this.effects = effects;
            _this.visit = function (agent, task) {
                if (this.evaluatePreConds(agent) === HTNPlanner.SUCCESS) {
                    for (var i = 0; i < this.effects.length; i++) {
                        this.effects[i](agent.blackboard[0]);
                    }
                    if (task.evaluateGoal(agent.blackboard[0]) === HTNPlanner.SUCCESS) {
                        agent.successList.unshift(this.name);
                        return HTNPlanner.SUCCESS;
                    }
                    else {
                        return HTNPlanner.RUNNING;
                    }
                }
                else {
                    agent.barrierList.unshift({ name: this.name, conditions: this.preconditions });
                    return HTNPlanner.FAILED;
                }
            };
            return _this;
        }
        return HTNOperator;
    }(HTNNode));
    QEpiKit.HTNOperator = HTNOperator;
    var HTNMethod = (function (_super) {
        __extends(HTNMethod, _super);
        function HTNMethod(name, preconditions, children) {
            var _this = _super.call(this, name, preconditions) || this;
            _this.type = "method";
            _this.children = children;
            _this.visit = function (agent, task) {
                var copy = JSON.parse(JSON.stringify(agent));
                delete copy.blackboard;
                agent.blackboard.unshift(copy);
                if (this.evaluatePreConds(agent) === HTNPlanner.SUCCESS) {
                    for (var i = 0; i < this.children.length; i++) {
                        var state = HTNPlanner.tick(this.children[i], task, agent);
                        if (state === HTNPlanner.SUCCESS) {
                            agent.successList.unshift(this.name);
                            return HTNPlanner.SUCCESS;
                        }
                    }
                }
                else {
                    agent.barrierList.unshift({ name: this.name, conditions: this.preconditions });
                }
                return HTNPlanner.FAILED;
            };
            return _this;
        }
        return HTNMethod;
    }(HTNNode));
    QEpiKit.HTNMethod = HTNMethod;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=htn.js.map
//# sourceMappingURL=interfaces.js.map
var QEpiKit;
(function (QEpiKit) {
    var kMean = (function () {
        function kMean(data, props, k) {
            var _this = this;
            this.centroids = [];
            this.limits = {};
            this.iterations = 0;
            //create a limits obj for each prop
            props.forEach(function (p) {
                _this.limits[p] = {
                    min: 1e15,
                    max: -1e15
                };
            });
            //set limits for each prop
            data.forEach(function (d) {
                props.forEach(function (p) {
                    if (d[p] > _this.limits[p].max) {
                        _this.limits[p].max = d[p];
                    }
                    if (d[p] < _this.limits[p].min) {
                        _this.limits[p].min = d[p];
                    }
                });
            });
            var _loop_1 = function (i) {
                this_1.centroids[i] = { count: 0 };
                props.forEach(function (p) {
                    var centroid = Math.random() * _this.limits[p].max + _this.limits[p].min;
                    _this.centroids[i][p] = centroid;
                });
            };
            var this_1 = this;
            //create k random points
            for (var i = 0; i < k; i++) {
                _loop_1(i);
            }
            this.data = data;
            this.props = props;
        }
        kMean.prototype.update = function () {
            this._assignCentroid();
            this._moveCentroid();
        };
        kMean.prototype.run = function () {
            var finished = false;
            while (!finished) {
                this.update();
                this.centroids.forEach(function (c) {
                    finished = c.finished;
                });
                this.iterations++;
            }
            return [this.centroids, this.data];
        };
        kMean.prototype._assignCentroid = function () {
            var _this = this;
            this.data.forEach(function (d, j) {
                var distances = [];
                var totalDist = [];
                var minDist;
                var minIndex;
                //foreach point, get the per prop distance from each centroid
                _this.centroids.forEach(function (c, i) {
                    distances[i] = {};
                    totalDist[i] = 0;
                    _this.props.forEach(function (p) {
                        distances[i][p] = Math.sqrt((d[p] - c[p]) * (d[p] - c[p]));
                        totalDist[i] += distances[i][p];
                    });
                    totalDist[i] = Math.sqrt(totalDist[i]);
                });
                minDist = Math.min.apply(null, totalDist);
                minIndex = totalDist.indexOf(minDist);
                d.centroid = minIndex;
                d.distances = distances;
                _this.centroids[minIndex].count += 1;
            });
        };
        kMean.prototype._moveCentroid = function () {
            var _this = this;
            this.centroids.forEach(function (c, i) {
                var distFromCentroid = {};
                _this.props.forEach(function (p) { return distFromCentroid[p] = []; });
                //get the per prop distances from the centroid among its' assigned points
                _this.data.forEach(function (d) {
                    if (d.centroid === i) {
                        _this.props.forEach(function (p) {
                            distFromCentroid[p].push(d[p]);
                        });
                    }
                });
                //handle centroid with no assigned points (randomly assign new);
                if (c.count === 0) {
                    _this.props.forEach(function (p) {
                        distFromCentroid[p] = [Math.random() * _this.limits[p].max + _this.limits[p].min];
                    });
                    //console.log(i, ' was unassigned this time ', this.iterations, 'was assigned', distFromCentroid);
                }
                //get the sum and mean per property of the assigned points
                _this.props.forEach(function (p) {
                    var sum = distFromCentroid[p].reduce(function (prev, next) {
                        return prev + next;
                    }, 0);
                    var mean = sum / distFromCentroid[p].length;
                    //console.log(i, '\'s average dist was', mean, ' the current pos was ', c[p]);
                    if (c[p] !== mean) {
                        c[p] = mean;
                        c.finished = false;
                        c.count = 0;
                    }
                    else {
                        c.finished = true;
                    }
                });
            });
        };
        return kMean;
    }());
    QEpiKit.kMean = kMean;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=kmean.js.map
var QEpiKit;
(function (QEpiKit) {
    var KNN = (function () {
        function KNN() {
        }
        KNN.prototype.setNeighbors = function (point, data, param, classifier) {
            data.forEach(function (d) {
                if (d.id !== point.id) {
                    point.neighbors[d.id] = point.neighbors[d.id] || {};
                    point.neighbors[d.id][classifier] = d[classifier];
                    point.neighbors[d.id][param.param] = Math.abs(point[param.param] - d[param.param]) / param.range;
                }
            });
        };
        KNN.prototype.sort = function (neighbors, param) {
            var list = [];
            for (var neigh in neighbors) {
                list.push(neighbors[neigh]);
            }
            list.sort(function (a, b) {
                if (a[param] >= b[param]) {
                    return 1;
                }
                if (b[param] >= a[param]) {
                    return -1;
                }
                return 0;
            });
            return list;
        };
        KNN.prototype.setDistances = function (data, trained, kParamsObj, classifier) {
            for (var i = 0; i < data.length; i++) {
                data[i].neighbors = {};
                for (var k = 0; k < kParamsObj.length; k++) {
                    if (typeof data[i][kParamsObj[k].param] === 'number') {
                        this.setNeighbors(data[i], trained, kParamsObj[k], classifier);
                    }
                }
                for (var n in data[i].neighbors) {
                    var neighbor = data[i].neighbors[n];
                    var dist = 0;
                    for (var p = 0; p < kParamsObj.length; p++) {
                        dist += neighbor[kParamsObj[p].param] * neighbor[kParamsObj[p].param];
                    }
                    neighbor.distance = Math.sqrt(dist);
                }
            }
            return data;
        };
        KNN.prototype.getRange = function (data, kParams) {
            var ranges = [], min = 1e20, max = 0;
            for (var j = 0; j < kParams.length; j++) {
                for (var d = 0; d < data.length; d++) {
                    if (data[d][kParams[j]] < min) {
                        min = data[d][kParams[j]];
                    }
                    if (data[d][kParams[j]] > max) {
                        max = data[d][kParams[j]];
                    }
                }
                ranges.push({
                    param: kParams[j],
                    min: min,
                    max: max,
                    range: max - min
                });
            }
            ;
            return ranges;
        };
        KNN.prototype.classify = function (data, trainedData, kParams, classifier, nearestN) {
            var kParamsObj = this.getRange([].concat(data, trainedData), kParams);
            data = this.setDistances(data, trainedData, kParamsObj, classifier);
            var ordered = [];
            for (var d = 0; d < data.length; d++) {
                var results = {};
                ordered = this.sort(data[d].neighbors, 'distance');
                var n = 0;
                while (n < nearestN) {
                    var current = ordered[n][classifier];
                    results[current] = results[current] || 0;
                    results[current] += 1;
                    n++;
                }
                var max = 0, likeliest = '';
                for (var param in results) {
                    if (results[param] > max) {
                        max = results[param];
                        likeliest = param;
                    }
                }
                data[d][classifier] = likeliest;
            }
            return data;
        };
        return KNN;
    }());
    QEpiKit.KNN = KNN;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=knn.js.map
var QEpiKit;
(function (QEpiKit) {
    var Network = (function () {
        function Network(data, labels, hiddenNum, el, activationType) {
            if (activationType === void 0) { activationType = "tanh"; }
            this.el = el;
            this.iter = 0;
            this.correct = 0;
            this.hiddenNum = hiddenNum;
            this.learnRate = 0.01;
            this.actFn = Network.activationMethods[activationType];
            this.derFn = Network.deriviteMethods[activationType];
            this.init(data, labels);
        }
        Network.prototype.learn = function (iterations, data, labels, render) {
            if (render === void 0) { render = 100; }
            this.correct = 0;
            var _loop_1 = function (i) {
                var randIdx = Math.floor(Math.random() * data.length);
                this_1.iter++;
                this_1.forward(data[randIdx]);
                var max = -1;
                var maxIdx = Math.floor(Math.random() * this_1.values.length);
                this_1.values[this_1.values.length - 1].forEach(function (x, idx) {
                    if (x > max) {
                        maxIdx = idx;
                        max = x;
                    }
                });
                var guessed = this_1.values[this_1.values.length - 1][maxIdx] >= 0.5 ? 1 : 0;
                if (guessed === labels[randIdx][maxIdx]) {
                    this_1.correct++;
                }
                this_1.accuracy = this_1.correct / (i + 1);
                this_1.backward(labels[randIdx]);
                this_1.updateWeights();
                this_1.resetTotals();
            };
            var this_1 = this;
            for (var i = 0; i < iterations; i++) {
                _loop_1(i);
            }
        };
        Network.prototype.classify = function (data) {
            this.resetTotals();
            this.forward(data);
            return this.values[this.values.length - 1];
        };
        Network.prototype.init = function (data, labels) {
            var inputs = [];
            this.der = [];
            this.values = [];
            this.weights = [];
            this.weightChanges = [];
            this.totals = [];
            this.derTotals = [];
            this.biases = [];
            for (var n = 0; n < data[0].length; n++) {
                inputs.push(0);
            }
            for (var col = 0; col < this.hiddenNum.length; col++) {
                this.der[col] = [];
                this.values[col] = [];
                this.totals[col] = [];
                this.derTotals[col] = [];
                for (var row = 0; row < this.hiddenNum[col]; row++) {
                    this.values[col][row] = 0;
                    this.der[col][row] = 0;
                    this.totals[col][row] = 0;
                    this.derTotals[col][row] = 0;
                }
            }
            this.values.unshift(inputs);
            this.totals.unshift(inputs);
            this.der.unshift(inputs);
            this.derTotals.unshift(inputs);
            this.values[this.hiddenNum.length + 1] = labels[0].map(function (l) { return 0; });
            this.totals[this.hiddenNum.length + 1] = labels[0].map(function (l) { return 0; });
            this.der[this.hiddenNum.length + 1] = labels[0].map(function (l) { return 0; });
            this.derTotals[this.hiddenNum.length + 1] = labels[0].map(function (l) { return 0; });
            for (var wg = 0; wg < this.values.length - 1; wg++) {
                this.weights[wg] = [];
                this.weightChanges[wg] = [];
                this.biases[wg] = [];
                for (var src = 0; src < this.values[wg].length; src++) {
                    this.weights[wg][src] = [];
                    this.weightChanges[wg][src] = [];
                    for (var dst = 0; dst < this.values[wg + 1].length; dst++) {
                        this.biases[wg][dst] = Math.random() - 0.5;
                        this.weights[wg][src][dst] = Math.random() - 0.5;
                        this.weightChanges[wg][src][dst] = 0;
                    }
                }
            }
        };
        Network.prototype.resetTotals = function () {
            for (var col = 0; col < this.totals.length; col++) {
                for (var row = 0; row < this.totals[col].length; row++) {
                    this.totals[col][row] = 0;
                    this.derTotals[col][row] = 0;
                }
            }
        };
        Network.prototype.forward = function (input) {
            var _this = this;
            this.values[0] = input;
            var _loop_2 = function (wg) {
                var srcVals = wg;
                var dstVals = wg + 1;
                for (var src = 0; src < this_2.weights[wg].length; src++) {
                    for (var dst = 0; dst < this_2.weights[wg][src].length; dst++) {
                        this_2.totals[dstVals][dst] += this_2.values[srcVals][src] * this_2.weights[wg][src][dst];
                    }
                }
                this_2.values[dstVals] = this_2.totals[dstVals].map(function (total, idx) {
                    return _this.actFn(total + _this.biases[wg][idx]);
                });
            };
            var this_2 = this;
            for (var wg = 0; wg < this.weights.length; wg++) {
                _loop_2(wg);
            }
        };
        Network.prototype.backward = function (labels) {
            for (var wg = this.weights.length - 1; wg >= 0; wg--) {
                var srcVals = wg;
                var dstVals = wg + 1;
                for (var src = 0; src < this.weights[wg].length; src++) {
                    var err = 0;
                    for (var dst = 0; dst < this.weights[wg][src].length; dst++) {
                        if (wg === this.weights.length - 1) {
                            err += labels[dst] - this.values[dstVals][dst];
                            this.der[dstVals][dst] = err;
                        }
                        else {
                            err += this.der[dstVals][dst] * this.weights[wg][src][dst];
                        }
                    }
                    this.derTotals[srcVals][src] = err;
                    this.der[srcVals][src] = err * this.derFn(this.values[srcVals][src]);
                }
            }
        };
        Network.prototype.updateWeights = function () {
            var _this = this;
            var _loop_3 = function (wg) {
                var srcVals = wg;
                var dstVals = wg + 1;
                for (var src = 0; src < this_3.weights[wg].length; src++) {
                    for (var dst = 0; dst < this_3.weights[wg][src].length; dst++) {
                        var momentum = this_3.weightChanges[wg][src][dst] * 0.1;
                        this_3.weightChanges[wg][src][dst] = (this_3.values[srcVals][src] * this_3.der[dstVals][dst] * this_3.learnRate) + momentum;
                        this_3.weights[wg][src][dst] += this_3.weightChanges[wg][src][dst];
                    }
                }
                this_3.biases[wg] = this_3.biases[wg].map(function (bias, idx) {
                    return _this.learnRate * _this.der[dstVals][idx] + bias;
                });
            };
            var this_3 = this;
            for (var wg = 0; wg < this.weights.length; wg++) {
                _loop_3(wg);
            }
        };
        Network.prototype.mse = function () {
            var err = 0;
            var count = 0;
            for (var j = 0; j < this.derTotals.length; j++) {
                err += this.derTotals[j].reduce(function (last, current) {
                    count++;
                    return last + Math.pow(current, 2);
                }, 0);
            }
            return err / count;
        };
        return Network;
    }());
    Network.activationMethods = {
        ReLU: function (x) {
            return Math.max(x, 0);
        },
        sigmoid: function (x) {
            return 1 / (1 + Math.exp(-x));
        },
        tanh: function (x) {
            var val = (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
            return val;
        }
    };
    Network.deriviteMethods = {
        ReLU: function (value) {
            var der = value <= 0 ? 0 : 1;
            return der;
        },
        sigmoid: function (value) {
            var sig = Network.activationMethods.sigmoid;
            return sig(value) * (1 - sig(value));
        },
        tanh: function (value) {
            return 1 - Math.pow(Network.activationMethods.tanh(value), 2);
        }
    };
    Network.costMethods = {
        sqErr: function (target, guess) {
            return guess - target;
        },
        absErr: function () {
        }
    };
    QEpiKit.Network = Network;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=network.js.map
var QEpiKit;
(function (QEpiKit) {
    var QLearner = (function () {
        //TODO - change episode to update
        function QLearner(R, gamma, goal) {
            this.rawMax = 1;
            this.R = R;
            this.gamma = gamma;
            this.goal = goal;
            this.Q = {};
            for (var state in R) {
                this.Q[state] = {};
                for (var action in R[state]) {
                    this.Q[state][action] = 0;
                }
            }
            this.gamma = gamma;
        }
        QLearner.prototype.grow = function (state, actions) {
            for (var i = 0; i < actions.length; i++) {
                //reward is currently unknown
                this.R[state][actions[i]] = null;
            }
        };
        QLearner.prototype.explore = function (prom) {
        };
        QLearner.prototype.transition = function (state, action) {
            //is the state unexamined
            var examined = true;
            var bestAction;
            for (action in this.R[state]) {
                if (this.R[state][action] === null) {
                    bestAction = action;
                    examined = false;
                }
            }
            bestAction = this.max(action);
            this.Q[state][action] = this.R[state][action] + (this.gamma * this.Q[action][bestAction]);
        };
        QLearner.prototype.max = function (state) {
            var max = 0, maxAction = null;
            for (var action in this.Q[state]) {
                if (!maxAction) {
                    max = this.Q[state][action];
                    maxAction = action;
                }
                else if (this.Q[state][action] === max && (Math.random() > 0.5)) {
                    max = this.Q[state][action];
                    maxAction = action;
                }
                else if (this.Q[state][action] > max) {
                    max = this.Q[state][action];
                    maxAction = action;
                }
            }
            return maxAction;
        };
        QLearner.prototype.possible = function (state) {
            var possible = [];
            for (var action in this.R[state]) {
                if (this.R[state][action] > -1) {
                    possible.push(action);
                }
            }
            return possible[Math.floor(Math.random() * possible.length)];
        };
        QLearner.prototype.episode = function (state) {
            this.transition(state, this.possible(state));
            return this.Q;
        };
        QLearner.prototype.normalize = function () {
            for (var state in this.Q) {
                for (var action in this.Q[state]) {
                    if (this.Q[action][state] >= this.rawMax) {
                        this.rawMax = this.Q[action][state];
                    }
                }
            }
            for (var state in this.Q) {
                for (var action in this.Q[state]) {
                    this.Q[action][state] = Math.round(this.Q[action][state] / this.rawMax * 100);
                }
            }
        };
        return QLearner;
    }());
    QEpiKit.QLearner = QLearner;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=QLearner.js.map
var QEpiKit;
(function (QEpiKit) {
    function ols(ivs, dv) {
        var _this = this;
        var data = QEpiKit.Utils.dataToMatrix(ivs, this.standardized);
        var dvData = dv.data;
        var n = dvData.length;
        var means = ivs.map(function (a) { return a.mean; });
        var sds = ivs.map(function (a) { return a.sd; });
        var vars = ivs.map(function (a) { return [a.variance]; });
        means.unshift(1);
        sds.unshift(1);
        vars.unshift([1]);
        if (this.standardized) {
            dvData = QEpiKit.Utils.standardized(dv.data);
        }
        var X = data;
        var Y = dvData.map(function (y) { return [y]; });
        var Xprime = jStat.transpose(X);
        var XprimeX = jStat.multiply(Xprime, X);
        var XprimeY = jStat.multiply(Xprime, Y);
        //coefficients
        var b = jStat.multiply(jStat.inv(XprimeX), XprimeY);
        this.betas = b.reduce(function (a, b) { return a.concat(b); });
        //standard error of the coefficients
        this.stErrCoeff = jStat.multiply(jStat.inv(XprimeX), vars)
            .reduce(function (a, b) { return a.concat(b); });
        //t statistics
        this.tStats = this.stErrCoeff.map(function (se, i) { return _this.betas[i] / se; });
        //p values
        this.pValues = this.tStats.map(function (t, i) { return jStat.ttest(t, means[i], sds[i], n); });
        //residuals
        var yhat = [];
        var res = dv.data.map(function (d, i) {
            data[i].shift();
            var row = data[i];
            yhat[i] = _this.predict(row);
            return d - yhat[i];
        });
        var residual = yhat;
        return this.betas;
    }
    QEpiKit.ols = ols;
    function pls(x, y) {
    }
    QEpiKit.pls = pls;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=regression.js.map
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
    var StateMachine = (function (_super) {
        __extends(StateMachine, _super);
        function StateMachine(name, states, transitions, conditions, data) {
            var _this = _super.call(this, name) || this;
            _this.states = states;
            _this.transitions = _this.checkTransitions(transitions);
            _this.conditions = conditions;
            _this.data = data;
            return _this;
        }
        StateMachine.prototype.update = function (agent, step) {
            for (var s in agent.states) {
                var state = agent.states[s];
                this.states[state](agent, step);
                for (var i = 0; i < this.transitions.length; i++) {
                    for (var j = 0; j < this.transitions[i].from.length; j++) {
                        var trans = this.transitions[i].from[j];
                        if (trans === state) {
                            var cond = this.conditions[this.transitions[i].name];
                            var value = void 0;
                            if (typeof (cond.value) === 'function') {
                                value = cond.value();
                            }
                            else {
                                value = cond.value;
                            }
                            var r = cond.check(agent[cond.key], value);
                            if (r === StateMachine.SUCCESS) {
                                agent.states[s] = this.transitions[i].to;
                                agent[s] = agent.states[s]; //for easier reporting
                            }
                        }
                    }
                }
            }
        };
        StateMachine.prototype.checkTransitions = function (transitions) {
            for (var t = 0; t < transitions.length; t++) {
                if (typeof transitions[t].from === 'string') {
                    transitions[t].from = [transitions[t].from];
                }
                else {
                    //;
                }
            }
            return transitions;
        };
        return StateMachine;
    }(QEpiKit.QComponent));
    QEpiKit.StateMachine = StateMachine;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=stateMachine.js.map
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
    /*
    * Utility Systems class
    */
    var USys = (function (_super) {
        __extends(USys, _super);
        function USys(name, options, data) {
            var _this = _super.call(this, name) || this;
            _this.options = options;
            _this.results = [];
            _this.data = data;
            return _this;
        }
        USys.prototype.update = function (agent, step) {
            var tmp = [], max = 0, avg, top;
            for (var i = 0; i < this.options.length; i++) {
                tmp[i] = 0;
                for (var j = 0; j < this.options[i].considerations.length; j++) {
                    var c = this.options[i].considerations[j];
                    var x = c.x(agent, this.options[i].params);
                    tmp[i] += c.f(x, c.m, c.b, c.k);
                }
                avg = tmp[i] / this.options[i].considerations.length;
                this.results.push({ point: agent.id, opt: this.options[i].name, result: avg });
                if (avg > max) {
                    agent.top = { name: this.options[i].name, util: avg };
                    top = i;
                    max = avg;
                }
            }
            this.options[top].action(step, agent);
        };
        return USys;
    }(QEpiKit.QComponent));
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
        var y = 1 - Math.pow(x, k) / Math.pow(1, k);
        return y;
    }
    QEpiKit.exponential = exponential;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=USys.js.map
var QEpiKit;
(function (QEpiKit) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.createCSVURI = function (data) {
            var dataString;
            var URI;
            var csvContent = "data:text/csv;charset=utf-8,";
            var csvContentArray = [];
            data.forEach(function (infoArray) {
                dataString = infoArray.join(",");
                csvContentArray.push(dataString);
            });
            csvContent += csvContentArray.join("\n");
            URI = encodeURI(csvContent);
            return URI;
        };
        Utils.arrayFromRange = function (start, end, step) {
            var range = [];
            var i = start;
            while (i < end) {
                range.push(i);
                i += step;
            }
            return range;
        };
        /**
        * shuffle - fisher-yates shuffle
        */
        Utils.shuffle = function (array, randomF) {
            var currentIndex = array.length, temporaryValue, randomIndex;
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(randomF() * currentIndex);
                currentIndex -= 1;
                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        };
        Utils.generateUUID = function () {
            // http://www.broofa.com/Tools/Math.uuid.htm
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
            var uuid = new Array(36);
            var rnd = 0, r;
            for (var i = 0; i < 36; i++) {
                if (i == 8 || i == 13 || i == 18 || i == 23) {
                    uuid[i] = '-';
                }
                else if (i == 14) {
                    uuid[i] = '4';
                }
                else {
                    if (rnd <= 0x02)
                        rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
            return uuid.join('');
        };
        Utils.always = function (a) {
            if (a === Utils.SUCCESS) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.eventually = function (a) {
            if (a === Utils.SUCCESS) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.RUNNING;
            }
        };
        Utils.equalTo = function (a, b) {
            if (a === b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.not = function (result) {
            var newResult;
            if (result === Utils.SUCCESS) {
                newResult = Utils.FAILED;
            }
            else if (result === Utils.FAILED) {
                newResult = Utils.SUCCESS;
            }
            return newResult;
        };
        Utils.notEqualTo = function (a, b) {
            if (a !== b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.gt = function (a, b) {
            if (a > b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.gtEq = function (a, b) {
            if (a >= b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.lt = function (a, b) {
            if (a < b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.ltEq = function (a, b) {
            if (a <= b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.hasProp = function (a, b) {
            a = a || false;
            if (a === b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.inRange = function (a, b) {
            if (b >= a[0] && b <= a[1]) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.notInRange = function (a, b) {
            if (b >= a[0] && b <= a[1]) {
                return Utils.FAILED;
            }
            else {
                return Utils.SUCCESS;
            }
        };
        Utils.getMatcherString = function (check) {
            var string = null;
            switch (check) {
                case QEpiKit.Utils.equalTo:
                    string = "equal to";
                    break;
                case QEpiKit.Utils.notEqualTo:
                    string = "not equal to";
                    break;
                case QEpiKit.Utils.gt:
                    string = "greater than";
                    break;
                case QEpiKit.Utils.gtEq:
                    string = "greater than or equal to";
                    break;
                case QEpiKit.Utils.lt:
                    string = "less than";
                    break;
                case QEpiKit.Utils.ltEq:
                    string = "less than or equal to";
                    break;
                case QEpiKit.Utils.hasProp:
                    string = "has the property";
                    break;
                default:
                    try {
                        string = "not a defined matcher";
                    }
                    catch (e) {
                        console.log(e);
                    }
                    break;
            }
            return string;
        };
        Utils.setMin = function (params, keys) {
            for (var param in params) {
                if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
                    params[param].current = params[param].value - params[param].error;
                }
                else if (typeof (keys) === 'undefined') {
                    params[param].current = params[param].value - params[param].error;
                }
            }
        };
        Utils.setMax = function (params, keys) {
            for (var param in params) {
                if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
                    params[param].current = params[param].value + params[param].error;
                }
                else if (typeof (keys) === 'undefined') {
                    params[param].current = params[param].value + params[param].error;
                }
            }
        };
        Utils.setStandard = function (params, keys) {
            for (var param in params) {
                if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
                    params[param].current = params[param].value;
                }
                else if (typeof (keys) === 'undefined') {
                    params[param].current = params[param].value;
                }
            }
        };
        Utils.dataToMatrix = function (items, stdized) {
            if (stdized === void 0) { stdized = false; }
            var data = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (stdized) {
                    item = Utils.standardized(item);
                }
                item.forEach(function (x, ii) {
                    if (typeof data[ii] === 'undefined') {
                        data[ii] = [1, x];
                    }
                    else {
                        data[ii].push(x);
                    }
                });
            }
            return data;
        };
        /*
        * relative to the mean, how many standard deviations
        */
        Utils.standardized = function (arr) {
            var std = jStat.stdev(arr);
            var mean = jStat.mean(arr);
            var standardized = arr.map(function (d) {
                return (d - mean) / std;
            });
            return standardized;
        };
        /*
        * between 0 and 1 when min and max are known
        */
        Utils.normalize = function (x, min, max) {
            var val = x - min;
            return val / (max - min);
        };
        /*
        * give the real unit value
        */
        Utils.invNorm = function (x, min, max) {
            return (x * max - x * min) + min;
        };
        /*
        *
        */
        Utils.randRange = function (min, max) {
            return (max - min) * Math.random() + min;
        };
        Utils.prototype.getRange = function (data, prop) {
            var range = {
                min: 1e15,
                max: -1e15
            };
            for (var i = 0; i < data.length; i++) {
                if (range.min > data[i][prop]) {
                    range.min = data[i][prop];
                }
                if (range.max < data[i][prop]) {
                    range.max = data[i][prop];
                }
            }
            return range;
        };
        return Utils;
    }());
    Utils.SUCCESS = 1;
    Utils.FAILED = 2;
    Utils.RUNNING = 3;
    QEpiKit.Utils = Utils;
    var Match = (function () {
        function Match() {
        }
        Match.gt = function (a, b) {
            if (a > b) {
                return true;
            }
            return false;
        };
        Match.ge = function (a, b) {
            if (a >= b) {
                return true;
            }
            return false;
        };
        Match.lt = function (a, b) {
            if (a < b) {
                return true;
            }
            return false;
        };
        Match.le = function (a, b) {
            if (a <= b) {
                return true;
            }
            return false;
        };
        return Match;
    }());
    QEpiKit.Match = Match;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=utils.js.map