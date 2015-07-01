describe("Behavior Trees are control structures for reactive agents", function() {
  var agents, ConditionSuccess, ConditionFail, Root, BHTree;
  beforeEach(function() {
    agents = [{
      id: 1,
      tested: false,
      state: "a"
    }, {
      id: 2,
      tested: false,
      state: "a"
    }];
    ConditionSuccess = new QEpiKit.BTCondition("condition-success", {
      key: "active",
      value: true,
      check: QEpiKit.Utils.equalTo
    });
    ConditionFail = new QEpiKit.BTCondition("condition-failed", {
      key: "active",
      value: false,
      check: QEpiKit.Utils.equalTo
    });
    Root = new QEpiKit.BTRoot("the-root", [ConditionSuccess]);
    BHTree = new QEpiKit.BehaviorTree(Root, agents);
  });

  it("should instantiate with a uuid and time = 0", function() {
    expect(BHTree.id.length).toEqual(36);
    expect(BHTree.time).toBe(0);
  });

  describe("Condition Nodes are Leaf Nodes that check a condition", function() {
    it("should return SUCCESS if the condition check matches the current agent state to the condition values", function() {
      agents[0].active = true;
      expect(QEpiKit.BehaviorTree.tick(ConditionSuccess, agents[0])).toBe(QEpiKit.BehaviorTree.SUCCESS);
    });

    it("should return FAIL if the condition check doesn't match the current agent state to the condition values", function() {
      agents[0].active = true;
      expect(QEpiKit.BehaviorTree.tick(ConditionFail, agents[0])).toBe(QEpiKit.BehaviorTree.FAILED);
    });
  });

  describe("Action Nodes are Leaf Nodes that check a condition, then perform an action", function() {
    it("should return SUCCESS if the condition check matches the current agent state to the condition values, and the value should change", function() {
      var ActionSuccess = new QEpiKit.BTAction("action-success", {
        key: "tested",
        value: false,
        check: QEpiKit.Utils.equalTo
      }, function(person) {
        person.tested = true;
      });
      expect(QEpiKit.BehaviorTree.tick(ActionSuccess, agents[0])).toBe(QEpiKit.BehaviorTree.SUCCESS);
    });
    it("should return FAILED if the condition check doesn't match the current agent state to the condition values, and the value should not change", function() {
      var ActionFail = new QEpiKit.BTAction("action-fail", {
        key: "tested",
        value: true,
        check: QEpiKit.Utils.equalTo
      }, function(person) {
        person.tested = true;
      });
      expect(QEpiKit.BehaviorTree.tick(ActionFail, agents[0])).toBe(QEpiKit.BehaviorTree.FAILED);
    });
  });

  describe("Root Nodes are Control Nodes that tick their one child", function() {

    it("should return SUCCESS code if child succeeds", function() {
      expect(BHTree.start(agents[1])).toBe(QEpiKit.BehaviorTree.SUCCESS);
    });

    it("should return FAILED code if child fails", function() {
      Root.children = [ConditionFail];
      expect(BHTree.start(agents[1])).toBe(QEpiKit.BehaviorTree.FAILED);
    });
  });

  describe("Selector Nodes are Control Nodes that tick children until one succeeds", function() {

    it("should return SUCCESS code if a child succeeds", function() {
      var SelectorTest = new QEpiKit.BTSelector("selector-test", [ConditionFail, ConditionFail, ConditionSuccess]);
      Root.children = [SelectorTest];
      expect(BHTree.start(agents[1])).toBe(QEpiKit.BehaviorTree.SUCCESS);
    });

    it("should return FAILED code if all children fail", function() {
      var SelectorTest = new QEpiKit.BTSelector("selector-test", [ConditionFail, ConditionFail]);
      Root.children = [SelectorTest];
      expect(BHTree.start(agents[1])).toBe(QEpiKit.BehaviorTree.FAILED);
    });
  });

  describe("Sequence Nodes are Control Nodes that tick children until one fails", function() {

    it("should return SUCCESS code if all children succeeds", function() {
      var SequenceTest = new QEpiKit.BTSequence("sequence-test", [ConditionSuccess, ConditionSuccess, ConditionSuccess, ConditionSuccess]);
      Root.children = [SequenceTest];
      expect(BHTree.start(agents[1])).toBe(QEpiKit.BehaviorTree.SUCCESS);
    });

    it("should return FAILED code if a child fails", function() {
      var SequenceTest = new QEpiKit.BTSequence("sequence-test", [ConditionFail]);
      Root.children = [SequenceTest];
      expect(BHTree.start(agents[0])).toBe(QEpiKit.BehaviorTree.FAILED);
    });
  });

  describe("Parllel Nodes are Control Nodes that tick all children and succeed or fail depending on a prespecified limit.", function() {

    it("should return SUCCESS code if at least 3 children succeed", function() {
      var ParallelTest = new QEpiKit.BTParallel("parallel-test", [ConditionSuccess, ConditionSuccess, ConditionFail, ConditionSuccess], 3);
      Root.children = [ParallelTest];
      expect(BHTree.start(agents[1])).toBe(QEpiKit.BehaviorTree.SUCCESS);
    });

    it("should return FAILED code if a child fails", function() {
      var ParallelTest = new QEpiKit.BTParallel("parallel-test", [ConditionSuccess, ConditionSuccess, ConditionFail, ConditionFail], 3);
      Root.children = [ParallelTest];
      expect(BHTree.start(agents[0])).toBe(QEpiKit.BehaviorTree.FAILED);
    });
  });

  describe("Methods for BT class", function() {
    it("should generateTimeData as an array that can be output to a csv.", function() {
      var ActionA = new QEpiKit.BTAction("action-a", {
        key: "state",
        value: "a",
        check: QEpiKit.Utils.equalTo
      }, function(person) {
        person.state = "b";
      });
      var ActionB = new QEpiKit.BTAction("action-b", {
        key: "state",
        value: "b",
        check: QEpiKit.Utils.equalTo
      }, function(person) {
        person.state = "a";
      });
      var SelectorTest = new QEpiKit.BTSelector("selector-test", [ActionA]);
      Root.children = [SelectorTest];
      BHTree.generateTimeData(1, 10, 1);
      expect(BHTree.record[0][0].state).toEqual("a");
      expect(BHTree.record[6][0].state).toEqual("b");
    });
  });
});
