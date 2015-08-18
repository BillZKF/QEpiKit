module QEpiKit {
  //Hierarchal Task Network
  export class HTNPlanner extends QComponent implements Observer {

    public root: HTNNode;
    public task: HTNRootTask;
    public data: any[];
    public summary: any[];
    public results: any[];

    static tick(node: HTNNode, task: HTNRootTask, agent) {
      if (agent.runningList) {
        agent.runningList.push(node.name);
      } else {
        agent.runningList = [node.name];
        agent.successList = [];
        agent.barrierList = [];
        agent.blackboard = [];
      }
      var state = node.visit(agent, task)
      return state;
    }

    constructor(name: string, root: HTNNode, task:HTNRootTask, data: any[]) {
      super(name);
      this.root = root;
      this.data = data;
      this.summary = [];
      this.results = [];
      this.task = task;
    }

    update(step:number) {
      //iterate each piece of data through the task network
      for (var i = 0; i < this.data.length; i++) {
        this.data[i].active = true;
        HTNPlanner.tick(this.root, this.task, this.data[i]);
        if (this.data[i].successList.length > 0) {
          this.summary[i] = this.data[i].successList;
        } else {
          this.summary[i] = false;
        }
        this.data[i].active = false;
      }
      this.time += step;
    }

    run(step: number, until: number, saveInterval: number) {
      this.time = 0;
      while (this.time <= until) {
        let rem = (this.time / step) % saveInterval;
        if (rem == 0) {
          this.history.push(JSON.parse(JSON.stringify(this.data)));
        }
        this.update(step);
      }
    }

    assess(eventName:string){
      //iterate each piece of data through the task network
      for (var i = 0; i < this.data.length; i++) {
        this.data[i].active = true;
        HTNPlanner.tick(this.root, this.task, this.data[i]);
        if (this.data[i].successList.length > 0) {
          this.summary[i] = this.data[i].successList;
        } else {
          this.summary[i] = false;
        }
        this.data[i].active = false;
      }
      this.results[eventName] = this.summary;
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
      var result, g;
      for (var p = 0; p < this.goals.length; p++) {
        g = this.goals[p];
        if(g.data){
          result = g.check(g.data[g.key], g.value);
        } else{
          result = g.check(agent[g.key], g.value);
        }
        return result;
      }
    }
  }

  export class HTNNode {
    public id: string;
    public name: string;
    public type: string;
    public preconditions: any[];
    public visit: Function;
    constructor(name: string, preconditions: any[]) {
      this.id = QEpiKit.Utils.generateUUID();
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
    public effects: any[];
    constructor(name: string, preconditions: any[], effects: void[]) {
      super(name, preconditions);
      this.type = "operator";
      this.effects = effects;
      this.visit = function(agent, task: HTNRootTask) {
        if (this.evaluatePreConds(agent) === HTNPlanner.SUCCESS) {

          for (var i = 0; i < this.effects.length; i++) {
            this.effects[i](agent.blackboard[0]);
          }

          if (task.evaluateGoal(agent.blackboard[0]) === HTNPlanner.SUCCESS) {
            agent.successList.unshift(this.name);
            return HTNPlanner.SUCCESS;
          } else {
            return HTNPlanner.RUNNING;
          }
        } else {
          agent.barrierList.unshift({name: this.name, conditions: this.preconditions});
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
        if (this.evaluatePreConds(agent) === HTNPlanner.SUCCESS) {
          for (var i = 0; i < this.children.length; i++) {
            var state = HTNPlanner.tick(this.children[i], task, agent);
            if (state === HTNPlanner.SUCCESS) {
              agent.successList.unshift(this.name);
              return HTNPlanner.SUCCESS;
            }
          }
        } else {
          agent.barrierList.unshift({name: this.name, conditions: this.preconditions});
        }
        return HTNPlanner.FAILED;
      }
    }
  }
}
