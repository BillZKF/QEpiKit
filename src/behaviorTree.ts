module QKit {

  export class BehaviorTree {
    public static SUCCESS : number = 1;
    public static FAILED : number = 2;
    public static RUNNING : number = 3;

    public time: number;
    public data: any[];
    public root: BTNode;
    public conditions: Condition[];
    public actions: Function[];
    public runningMem: any[];
    public history: any[];

    constructor(root: BTNode, data: any[], conditions: Condition[], actions: Function[]) {
      this.root = root;
      this.data = data;
      this.conditions = conditions;
      this.actions = actions;
      this.time = 0;
    }

    start(agentID: number) {
      this.data[agentID].active = true;
      var state;
      while (this.data[agentID].active === true) {
        state = BehaviorTree.tick(this.root, agentID);
        this.data[agentID].active = false;
      }
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

    public static fromJSON = function(json) {
      json = JSON.parse(json);
      var n;
      switch (json.type) {
        case "root":
          n = new BTRoot(json.id, json.children);
          break;
        case "selector":
          n = new BTSelector(json.id, json.children);
          break;
        case "sequence":
          n = new BTSequence(json.id, json.children);
          break;
        case "parallel":
          n = new BTParallel(json.id, json.children, json.number);
          break;
        case "condition":
          n = new BTCondition(json.id, json.condition);
          break;
        case "action":
          n = new BTAction(json.id, json.condition, json.action);
          break;
        default: ;
      }
      return n;
    }

    public static tick = function(node: BTNode, agentID: number) {
      var state = node.operate(agentID);
      if (state === 3) {
        this.runningMem.push(node);
      }
      return state;
    }
  }

  export class BTNode {
    public id: string;
    public state: number;
    public type: string;
    public operate: Function;
    constructor(id: string) {
      this.id = id;
    }
  }

  export class BTControlNode extends BTNode {
    public children: BTNode[];
    constructor(id: string, children: BTNode[]) {
      super(id);
      this.children = children;
    }
  }

  export class BTRoot extends BTControlNode {
    constructor(id: string, children: BTNode[]) {
      super(id, children);
      this.type = "root";
      this.operate = function(agentID) {
        var state = BehaviorTree.tick(this.children[0], agentID);
        return state;
      }
    }
  }

  export class BTSelector extends BTControlNode {
    constructor(id: string, children: BTNode[]) {
      super(id, children);
      this.type = "selector";
      this.operate = function(agentID) {
        var childState;
        for (var child in this.children) {
          childState = BehaviorTree.tick(this.children[child], agentID);
          if (childState === 3) {
            return 3;
          }
          if (childState === 1) {
            return 1;
          }
        }
        return 2;
      }
    }
  }

  export class BTSequence extends BTControlNode {
    constructor(id: string, children: BTNode[]) {
      super(id, children);
      this.type = "sequence";
      this.operate = function(agentID) {
        var childState;
        for (var child in this.children) {
          childState = BehaviorTree.tick(this.children[child], agentID);
          if (childState === 3) {
            return 3;
          }
          if (childState === 2) {
            return 2;
          }
        }
        return 1;
      }
    }
  }

  export class BTParallel extends BTControlNode {
    public successess: number;
    constructor(id: string, children: BTNode[], successes: number) {
      super(id, children);
      this.type = "parallel";
      this.successess = successes < children.length ? successes : children.length; //FIXME maybe this should just throw an error.
      this.operate = function(agentID) {
        var successes = [], failures = [], childState, majority;
        for (var child in this.children) {
          childState = BehaviorTree.tick(this.children[child], agentID);
          if (childState === 1) {
            successes.push(childState);
          }
          if (childState === 2) {
            failures.push(childState);
          }
        }
        majority = this.children.length / 2;
        if (successes.length >= majority) {
          return 1;
        } else if (failures.length >= majority) {
          return 2;
        } else {
          return 3;
        }
      }
    }
  }

  export class BTCondition extends BTNode {
    public condition: Condition;
    constructor(id: string, condition) {
      super(id);
      this.type = "condition";
      this.condition = condition;
      this.operate = function(agentID) {
        var state;
        state = condition.check(condition.data[agentID][condition.key], condition.value);
        return state;
      }
    }
  }

  export class BTAction extends BTNode {
    public condition: Condition;
    public action: Function;
    constructor(id: string, condition, action: Function) {
      super(id);
      this.type = "action";
      this.condition = condition;
      this.action = action;
      this.operate = function(agentID) {
        var state;
        state = condition.check(condition.data[agentID][condition.key], condition.value);
        if (state === 1) {
          this.action(condition.data[agentID]);
        }
        return state;
      }
    }
  }

}
