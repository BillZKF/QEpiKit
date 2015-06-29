describe("Behavior Trees are control structures for reactive agents", function() {
  var BHTree, Root, SelectorTest, SequenceTest, ParallelTest, ConditionFail, ConditionSuccess, agents;
  agents = [{
    id: 1
  }, {
    id: 2
  }];
  //ConditionSuccess = new QEpiKit.BTCondition("condition-success", {key:"active", value:true, check:QEpiKit.Utils.equalTo});
  //ConditionFail = new QEpiKit.BTCondition("condition-failed", {key:"active", value:false, check:QEpiKit.Utils.equalTo});
  //SelectorTest = new QEpiKit.BTSelector("selector-test",[ConditionFail, ConditionFail]);
  //SequenceTest = new QEpiKit.BTSequence("sequence-test",[ConditionSuccess]);
  //Root = new QEpiKit.BTRoot("the-root", [SelectorTest, SequenceTest, ParallelTest]);
  BHTree = new QEpiKit.BehaviorTree(Root, agents);


  it("should instantiate with a uuid and time = 0", function() {
    expect(BHTree.id.length).toEqual(36);
    expect(BHTree.time).toBe(0);
  });


  describe("Root Nodes are Control Nodes that tick their one child", function() {
    ConditionSuccess = new QEpiKit.BTCondition("condition-success", {
      key: "active",
      value: true,
      check: QEpiKit.Utils.equalTo
    });

    it("should return SUCCESS code if child succeeds", function() {
      Root = new QEpiKit.BTRoot("the-root", [ConditionSuccess]);
      BHTree = new QEpiKit.BehaviorTree(Root, agents);
      expect(BHTree.start(agents[0])).toBe(QEpiKit.BehaviorTree.SUCCESS);
    });

    it("should return FAILED code if child fails", function() {
      ConditionFail = new QEpiKit.BTCondition("condition-failed", {
        key: "active",
        value: false,
        check: QEpiKit.Utils.equalTo
      });
      Root.children = [ConditionFail];
      expect(BHTree.start(agents[1])).toBe(QEpiKit.BehaviorTree.FAILED);
    });
  });

});
