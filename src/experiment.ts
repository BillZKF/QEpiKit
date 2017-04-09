module QEpiKit {
  /**Batch run environments
  *
  */
  export class Experiment {
    public environment: Environment;
    public setup: any;
    public target : any;
    public experimentLog: any[];
    public plans: any;


    constructor(environment: Environment,  setup?, target?) {
      this.environment = environment;
      this.setup = setup;
      this.target = setup.target;
      this.experimentLog = [];
    }

    start(runs: number, step: number, until: number) {
      var r = 0;
      while (r < runs) {
        this.prep(r, this.setup);
        this.environment.time = 0;//
        this.environment.run(step, until, 0);
        this.experimentLog[r] = this.report(r, this.setup);
        r++;
      }
    }

    prep(r:number, cfg:any, agents?, visualize?) {
        let groups = {};
        let currentAgentId = 0;
        this.environment = new QEpiKit.Environment();

        cfg.agents.forEach((group) => {
            //groups[group.name] = generatePop(group.count, group.params, cfg.environment.spatialType, group.boundaries, currentAgentId)
            currentAgentId = groups[group.name][groups[group.name].length - 1].id;
        });
        cfg.components.forEach((cmp) => {
            switch (cmp.type) {
                case 'state-machine':
                    let sm = new QEpiKit.StateMachine(cmp.name, cmp.states, cmp.transitions, cmp.conditions, groups[cmp.agents][0]);
                    this.environment.add(sm);
                    break;
                case 'every-step':
                    this.environment.add({
                        id: QEpiKit.Utils.generateUUID(),
                        name: cmp.name,
                        update: cmp.action,
                        data: groups[cmp.agents][0]
                    });
                    break;
                default:
                    break;
            }
        });

        switch(cfg.experiment) {
            default:
            if (r == null) {
                visualize();
            } else {
                agents = this.environment.agents;
                this.environment.run(cfg.environment.step, cfg.environment.until, 0);
            }

            break;

        }
    }

    report(r:number, cfg:any) {
        let sums = {};
        let means = {};
        let freq = {};
        let model = {};
        cfg.report.sum = cfg.report.sum.concat(cfg.report.mean);
        this.environment.agents.forEach((d, i) => {
            cfg.report.sum.forEach((s) => {
                sums[s] = sums[s] == undefined ? d[s] : d[s] + sums[s];
            });
            cfg.report.freq.forEach((f) => {
                freq[f] = freq[f] || {};
                freq[f][d[f]] = freq[f][d[f]] == undefined ? 1 : freq[f][d[f]] + 1;
            })
        });
        cfg.report.mean.forEach((m) => {
            means[m] = sums[m] / this.environment.agents.length;
        })
        return {
            count: this.environment.agents.length,
            sums: sums,
            means: means,
            freq: freq,
            model: model
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
