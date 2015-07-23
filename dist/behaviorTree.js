var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var QEpiKit;
(function (QEpiKit) {
    var BehaviorTree = (function () {
        function BehaviorTree(name, root, data) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.root = root;
            this.data = data;
            this.time = 0;
            this.record = [];
        }
        BehaviorTree.prototype.start = function (agent) {
            var state;
            agent.active = true;
            while (agent.active === true) {
                state = BehaviorTree.tick(this.root, agent);
                agent.active = false;
            }
            return state;
        };
        BehaviorTree.prototype.update = function () {
            var dataLen = this.data.length;
            for (var d = 0; d < dataLen; d++) {
                this.start(this.data[d]);
            }
        };
        BehaviorTree.prototype.run = function (step, until, saveInterval) {
            var rem;
            this.time = 0;
            while (this.time <= until) {
                rem = (this.time / step) % saveInterval;
                if (rem == 0) {
                    this.data.map(function (d) {
                        return d.time = this.time;
                    });
                    this.record.push(JSON.parse(JSON.stringify(this.data)));
                }
                this.update();
                this.time += step;
            }
        };
        BehaviorTree.SUCCESS = 1;
        BehaviorTree.FAILED = 2;
        BehaviorTree.RUNNING = 3;
        BehaviorTree.tick = function (node, agent) {
            var state = node.operate(agent);
            if (state === BehaviorTree.RUNNING) {
                this.runningMem.push(node);
            }
            return state;
        };
        return BehaviorTree;
    })();
    QEpiKit.BehaviorTree = BehaviorTree;
    var BTNode = (function () {
        function BTNode(name) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
        }
        return BTNode;
    })();
    QEpiKit.BTNode = BTNode;
    var BTControlNode = (function (_super) {
        __extends(BTControlNode, _super);
        function BTControlNode(name, children) {
            _super.call(this, name);
            this.children = children;
        }
        return BTControlNode;
    })(BTNode);
    QEpiKit.BTControlNode = BTControlNode;
    var BTRoot = (function (_super) {
        __extends(BTRoot, _super);
        function BTRoot(name, children) {
            _super.call(this, name, children);
            this.type = "root";
            this.operate = function (agent) {
                var state = BehaviorTree.tick(this.children[0], agent);
                return state;
            };
        }
        return BTRoot;
    })(BTControlNode);
    QEpiKit.BTRoot = BTRoot;
    var BTSelector = (function (_super) {
        __extends(BTSelector, _super);
        function BTSelector(name, children) {
            _super.call(this, name, children);
            this.type = "selector";
            this.operate = function (agent) {
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
            };
        }
        return BTSelector;
    })(BTControlNode);
    QEpiKit.BTSelector = BTSelector;
    var BTSequence = (function (_super) {
        __extends(BTSequence, _super);
        function BTSequence(name, children) {
            _super.call(this, name, children);
            this.type = "sequence";
            this.operate = function (agent) {
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
            };
        }
        return BTSequence;
    })(BTControlNode);
    QEpiKit.BTSequence = BTSequence;
    var BTParallel = (function (_super) {
        __extends(BTParallel, _super);
        function BTParallel(name, children, successes) {
            _super.call(this, name, children);
            this.type = "parallel";
            this.successes = successes;
            this.operate = function (agent) {
                var succeeded = [], failures = [], childState, majority;
                for (var child in this.children) {
                    childState = BehaviorTree.tick(this.children[child], agent);
                    if (childState === BehaviorTree.SUCCESS) {
                        succeeded.push(childState);
                    }
                    else if (childState === BehaviorTree.FAILED) {
                        failures.push(childState);
                    }
                    else if (childState === BehaviorTree.RUNNING) {
                        return BehaviorTree.RUNNING;
                    }
                }
                if (succeeded.length >= this.successes) {
                    return BehaviorTree.SUCCESS;
                }
                else {
                    return BehaviorTree.FAILED;
                }
            };
        }
        return BTParallel;
    })(BTControlNode);
    QEpiKit.BTParallel = BTParallel;
    var BTCondition = (function (_super) {
        __extends(BTCondition, _super);
        function BTCondition(name, condition) {
            _super.call(this, name);
            this.type = "condition";
            this.condition = condition;
            this.operate = function (agent) {
                var state;
                state = condition.check(agent[condition.key], condition.value);
                return state;
            };
        }
        return BTCondition;
    })(BTNode);
    QEpiKit.BTCondition = BTCondition;
    var BTAction = (function (_super) {
        __extends(BTAction, _super);
        function BTAction(name, condition, action) {
            _super.call(this, name);
            this.type = "action";
            this.condition = condition;
            this.action = action;
            this.operate = function (agent) {
                var state;
                state = condition.check(agent[condition.key], condition.value);
                if (state === BehaviorTree.SUCCESS) {
                    this.action(agent);
                }
                return state;
            };
        }
        return BTAction;
    })(BTNode);
    QEpiKit.BTAction = BTAction;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=behaviorTree.js.map