module QEpiKit {
  /**
  * Behavior Tree
  **/
  export class BehaviorTree extends QComponent {

    public data: any[];
    public results: any[];
    public root: BTNode;

    static tick(node: BTNode, agent) {
      var state = node.operate(agent);
      return state;
    }

    constructor(name: string, root: BTNode, data: any[]) {
      super(name);
      this.root = root;
      this.data = data;
      this.results = [];
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


    /** Assess the current state of the data under observation by evaluating the behavior tree.
    * @param eventName name of the event
    */
    assess(eventName){
      var dataLen = this.data.length;
      for (var d = 0; d < dataLen; d++) {
        this.start(this.data[d], 0);
      }
      this.results[eventName] = JSON.parse(JSON.stringify(this.data));
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
