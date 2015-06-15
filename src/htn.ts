module QEpiKit {
  //hierarchal task network
  export class HTNNode {
    public name: string;
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
      this.name = name;
      this.preconditions = preconditions;
      this.effects = effects;
      this.visit = function(agent, task: HTNRootTask) {
        if (this.evaluatePreConds(agent)) {
          for (var i = 0; i < this.effects.length; i++) {
            this.effects[i](agent);
          }
          if (task.evaluateGoal(agent.blackboard)) {
            agent.successList.unshift(this.name);
            return HTN.SUCCESS;
          } else {
            return HTN.RUNNING;
          }
        } else {
          return HTN.FAILED;
        }
      }
    }
  }

  export class HTNMethod extends HTNNode {
    public subtasks: HTNNode[];

    constructor(name: string, preconditions: any[], subtasks: HTNNode[]) {
      super(name, preconditions);
      this.name = name;
      this.preconditions = preconditions;
      this.subtasks = subtasks;
      this.visit = function(agent, task) {
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
      }
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


  export class HTN {
    public static SUCCESS : number = 1;
    public static FAILED : number = 2;
    public static RUNNING : number = 3;
    public static tick(node: HTNNode, task: HTNRootTask, agent) {
      if (agent.runningList) {
        agent.runningList.push(node.name)
      } else {
        agent.runningList = [node.name];
        agent.successList = [];
      }
      var state = node.visit(agent, task)
      return state;
    }

    public static start(node: HTNNode, task: HTNRootTask, agents) {
      var results = []
      for (var i = 0; i < agents.length; i++) {
        HTN.tick(node, task, agents[i]);
        if(agents[i].successList.length > 0){
          results[i] = agents[i].successList;
        } else {
          results[i] = false;
        }
      }
      return results;
    }
  }
}
