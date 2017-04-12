import { QComponent } from './QComponent';
import { generateUUID } from './utils';
//Hierarchal Task Network
export class HTNPlanner extends QComponent {
    static tick(node, task, agent) {
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
    }
    constructor(name, root, task, data) {
        super(name);
        this.root = root;
        this.data = data;
        this.summary = [];
        this.results = [];
        this.task = task;
    }
    update(agent, step) {
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
    }
}
export class HTNRootTask {
    constructor(name, goals) {
        this.name = name;
        this.goals = goals;
    }
    evaluateGoal(agent) {
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
    }
}
export class HTNNode {
    constructor(name, preconditions) {
        this.id = generateUUID();
        this.name = name;
        this.preconditions = preconditions;
    }
    evaluatePreConds(agent) {
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
    }
}
export class HTNOperator extends HTNNode {
    constructor(name, preconditions, effects) {
        super(name, preconditions);
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
}
export class HTNMethod extends HTNNode {
    constructor(name, preconditions, children) {
        super(name, preconditions);
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
}
//# sourceMappingURL=htn.js.map