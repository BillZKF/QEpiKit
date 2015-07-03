describe("Hierarchal Task Network module: ", function() {
  var TestPlanner, TestTask, TestStart, fail, succeed;
  beforeEach(function() {
    agents = [{
      id: 1,
      state: "a",
      total: 10
    }, {
      id: 2,
      state: "a",
      total: 0
    }];
    fail = {
      key: "active",
      value: false,
      check: QEpiKit.Utils.equalTo
    };
    succeed = {
      key: "active",
      value: true,
      check: QEpiKit.Utils.equalTo
    };
    TestStart = new QEpiKit.HTNMethod("start-method", [succeed], []);
    TestTask = new QEpiKit.HTNRootTask("get-over-150-total", [{
      key: "total",
      value: 150,
      check: QEpiKit.Utils.gtEq
    }]);
    TestPlanner = new QEpiKit.HTNPlanner('test-planner', TestStart, agents);
  });

  describe("HTN Planner", function() {
    it("constructor should start at time 0 and with a UUID", function() {
      expect(TestPlanner.time).toBe(0);
      expect(TestPlanner.id.length).toBe(36);
    });

    it("start method should take a Task and return an array of results", function() {
      var results = TestPlanner.start(TestTask);
      expect(results.length).toBe(2);
      expect(results[0]).toBe(false);
    });
  });

  describe("HTN root task", function(){
    it("evaluateGoals method should check if agent state fullfills all goal conditions", function(){
      var result = TestTask.evaluateGoal(agents[0]);
      expect(result).toBe(QEpiKit.HTNPlanner.FAILED);
    });
  });

  describe("HTN Operator", function() {
    var TestSuccessOperator;
    beforeEach(function(){
      TestSuccessOperator = new QEpiKit.HTNOperator('success-op', [succeed], [function(a) {
        a.total += 145;
      }]);
      TestStart.children.push(TestSuccessOperator);
    });

    it("should check a precondition, if succeeds, test effect, then evaluate goal", function() {
      var results = TestPlanner.start(TestTask);
      expect(results[0]).not.toBe(false);
      expect(results[1]).toBe(false);
    });

    it("should check a precondition, if fails, return failed", function() {
      TestSuccessOperator.preconditions.push(fail);
      var results = TestPlanner.start(TestTask);
      expect(results[0]).toBe(false);
      expect(results[1]).toBe(false);
    });
  });

  describe("HTN Method", function() {
    var TestMethod;
    beforeEach(function(){
      TestSuccessOperatorA = new QEpiKit.HTNOperator('success-opA', [succeed], [function(a) {
        a.total += 145;
      }]);
      TestSuccessOperatorB = new QEpiKit.HTNOperator('success-opB', [succeed], [function(a) {
        a.total += 145;
      }]);
      TestMethodA = new QEpiKit.HTNMethod('method-a', [succeed], [TestSuccessOperatorA]);
      TestMethodB = new QEpiKit.HTNMethod('method-a', [succeed, fail], [TestSuccessOperatorB]);
      TestStart.children.push(TestMethodA);
      TestStart.children.push(TestMethodB);
    });

    it("should check a precondition, if succeeds, visit children", function() {
      var results = TestPlanner.start(TestTask);
      expect(results[0]).not.toBe(false);
      expect(results[1]).toBe(false);
    });

    it("should check a precondition, if fails, return failed", function() {
      TestMethodA.preconditions.push(fail);
      var results = TestPlanner.start(TestTask);
      expect(results[0]).toBe(false);
      expect(results[1]).toBe(false);
    });
  });
});
