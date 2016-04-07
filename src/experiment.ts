module QEpiKit {
  /**Batch run environments
  * 
  */
  export class Experiment {
    public environment: Environment;
    public prepFunction: Function;
    public recordFunction: Function;
    public experimentLog: any[];
    public plans: any;

    constructor(environment: Environment, prepFunction: Function, recordFunction: Function) {
      this.environment = environment;
      this.prepFunction = prepFunction;
      this.recordFunction = recordFunction;
      this.experimentLog = [];
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
    //on each run, change one param, hold others constant
    sweep(params:any, runsPer:number, baseline = true) {
      var expPlan = [];
      if(baseline === true){
        params.baseline = [true];
      }
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

    boot(params:any){
      let runs;
      for(let param in params){
        if(typeof runs === 'undefined'){
          runs = params[param].length;
        }
        if(params[param].length !== runs){
          throw "length of parameter arrays did not match";
        }
      }
      this.plans = params;
    }
  }
}
