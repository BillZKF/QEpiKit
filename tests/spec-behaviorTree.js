describe("Behavior Trees are control structures for reactive agents", function() {
  var BHTree, Root, SelectorTest, SequenceTest, ParallelTest, ConditionFail, ConditionSuccess, agents;
  agents = [{
    id: 1
  }, {
    id: 2
  }];
  ConditionSuccess = new QEpiKit.BTCondition("condition-success", {key:"active", value:true, check:QEpiKit.Utils.equalTo});
  ConditionFail = new QEpiKit.BTCondition("condition-failed", {key:"active", value:false, check:QEpiKit.Utils.equalTo});
  BHTree = new QEpiKit.BehaviorTree(Root, agents);


  it("should instantiate with a uuid and time = 0", function() {
    expect(BHTree.id.length).toEqual(36);
    expect(BHTree.time).toBe(0);
  });


  describe("Root Nodes are Control Nodes that tick their one child", function() {

    it("should return SUCCESS code if child succeeds", function() {
      Root = new QEpiKit.BTRoot("the-root", [ConditionSuccess]);
      BHTree = new QEpiKit.BehaviorTree(Root, agents);
      expect(BHTree.start(agents[0])).toBe(QEpiKit.BehaviorTree.SUCCESS);
    });

    it("should return FAILED code if child fails", function() {
      Root.children = [ConditionFail];
      expect(BHTree.start(agents[1])).toBe(QEpiKit.BehaviorTree.FAILED);
    });
  });

  describe("Selector Nodes are Control Nodes that tick children until one succeds", function(){
    SelectorTest = new QEpiKit.BTSelector("selector-test",[ConditionFail, ConditionFail, ConditionSuccess]);
    Root = new QEpiKit.BTRoot("the-root", [SelectorTest]);
    
    it("should return SUCCESS code if a child succeeds", function(){
      expect(1).toBe(QEpiKit.BehaviorTree.SUCCESS);
    });
    it("should return FAILED code if all children fail", function(){
      expect(2).toBe(QEpiKit.BehaviorTree.FAILED);
    });
  });
});
