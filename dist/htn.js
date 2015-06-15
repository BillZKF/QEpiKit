var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var QEpiKit;
(function (QEpiKit) {
    var HTNNode = (function () {
        function HTNNode(name, preconditions) {
            this.name = name;
            this.preconditions = preconditions;
        }
        HTNNode.prototype.evaluatePreConds = function (agent) {
            var result;
            if (this.preconditions instanceof Array) {
                for (var p = 0; p < this.preconditions.length; p++) {
                    result = this.preconditions[p].check(agent[this.preconditions[p].key], this.preconditions[p].value);
                    if (!result) {
                        return false;
                    }
                }
            }
            return true;
        };
        return HTNNode;
    })();
    QEpiKit.HTNNode = HTNNode;
    var HTNOperator = (function (_super) {
        __extends(HTNOperator, _super);
        function HTNOperator(name, preconditions, effects) {
            _super.call(this, name, preconditions);
            this.name = name;
            this.preconditions = preconditions;
            this.effects = effects;
            this.visit = function (agent, task) {
                if (this.evaluatePreConds(agent)) {
                    for (var i = 0; i < this.effects.length; i++) {
                        this.effects[i](agent);
                    }
                    if (task.evaluateGoal(agent.blackboard)) {
                        agent.successList.unshift(this.name);
                        return HTN.SUCCESS;
                    }
                    else {
                        return HTN.RUNNING;
                    }
                }
                else {
                    return HTN.FAILED;
                }
            };
        }
        return HTNOperator;
    })(HTNNode);
    QEpiKit.HTNOperator = HTNOperator;
    var HTNMethod = (function (_super) {
        __extends(HTNMethod, _super);
        function HTNMethod(name, preconditions, subtasks) {
            _super.call(this, name, preconditions);
            this.name = name;
            this.preconditions = preconditions;
            this.subtasks = subtasks;
            this.visit = function (agent, task) {
                agent.blackboard = JSON.parse(JSON.stringify(agent));
                if (this.evaluatePreConds(agent)) {
                    for (var i = 0; i < this.subtasks.length; i++) {
                        var state = HTN.tick(this.subtasks[i], task, agent);
                        if (state === HTN.SUCCESS) {
                            agent.successList.unshift(this.name);
                            return HTN.SUCCESS;
                        }
                    }
                    return HTN.FAILED;
                }
            };
        }
        return HTNMethod;
    })(HTNNode);
    QEpiKit.HTNMethod = HTNMethod;
    var HTNRootTask = (function () {
        function HTNRootTask(name, goals) {
            this.name = name;
            this.goals = goals;
        }
        HTNRootTask.prototype.evaluateGoal = function (agent) {
            var result;
            for (var p = 0; p < this.goals.length; p++) {
                result = this.goals[p].check(agent[this.goals[p].key], this.goals[p].value);
                if (!result) {
                    return false;
                }
            }
            return true;
        };
        return HTNRootTask;
    })();
    QEpiKit.HTNRootTask = HTNRootTask;
    var HTN = (function () {
        function HTN() {
        }
        HTN.tick = function (node, task, agent) {
            if (agent.runningList) {
                agent.runningList.push(node.name);
            }
            else {
                agent.runningList = [node.name];
                agent.successList = [];
            }
            var state = node.visit(agent, task);
            return state;
        };
        HTN.start = function (node, task, agents) {
            var results = [];
            for (var i = 0; i < agents.length; i++) {
                HTN.tick(node, task, agents[i]);
                if (agents[i].successList.length > 0) {
                    results[i] = agents[i].successList;
                }
                else {
                    results[i] = false;
                }
            }
            return results;
        };
        HTN.SUCCESS = 1;
        HTN.FAILED = 2;
        HTN.RUNNING = 3;
        return HTN;
    })();
    QEpiKit.HTN = HTN;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=htn.js.map