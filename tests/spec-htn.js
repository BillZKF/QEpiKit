describe("Hierarchal Task Network module: ", function() {
  var TestPlanner, TestTask, TestStart, fail, succeed, goals;
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
    goals = [{
      key: "total",
      value: 150,
      check: QEpiKit.Utils.gtEq
    }];
    TestStart = new QEpiKit.HTNMethod("start-method", [succeed], []);
    TestTask = new QEpiKit.HTNRootTask("get-over-150-total", goals);
    TestPlanner = new QEpiKit.HTNPlanner('test-planner', TestStart, TestTask, agents);
  });

  describe("HTN Planner", function() {
    it("constructor should start at time 0 and with a UUID", function() {
      expect(TestPlanner.time).toBe(0);
      expect(TestPlanner.id.length).toBe(36);
    });

    it("start method should take a Task and return an array of summary results", function() {
      TestPlanner.run(1,4,1);
      expect(TestPlanner.history.length).toBe(5);
      expect(TestPlanner.history[4][1].active).toBe(false);
    });
  });

  describe("HTN root task", function(){
    it("evaluateGoals method should check if agent state fullfills all goal conditions", function(){
      var result = TestTask.evaluateGoal(agents[0]);
      expect(result).toBe(QEpiKit.HTNPlanner.FAILED);
    });

    it("should also be able to check other data to see if it fullfills goal conditions", function(){
      var other = {bread: 40};
      TestTask.goals = [{
        key: "bread",
        data: other,
        value: 39,
        check: QEpiKit.Utils.gtEq
      }];
      var result = TestTask.evaluateGoal(agents[0]);
      expect(result).toBe(QEpiKit.HTNPlanner.SUCCESS);
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
      TestPlanner.run(1,20,2);
      expect(TestPlanner.history[9][0].successList.length).not.toBe(0);
      expect(TestPlanner.history[9][1].successList.length).toBe(0);
    });

    it("should check a precondition, if fails, return failed", function() {
      //bad test
      TestSuccessOperator.preconditions.push(fail);
      TestPlanner.run(1,20,2);
      expect(TestPlanner.summary[0]).toBe(false);
      expect(TestPlanner.summary[1]).toBe(false);
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
      TestPlanner.run(1,20,2);
      expect(TestPlanner.summary[0]).not.toBe(false);
      expect(TestPlanner.summary[1]).toBe(false);
    });

    it("should check a precondition, if fails, return failed", function() {
      TestMethodA.preconditions.push(fail);
      TestPlanner.run(1,20,2);
      expect(TestPlanner.summary[0]).toBe(false);
      expect(TestPlanner.summary[1]).toBe(false);
    });

    it("should be able to assess without moving time", function() {
      TestPlanner.assess('assessTest');
      expect(TestPlanner.results.assessTest).toBeDefined();
      expect(TestPlanner.results.assessTest[0].length).toBe(3);
      expect(TestPlanner.results.assessTest[1]).toBe(false);
    });


  });
});
