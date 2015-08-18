var QEpiKit;
(function (QEpiKit) {
    var QComponent = (function () {
        function QComponent(name) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.time = 0;
            this.history = [];
        }
        QComponent.prototype.update = function (step) {
            this.time += step;
        };
        QComponent.prototype.run = function (step, until, saveInterval) {
            this.time = 0;
            while (this.time <= until) {
                this.update(step);
                var rem = (this.time / step) % saveInterval;
                if (rem == 0) {
                    this.history.push(JSON.parse(JSON.stringify(this)));
                }
            }
        };
        QComponent.SUCCESS = 1;
        QComponent.FAILED = 2;
        QComponent.RUNNING = 3;
        return QComponent;
    })();
    QEpiKit.QComponent = QComponent;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=QComponent.js.map
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
    })();
    QEpiKit.QLearner = QLearner;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=QLearner.js.map
var QEpiKit;
(function (QEpiKit) {
    var BDIAgent = (function () {
        function BDIAgent(name, goals, plans, data, policySelector) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.goals = goals;
            this.plans = plans;
            this.data = data;
            this.policySelector = policySelector || BDIAgent.stochasticSelection;
            this.time = 0;
            this.beliefHistory = [];
            this.planHistory = [];
        }
        BDIAgent.prototype.update = function (step, events) {
            try {
                events[this.time](this.data);
            }
            catch (e) {
                events[this.time] = null;
            }
            var c, matcher, policy, intent, achievements = [], barriers = [], belief = this.data, successes = 0;
            policy = this.policySelector(this.plans, this.planHistory);
            intent = this.plans[policy];
            intent(belief);
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
            this.planHistory.push({ time: this.time, intention: policy, goals: achievements, barriers: barriers, r: successes / this.goals.length });
            this.time += step;
        };
        BDIAgent.prototype.assess = function (eventName, agents, resources) {
            var c, matcher, policy, intent, achievements = [], barriers = [], belief = [agents, resources], successes = 0;
            policy = this.policySelector(this.plans, this.planHistory);
            intent = this.plans[policy];
            intent(belief);
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
            this.planHistory.push({ event: eventName, intention: policy, goals: achievements, barriers: barriers, r: successes / this.goals.length });
        };
        BDIAgent.prototype.run = function (step, limit, recordInt, events) {
            while (this.time <= limit) {
                this.update(step, events);
                var rem = this.time % recordInt;
                if (rem === 0) {
                    this.beliefHistory.push(JSON.parse(JSON.stringify(this.data)));
                }
            }
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
        BDIAgent.SUCCESS = 1;
        BDIAgent.FAILED = 2;
        BDIAgent.RUNNING = 3;
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
    })();
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
        BehaviorTree.prototype.start = function (agent, step) {
            var state;
            agent.active = true;
            while (agent.active === true) {
                state = BehaviorTree.tick(this.root, agent);
                agent.time = this.time;
                agent.active = false;
            }
            return state;
        };
        BehaviorTree.prototype.update = function (step) {
            var dataLen = this.data.length;
            for (var d = 0; d < dataLen; d++) {
                this.start(this.data[d], step);
            }
            this.time += step;
        };
        BehaviorTree.prototype.run = function (step, until, saveInterval) {
            this.time = 0;
            while (this.time <= until) {
                var rem = (this.time / step) % saveInterval;
                if (rem == 0) {
                    this.history.push(JSON.parse(JSON.stringify(this.data)));
                }
                this.update(step);
            }
        };
        BehaviorTree.prototype.assess = function (eventName) {
            var dataLen = this.data.length;
            for (var d = 0; d < dataLen; d++) {
                this.start(this.data[d], 0);
            }
            this.results.push(JSON.parse(JSON.stringify(this.data)));
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
var QEpiKit;
(function (QEpiKit) {
    var CompartmentModel = (function () {
        function CompartmentModel(name, step, compartments, pathogen, vital) {
            this.name = name;
            this.step = step;
            this.compartments = compartments;
            this.transmissionRate = pathogen.transmissionRate * this.step;
            this.recoveryRate = pathogen.recoveryRate * this.step;
            this.basicReproductiveNumber = pathogen.transmissionRate / pathogen.recoveryRate;
            this.totalPop = 0;
            this.time = 0;
            this.history = [];
            for (var c in this.compartments) {
                this.totalPop += this.compartments[c].pop;
                this.compartments[c].initialPop = this.compartments[c].pop;
            }
            this.tolerance = 1e-9;
        }
        CompartmentModel.prototype.run = function (step, until, saveInterval) {
            var rem;
            while (this.time <= until) {
                this.update();
                rem = (this.time / step) % saveInterval;
                if (rem === 0) {
                    this.history[this.time / step] = JSON.parse(JSON.stringify(this.compartments));
                }
                this.time += this.step;
            }
        };
        CompartmentModel.prototype.update = function () {
            var temp_pop = [], temp_d = [], next_d = [], lte = [], err = 1, newStep;
            for (var c in this.compartments) {
                this.compartments[c].update();
            }
            for (var c in this.compartments) {
                temp_pop[c] = this.compartments[c].pop;
                temp_d[c] = this.compartments[c].dpop;
                this.compartments[c].pop = temp_pop[c] + temp_d[c];
            }
            this.totalPop = 0;
            for (var c in this.compartments) {
                next_d[c] = this.compartments[c].operation();
                this.compartments[c].pop = temp_pop[c] + (0.5 * (temp_d[c] + next_d[c]));
                this.totalPop += this.compartments[c].pop;
            }
        };
        return CompartmentModel;
    })();
    QEpiKit.CompartmentModel = CompartmentModel;
    var Compartment = (function () {
        function Compartment(name, pop, operation) {
            this.name = name;
            this.pop = pop;
            this.operation = operation || null;
            this.dpop = 0;
        }
        Compartment.prototype.update = function () {
            this.dpop = this.operation();
        };
        return Compartment;
    })();
    QEpiKit.Compartment = Compartment;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=compartment.js.map
var QEpiKit;
(function (QEpiKit) {
    var ContactPatch = (function () {
        function ContactPatch(name, capacity) {
            this.id = ContactPatch.createID();
            this.name = name;
            this.capacity = capacity;
            this.pop = 0;
            this.members = {};
        }
        ContactPatch.createID = function () {
            var id = ContactPatch.CID;
            ContactPatch.CID++;
            return id;
        };
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
                this.members[agent.id] = agent;
                for (var other in this.members) {
                    other = Number(other);
                    if (other !== agent.id && !isNaN(other)) {
                        contactValue = contactValueFunc(this.members[other], agent);
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
        ContactPatch.prototype.encounters = function (agent, precondition, contactFunc, resultKey) {
            contactFunc = contactFunc || ContactPatch.defaultContactF;
            for (var contact in this.members) {
                if (precondition.check(this.members[contact][precondition.key], precondition.value) && Number(contact) !== agent.id) {
                    this.members[agent.id][resultKey] = contactFunc(this.members[contact], agent);
                    ContactPatch.WIWArray.push({
                        patchID: this.id,
                        name: this.name,
                        infected: contact,
                        infectedAge: this.members[contact].age,
                        result: this.members[agent.id][resultKey],
                        resultKey: resultKey,
                        by: agent.id,
                        byAge: agent.age,
                        time: agent.time
                    });
                }
            }
        };
        ContactPatch.CID = 1;
        ContactPatch.WIWArray = [];
        return ContactPatch;
    })();
    QEpiKit.ContactPatch = ContactPatch;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=contactPatch.js.map
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
        return Epi;
    })();
    QEpiKit.Epi = Epi;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=epi.js.map
var QEpiKit;
(function (QEpiKit) {
    var GeoPatch = (function () {
        function GeoPatch(name, geoJSONurl, population) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.geoJSONurl = geoJSONurl;
            this.population = population;
            this.getGeoJSON();
        }
        GeoPatch.prototype.getGeoJSON = function () {
            var gjReq = new XMLHttpRequest();
            gjReq.open("GET", this.geoJSONurl, true);
            try {
                gjReq.send();
            }
            catch (err) {
                throw err;
            }
            gjReq.onreadystatechange = function () {
                if (gjReq.readyState == gjReq.DONE) {
                    this.geoJSON = gjReq.response;
                }
            };
        };
        GeoPatch.prototype.useCompartmentModel = function (model) {
            this.compartmentModel = model;
        };
        GeoPatch.prototype.setTravelMap = function (environment, map) {
            this.environment = environment;
            this.travelMap = map;
            for (var dest in map) {
                this.environment.geoNetwork[this.name][dest] = map[dest];
            }
        };
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
        HybridAutomata.prototype.update = function (step) {
            for (var i = 0; i < this.data.length; i++) {
                var agent = this.data[i];
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
                        temp[key] = this.flowMap[key][agent.currentMode](agent);
                        agent[key] = 0.5 * (temp[key] + this.flowMap[key][agent.currentMode](temp));
                    }
                }
            }
            this.time += step;
        };
        HybridAutomata.prototype.run = function (step, until, saveInterval) {
            this.time = 0;
            while (this.time <= until) {
                this.update(step);
                var rem = (this.time / step) % saveInterval;
                if (rem == 0) {
                    this.history.push(JSON.parse(JSON.stringify(this.data)));
                }
            }
        };
        HybridAutomata.prototype.assess = function () {
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
    var HTNPlanner = (function () {
        function HTNPlanner(name, root, data) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.root = root;
            this.data = data;
            this.time = 0;
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
        HTNPlanner.prototype.start = function (task) {
            var results = [];
            for (var i = 0; i < this.data.length; i++) {
                this.data[i].active = true;
                HTNPlanner.tick(this.root, task, this.data[i]);
                if (this.data[i].successList.length > 0) {
                    results[i] = this.data[i].successList;
                }
                else {
                    results[i] = false;
                }
                this.data[i].active = false;
            }
            return results;
        };
        HTNPlanner.prototype.update = function (step, task) {
            HTNPlanner.tick(this.root, task, this.data);
        };
        HTNPlanner.SUCCESS = 1;
        HTNPlanner.FAILED = 2;
        HTNPlanner.RUNNING = 3;
        return HTNPlanner;
    })();
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
            a = a || undefined;
            if (a === b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
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
    })();
    QEpiKit.Utils = Utils;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=utils.js.map