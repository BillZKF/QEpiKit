module QEpiKit {
  //Hierarchal Task Network
  export class HTNPlanner {
    public static SUCCESS: number = 1;
    public static FAILED: number = 2;
    public static RUNNING: number = 3;

    public id: number;
    public name: string;
    public time: number;

    public static tick(node: HTNNode, task: HTNRootTask, agent) {
      if (agent.runningList) {
        agent.runningList.push(node.name)
      } else {
        agent.runningList = [node.name];
        agent.successList = [];
        agent.barrierList = [];
        agent.blackboard = [];
      }
      var state = node.visit(agent, task)
      return state;
    }

    public static start(startNode: HTNNode, task: HTNRootTask, agents) {
      //iterate each agent through the task network
      var results = []
      for (var i = 0; i < agents.length; i++) {
        HTNPlanner.tick(startNode, task, agents[i]);
        if (agents[i].successList.length > 0) {
          results[i] = agents[i].successList;
        } else {
          results[i] = false;
        }
      }
      return results;
    }
  }

  export class HTNRootTask {
    public name: string;
    public goals: any[];

    constructor(name: string, goals: any[]) {
      this.name = name;
      this.goals = goals;
    }

    evaluateGoal(agent) {
      var result;
      for (var p = 0; p < this.goals.length; p++) {
        result = this.goals[p].check(agent[this.goals[p].key], this.goals[p].value);
        if (!result) {
          return false;
        }
      }
      return true
    }
  }

  export class HTNNode {
    public name: string;
    public type: string;
    public preconditions: any[];
    public visit: Function;
    constructor(name: string, preconditions: any[]) {
      this.name = name;
      this.preconditions = preconditions;
    }

    evaluatePreConds(agent) {
      var result;
      if (this.preconditions instanceof Array) {
        for (var p = 0; p < this.preconditions.length; p++) {
          result = this.preconditions[p].check(agent[this.preconditions[p].key], this.preconditions[p].value);
          if (!result) {
            return false;
          }
        }
      }
      return true
    }
  }

  export class HTNOperator extends HTNNode {
    public effects: any[];
    constructor(name: string, preconditions: any[], effects: void[]) {
      super(name, preconditions);
      this.type = "operator";
      this.effects = effects;
      this.visit = function(agent, task: HTNRootTask) {
        if (this.evaluatePreConds(agent)) {
          for (var i = 0; i < this.effects.length; i++) {
            this.effects[i](agent.blackboard[0]);
          }
          if (task.evaluateGoal(agent.blackboard[0])) {
            agent.successList.unshift(this.name);
            return HTNPlanner.SUCCESS;
          } else {
            return HTNPlanner.RUNNING;
          }
        } else {
          agent.barrierList.unshift([this.name, this.preconditions]);
          return HTNPlanner.FAILED;
        }
      }
    }
  }

  export class HTNMethod extends HTNNode {
    public children: HTNNode[];

    constructor(name: string, preconditions: any[], children: HTNNode[]) {
      super(name, preconditions);
      this.type = "method";
      this.children = children;
      this.visit = function(agent, task) {
        var copy = JSON.parse(JSON.stringify(agent));
        delete copy.blackboard;
        agent.blackboard.unshift(copy);
        if (this.evaluatePreConds(agent)) {
          for (var i = 0; i < this.children.length; i++) {
            var state = HTNPlanner.tick(this.children[i], task, agent);
            if (state === HTNPlanner.SUCCESS) {
              agent.successList.unshift(this.name);
              return HTNPlanner.SUCCESS;
            }
          }
        } else {
          agent.barrierList.unshift([this.name, this.preconditions]);
        }
        return HTNPlanner.FAILED;
      }
    }
  }
}
