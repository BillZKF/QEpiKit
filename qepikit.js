var QEpiKit;
(function (QEpiKit) {
    var QComponent = (function () {
        function QComponent(name) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.time = 0;
            this.history = [];
        }
        QComponent.prototype.update = function (agent, step) {
        };
        QComponent.SUCCESS = 1;
        QComponent.FAILED = 2;
        QComponent.RUNNING = 3;
        return QComponent;
    }());
    QEpiKit.QComponent = QComponent;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=QComponent.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var QEpiKit;
(function (QEpiKit) {
    var BDIAgent = (function (_super) {
        __extends(BDIAgent, _super);
        function BDIAgent(name, goals, plans, data, policySelector) {
            if (goals === void 0) { goals = []; }
            if (plans === void 0) { plans = {}; }
            if (data === void 0) { data = []; }
            if (policySelector === void 0) { policySelector = BDIAgent.stochasticSelection; }
            _super.call(this, name);
            this.goals = goals;
            this.plans = plans;
            this.data = data;
            this.policySelector = policySelector;
            this.beliefHistory = [];
            this.planHistory = [];
        }
        BDIAgent.prototype.update = function (agent, step) {
            var policy, intent, evaluation;
            policy = this.policySelector(this.plans, this.planHistory);
            intent = this.plans[policy];
            intent(agent, step);
            evaluation = this.evaluateGoals();
            this.planHistory.push({ time: this.time, id: agent.id, intention: policy, goals: evaluation.achievements, barriers: evaluation.barriers, r: evaluation.successes / this.goals.length });
        };
        BDIAgent.prototype.evaluateGoals = function () {
            var achievements = [], barriers = [], successes = 0, c, matcher;
            for (var i = 0; i < this.goals.length; i++) {
                c = this.goals[i].condition;
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
        BDIAgent.stochasticSelection = function (plans, planHistory) {
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
        BDIAgent.lazyPolicySelection = function (plans, planHistory) {
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
        return BDIAgent;
    }(QEpiKit.QComponent));
    QEpiKit.BDIAgent = BDIAgent;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=bdi.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var QEpiKit;
(function (QEpiKit) {
    var BehaviorTree = (function (_super) {
        __extends(BehaviorTree, _super);
        function BehaviorTree(name, root, data) {
            _super.call(this, name);
            this.root = root;
            this.data = data;
            this.results = [];
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
    })(QEpiKit.QComponent);
    QEpiKit.BehaviorTree = BehaviorTree;
    var BTNode = (function () {
        function BTNode(name) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
        }
        return BTNode;
    })();
    QEpiKit.BTNode = BTNode;
    var BTControlNode = (function (_super) {
        __extends(BTControlNode, _super);
        function BTControlNode(name, children) {
            _super.call(this, name);
            this.children = children;
        }
        return BTControlNode;
    })(BTNode);
    QEpiKit.BTControlNode = BTControlNode;
    var BTRoot = (function (_super) {
        __extends(BTRoot, _super);
        function BTRoot(name, children) {
            _super.call(this, name, children);
            this.type = "root";
            this.operate = function (agent) {
                var state = BehaviorTree.tick(this.children[0], agent);
                return state;
            };
        }
        return BTRoot;
    })(BTControlNode);
    QEpiKit.BTRoot = BTRoot;
    var BTSelector = (function (_super) {
        __extends(BTSelector, _super);
        function BTSelector(name, children) {
            _super.call(this, name, children);
            this.type = "selector";
            this.operate = function (agent) {
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
        }
        return BTSelector;
    })(BTControlNode);
    QEpiKit.BTSelector = BTSelector;
    var BTSequence = (function (_super) {
        __extends(BTSequence, _super);
        function BTSequence(name, children) {
            _super.call(this, name, children);
            this.type = "sequence";
            this.operate = function (agent) {
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
        }
        return BTSequence;
    })(BTControlNode);
    QEpiKit.BTSequence = BTSequence;
    var BTParallel = (function (_super) {
        __extends(BTParallel, _super);
        function BTParallel(name, children, successes) {
            _super.call(this, name, children);
            this.type = "parallel";
            this.successes = successes;
            this.operate = function (agent) {
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
        }
        return BTParallel;
    })(BTControlNode);
    QEpiKit.BTParallel = BTParallel;
    var BTCondition = (function (_super) {
        __extends(BTCondition, _super);
        function BTCondition(name, condition) {
            _super.call(this, name);
            this.type = "condition";
            this.condition = condition;
            this.operate = function (agent) {
                var state;
                state = condition.check(agent[condition.key], condition.value);
                return state;
            };
        }
        return BTCondition;
    })(BTNode);
    QEpiKit.BTCondition = BTCondition;
    var BTAction = (function (_super) {
        __extends(BTAction, _super);
        function BTAction(name, condition, action) {
            _super.call(this, name);
            this.type = "action";
            this.condition = condition;
            this.action = action;
            this.operate = function (agent) {
                var state;
                state = condition.check(agent[condition.key], condition.value);
                if (state === BehaviorTree.SUCCESS) {
                    this.action(agent);
                }
                return state;
            };
        }
        return BTAction;
    })(BTNode);
    QEpiKit.BTAction = BTAction;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=behaviorTree.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var QEpiKit;
(function (QEpiKit) {
    var CompartmentModel = (function (_super) {
        __extends(CompartmentModel, _super);
        function CompartmentModel(name, data) {
            _super.call(this, name);
            this.data = data;
            this.totalPop = 0;
            this.history = [];
            for (var d = 0; d < this.data.length; d++) {
                this.totalPop += this.data[d].totalPop;
            }
            this._tolerance = 1e-9;
        }
        CompartmentModel.prototype.update = function (patch, step) {
            var temp_pop = [], temp_d = [], next_d = [], lte = [], err = 1, newStep;
            var compartments = patch.compartments;
            for (var c = 0; c < compartments.length; c++) {
                compartments[c].dpop = compartments[c].operation(step);
            }
            for (var c = 0; c < compartments.length; c++) {
                temp_pop[c] = compartments[c].pop;
                temp_d[c] = compartments[c].dpop;
                compartments[c].pop = temp_pop[c] + temp_d[c];
            }
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
        Patch.cId = 0;
        return Patch;
    }());
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
        ContactPatch.WIWArray = [];
        return ContactPatch;
    })();
    QEpiKit.ContactPatch = ContactPatch;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=contactPatch.js.map
var QEpiKit;
(function (QEpiKit) {
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
        Environment.prototype.init = function () {
            this._agentIndex = {};
            var _loop_1 = function() {
                var alreadyIn = [];
                for (d = 0; d < this_1.models[c].data.length; d++) {
                    var id = this_1.models[c].data[d].id;
                    if (id in this_1._agentIndex) {
                        this_1.models[c].data[d].models.push(this_1.models[c].name);
                        this_1.models[c].data[d].modelIndexes.push(c);
                        alreadyIn.push(id);
                    }
                    else {
                        this_1._agentIndex[id] = 0;
                        this_1.models[c].data[d].models = [this_1.models[c].name];
                        this_1.models[c].data[d].modelIndexes = [c];
                    }
                }
                this_1.models[c].data = this_1.models[c].data.filter(function (d) {
                    if (alreadyIn.indexOf(d.id) !== -1) {
                        return false;
                    }
                    return true;
                });
                this_1.agents = this_1.agents.concat(this_1.models[c].data);
            };
            var this_1 = this;
            var d;
            for (var c = 0; c < this.models.length; c++) {
                _loop_1();
            }
        };
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
                this.agents.forEach(function (agent, i) { _this._agentIndex[agent.id] = i; });
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
        Environment.prototype.formatTime = function () {
            this.timeOfDay = this.time % 1;
        };
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
    })();
    QEpiKit.Epi = Epi;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=epi.js.map
var QEpiKit;
(function (QEpiKit) {
    var Experiment = (function () {
        function Experiment(environment, prepFunction, recordFunction) {
            this.environment = environment;
            this.prepFunction = prepFunction;
            this.recordFunction = recordFunction;
            this.experimentLog = [];
        }
        Experiment.prototype.start = function (runs, step, until) {
            var r = 0;
            while (r < runs) {
                this.prepFunction(r);
                this.environment.time = 0;
                this.environment.run(step, until, 0);
                this.experimentLog[r] = this.recordFunction(r);
                r++;
            }
        };
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
    })();
    QEpiKit.Experiment = Experiment;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=experiment.js.map
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
                    }
                }
                for (var key in this.flowMap) {
                    var tempD = this.flowMap[key][agent.currentMode](agent[key]);
                    temp[key] = agent[key] + tempD;
                    agent[key] += 0.5 * (tempD + this.flowMap[key][agent.currentMode](temp[key]));
                }
            }
        };
        return HybridAutomata;
    })(QEpiKit.QComponent);
    QEpiKit.HybridAutomata = HybridAutomata;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=ha.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var QEpiKit;
(function (QEpiKit) {
    var HTNPlanner = (function (_super) {
        __extends(HTNPlanner, _super);
        function HTNPlanner(name, root, task, data) {
            _super.call(this, name);
            this.root = root;
            this.data = data;
            this.summary = [];
            this.results = [];
            this.task = task;
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
    })(QEpiKit.QComponent);
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
    })();
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
    })();
    QEpiKit.HTNNode = HTNNode;
    var HTNOperator = (function (_super) {
        __extends(HTNOperator, _super);
        function HTNOperator(name, preconditions, effects) {
            _super.call(this, name, preconditions);
            this.type = "operator";
            this.effects = effects;
            this.visit = function (agent, task) {
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
        }
        return HTNOperator;
    })(HTNNode);
    QEpiKit.HTNOperator = HTNOperator;
    var HTNMethod = (function (_super) {
        __extends(HTNMethod, _super);
        function HTNMethod(name, preconditions, children) {
            _super.call(this, name, preconditions);
            this.type = "method";
            this.children = children;
            this.visit = function (agent, task) {
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
        }
        return HTNMethod;
    })(HTNNode);
    QEpiKit.HTNMethod = HTNMethod;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=htn.js.map
//# sourceMappingURL=interfaces.js.map
var QEpiKit;
(function (QEpiKit) {
    var QLearner = (function () {
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
        QLearner.prototype.transition = function (state, action) {
            var bestAction = this.max(action);
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var QEpiKit;
(function (QEpiKit) {
    var StateMachine = (function (_super) {
        __extends(StateMachine, _super);
        function StateMachine(name, states, transitions, conditions, data) {
            _super.call(this, name);
            this.states = states;
            this.transitions = this.checkTransitions(transitions);
            this.conditions = conditions;
            this.data = data;
        }
        StateMachine.prototype.update = function (agent, step) {
            for (var s in agent.states) {
                var state = agent.states[s];
                this.states[state](step, agent);
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
                }
            }
            return transitions;
        };
        return StateMachine;
    }(QEpiKit.QComponent));
    QEpiKit.StateMachine = StateMachine;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=stateMachine.js.map
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
        Utils.shuffle = function (array, randomF) {
            var currentIndex = array.length, temporaryValue, randomIndex;
            while (0 !== currentIndex) {
                randomIndex = Math.floor(randomF() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        };
        Utils.generateUUID = function () {
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
        Utils.SUCCESS = 1;
        Utils.FAILED = 2;
        Utils.RUNNING = 3;
        return Utils;
    }());
    QEpiKit.Utils = Utils;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=utils.js.map