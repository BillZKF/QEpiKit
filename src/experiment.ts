module QEpiKit{
  export class Experiment{
    public environment: Environment;
    public prepFunction: Function;
    public recordFunction: Function;
    public experimentLog: any[];

    constructor(environment: Environment, prepFunction:Function, recordFunction:Function){
      this.environment = environment;
      this.prepFunction = prepFunction;
      this.recordFunction = recordFunction;
      this.experimentLog = [];
    }

    start(runs:number, step:number, until:number){
      var r = 0;
      while(r < runs){
        this.prepFunction(r);
        this.environment.time = 0;
        this.environment.run(step, until, 0);
        this.experimentLog[r] = this.recordFunction();
        r++;
      }
    }

  }
}
