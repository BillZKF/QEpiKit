module QEpiKit {
  //Behavior Tree
  export class BehaviorTree {
    public static SUCCESS: number = 1;
    public static FAILED: number = 2;
    public static RUNNING: number = 3;

    public id: string;
    public name: string;
    public time: number;
    public data: any[];
    public root: BTNode;
    public runningMem: any[];
    public record: any[];

    public static tick = function(node: BTNode, agent) {
      var state = node.operate(agent);
      if (state === BehaviorTree.RUNNING) {
        this.runningMem.push(node);
      }
      return state;
    }

    constructor(name: string, root: BTNode, data: any[]) {
      this.id = QEpiKit.Utils.generateUUID();
      this.name = name;
      this.root = root;
      this.data = data;
      this.time = 0;
      this.record = [];
    }

    start(agent, step: number) {
      var state;
      agent.active = true;
      while (agent.active === true) {
        state = BehaviorTree.tick(this.root, agent);
        agent.time = this.time;
        agent.active = false;
      }
      return state;
    }

    update(step:number) {
      var dataLen = this.data.length;
      for (var d = 0; d < dataLen; d++) {
        this.start(this.data[d], step);
      }
      this.time += step;
    }

    run(step: number, until: number, saveInterval: number) {
      var rem;
      this.time = 0;
      while (this.time <= until) {
        rem = (this.time / step) % saveInterval;
        if (rem == 0) {
          this.record.push(JSON.parse(JSON.stringify(this.data)));
        }
        this.update(step);
      }
    }
  }

  export class BTNode {
    public id: string;
    public name: string;
    public state: number;
    public type: string;
    public operate: Function;
    constructor(name: string) {
      this.id = QEpiKit.Utils.generateUUID();
      this.name = name;
    }
  }

  export class BTControlNode extends BTNode {
    public children: BTNode[];
    constructor(name: string, children: BTNode[]) {
      super(name);
      this.children = children;
    }
  }

  export class BTRoot extends BTControlNode {
    constructor(name: string, children: BTNode[]) {
      super(name, children);
      this.type = "root";
      this.operate = function(agent) {
        var state = BehaviorTree.tick(this.children[0], agent);
        return state;
      }
    }
  }

  export class BTSelector extends BTControlNode {
    constructor(name: string, children: BTNode[]) {
      super(name, children);
      this.type = "selector";
      this.operate = function(agent) {
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
      }
    }
  }

  export class BTSequence extends BTControlNode {
    constructor(name: string, children: BTNode[]) {
      super(name, children);
      this.type = "sequence";
      this.operate = function(agent) {
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
      }
    }
  }

  export class BTParallel extends BTControlNode {
    public successes: number;
    constructor(name: string, children: BTNode[], successes: number) {
      super(name, children);
      this.type = "parallel";
      this.successes = successes;
      this.operate = function(agent) {
        var succeeded = [], failures = [], childState, majority;
        for (var child in this.children) {
          childState = BehaviorTree.tick(this.children[child], agent);
          if (childState === BehaviorTree.SUCCESS) {
            succeeded.push(childState);
          } else if (childState === BehaviorTree.FAILED) {
            failures.push(childState);
          } else if (childState === BehaviorTree.RUNNING){
            return BehaviorTree.RUNNING;
          }
        }
        if (succeeded.length >= this.successes) {
          return BehaviorTree.SUCCESS;
        } else {
          return BehaviorTree.FAILED;
        }
      }
    }
  }

  export class BTCondition extends BTNode {
    public condition: Condition;
    constructor(name: string, condition) {
      super(name);
      this.type = "condition";
      this.condition = condition;
      this.operate = function(agent) {
        var state;
        state = condition.check(agent[condition.key], condition.value);
        return state;
      }
    }
  }

  export class BTAction extends BTNode {
    public condition: Condition;
    public action: Function;
    constructor(name: string, condition, action: Function) {
      super(name);
      this.type = "action";
      this.condition = condition;
      this.action = action;
      this.operate = function(agent) {
        var state;
        state = condition.check(agent[condition.key], condition.value);
        if (state === BehaviorTree.SUCCESS) {
          this.action(agent);
        }
        return state;
      }
    }
  }
}
