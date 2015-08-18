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
        HTNPlanner.prototype.update = function (step) {
            for (var i = 0; i < this.data.length; i++) {
                this.data[i].active = true;
                HTNPlanner.tick(this.root, this.task, this.data[i]);
                if (this.data[i].successList.length > 0) {
                    this.summary[i] = this.data[i].successList;
                }
                else {
                    this.summary[i] = false;
                }
                this.data[i].active = false;
            }
            this.time += step;
        };
        HTNPlanner.prototype.run = function (step, until, saveInterval) {
            this.time = 0;
            while (this.time <= until) {
                var rem = (this.time / step) % saveInterval;
                if (rem == 0) {
                    this.history.push(JSON.parse(JSON.stringify(this.data)));
                }
                this.update(step);
            }
        };
        HTNPlanner.prototype.assess = function (eventName) {
            for (var i = 0; i < this.data.length; i++) {
                this.data[i].active = true;
                HTNPlanner.tick(this.root, this.task, this.data[i]);
                if (this.data[i].successList.length > 0) {
                    this.summary[i] = this.data[i].successList;
                }
                else {
                    this.summary[i] = false;
                }
                this.data[i].active = false;
            }
            this.results[eventName] = this.summary;
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