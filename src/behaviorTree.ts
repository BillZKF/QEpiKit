module QEpiKit {
  //Behavior Tree
  export class BehaviorTree {
    public static SUCCESS: number = 1;
    public static FAILED: number = 2;
    public static RUNNING: number = 3;

    public id: string;
    public time: number;
    public data: any[];
    public root: BTNode;
    public runningMem: any[];
    public history: any[];

    public static tick = function(node: BTNode, agent) {
      var state = node.operate(agent);
      if (state === BehaviorTree.RUNNING) {
        this.runningMem.push(node);
      }
      return state;
    }

    constructor(root: BTNode, data: any[]) {
      this.id = QEpiKit.Utils.generateUUID();
      this.root = root;
      this.data = data;
      this.time = 0;
    }

    start(agent) {
      var state;
      agent.active = true;
      while (agent.active === true) {
        state = BehaviorTree.tick(this.root, agent);
        agent.active = false;
      }
      return state;
    }

    update() {
      for (var d in this.data) {
        this.start(d);
      }
    }

    generateTimeData(step: number, limit: number, saveInterval: number) {
      var t = 0, rem;
      while (t <= limit) {
        rem = t % saveInterval;
        if (rem == 0) {
          this.data.map(function(d) {
            return d.time = t;
          });
          this.history.push(JSON.parse(JSON.stringify(this.data)));
        }
        this.time = t;
        this.update();
        t += step;
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
    public successess: number;
    constructor(name: string, children: BTNode[], successes: number) {
      super(name, children);
      this.type = "parallel";
      this.successess = successes;
      this.operate = function(agent) {
        var successes = [], failures = [], childState, majority;
        for (var child in this.children) {
          childState = BehaviorTree.tick(this.children[child], agent);
          if (childState === BehaviorTree.SUCCESS) {
            successes.push(childState);
          } else if (childState === BehaviorTree.FAILED) {
            failures.push(childState);
          } else if (childState === BehaviorTree.RUNNING){
            return BehaviorTree.RUNNING;
          }
        }
        if (successes.length >= this.success) {
          return BehaviorTree.SUCCESS;
        } else if (failures.length >= 1) {
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
