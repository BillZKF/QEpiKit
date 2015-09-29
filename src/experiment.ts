module QEpiKit {
  /**Batch run environments
  *
  */
  export class Experiment {
    public environment: Environment;
    public prepFunction: Function;
    public recordFunction: Function;
    public experimentLog: any[];
    public plans: any[];

    constructor(environment: Environment, prepFunction: Function, recordFunction: Function) {
      this.environment = environment;
      this.prepFunction = prepFunction;
      this.recordFunction = recordFunction;
      this.experimentLog = [];
      this.plans = [];
    }

    start(runs: number, step: number, until: number) {
      var r = 0;
      while (r < runs) {
        this.prepFunction(r);
        this.environment.time = 0;
        this.environment.run(step, until, 0);
        this.experimentLog[r] = this.recordFunction(r);
        r++;
      }
    }

    sweep(params:any, runsPer:number) {
      var expPlan = [];
      for (var prop in params) {
        for (var i = 0; i < params[prop].length; i++) {
          for (var k = 0; k < runsPer; k++) {
            expPlan.push({
              param: prop,
              value: params[prop][i],
              run: k
            });
          }
        }
      }
      this.plans = expPlan;
    }
  }
}
