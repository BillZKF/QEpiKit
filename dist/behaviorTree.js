var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var QKit;
(function (QKit) {
    var BehaviorTree = (function () {
        function BehaviorTree(root, data, conditions, actions) {
            this.root = root;
            this.data = data;
            this.conditions = conditions;
            this.actions = actions;
            this.time = 0;
        }
        BehaviorTree.prototype.start = function (agentID) {
            this.data[agentID].active = true;
            var state;
            while (this.data[agentID].active === true) {
                state = BehaviorTree.tick(this.root, agentID);
                this.data[agentID].active = false;
            }
        };
        BehaviorTree.prototype.update = function () {
            for (var d in this.data) {
                this.start(d);
            }
        };
        BehaviorTree.prototype.generateTimeData = function (step, limit, saveInterval) {
            var t = 0, rem;
            while (t <= limit) {
                rem = t % saveInterval;
                if (rem == 0) {
                    this.data.map(function (d) {
                        return d.time = t;
                    });
                    this.history.push(JSON.parse(JSON.stringify(this.data)));
                }
                this.time = t;
                this.update();
                t += step;
            }
        };
        BehaviorTree.SUCCESS = 1;
        BehaviorTree.FAILED = 2;
        BehaviorTree.RUNNING = 3;
        BehaviorTree.fromJSON = function (json) {
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
        };
        BehaviorTree.tick = function (node, agentID) {
            var state = node.operate(agentID);
            if (state === 3) {
                this.runningMem.push(node);
            }
            return state;
        };
        return BehaviorTree;
    })();
    QKit.BehaviorTree = BehaviorTree;
    var BTNode = (function () {
        function BTNode(id) {
            this.id = id;
        }
        return BTNode;
    })();
    QKit.BTNode = BTNode;
    var BTControlNode = (function (_super) {
        __extends(BTControlNode, _super);
        function BTControlNode(id, children) {
            _super.call(this, id);
            this.children = children;
        }
        return BTControlNode;
    })(BTNode);
    QKit.BTControlNode = BTControlNode;
    var BTRoot = (function (_super) {
        __extends(BTRoot, _super);
        function BTRoot(id, children) {
            _super.call(this, id, children);
            this.type = "root";
            this.operate = function (agentID) {
                var state = BehaviorTree.tick(this.children[0], agentID);
                return state;
            };
        }
        return BTRoot;
    })(BTControlNode);
    QKit.BTRoot = BTRoot;
    var BTSelector = (function (_super) {
        __extends(BTSelector, _super);
        function BTSelector(id, children) {
            _super.call(this, id, children);
            this.type = "selector";
            this.operate = function (agentID) {
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
            };
        }
        return BTSelector;
    })(BTControlNode);
    QKit.BTSelector = BTSelector;
    var BTSequence = (function (_super) {
        __extends(BTSequence, _super);
        function BTSequence(id, children) {
            _super.call(this, id, children);
            this.type = "sequence";
            this.operate = function (agentID) {
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
            };
        }
        return BTSequence;
    })(BTControlNode);
    QKit.BTSequence = BTSequence;
    var BTParallel = (function (_super) {
        __extends(BTParallel, _super);
        function BTParallel(id, children, successes) {
            _super.call(this, id, children);
            this.type = "parallel";
            this.successess = successes < children.length ? successes : children.length;
            this.operate = function (agentID) {
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
                }
                else if (failures.length >= majority) {
                    return 2;
                }
                else {
                    return 3;
                }
            };
        }
        return BTParallel;
    })(BTControlNode);
    QKit.BTParallel = BTParallel;
    var BTCondition = (function (_super) {
        __extends(BTCondition, _super);
        function BTCondition(id, condition) {
            _super.call(this, id);
            this.type = "condition";
            this.condition = condition;
            this.operate = function (agentID) {
                var state;
                state = condition.check(condition.data[agentID][condition.key], condition.value);
                return state;
            };
        }
        return BTCondition;
    })(BTNode);
    QKit.BTCondition = BTCondition;
    var BTAction = (function (_super) {
        __extends(BTAction, _super);
        function BTAction(id, condition, action) {
            _super.call(this, id);
            this.type = "action";
            this.condition = condition;
            this.action = action;
            this.operate = function (agentID) {
                var state;
                state = condition.check(condition.data[agentID][condition.key], condition.value);
                if (state === 1) {
                    this.action(condition.data[agentID]);
                }
                return state;
            };
        }
        return BTAction;
    })(BTNode);
    QKit.BTAction = BTAction;
})(QKit || (QKit = {}));
//# sourceMappingURL=behaviorTree.js.map