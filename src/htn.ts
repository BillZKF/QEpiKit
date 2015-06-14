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
      if(this.preconditions instanceof Array){
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
          if(task.evaluateGoal(agent)){
            agent.successList.push(this.name);
          }
          return true;
        } else {
          return false;
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
        if (this.evaluatePreConds(agent)) {
          for (var i = 0; i < this.subtasks.length; i++) {
            var state = HTN.tick(this.subtasks[i], task, agent);
          }
          return true;
        } else {
          return false;
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
    public static tick(node: HTNNode, task: HTNRootTask, agent) {
      if(agent.runningList){
        agent.runningList.push(node.name)
      } else {
        agent.runningList = [node.name];
        agent.successList = [];
      }
      var state = node.visit(agent, task)
      return state;
    }

    public static start(node: HTNNode, task: HTNRootTask, agents){
      for(var i = 0; i < agents.length; i++){
        HTN.tick(node, task, agents[i]);
      }
    }
  }
}
