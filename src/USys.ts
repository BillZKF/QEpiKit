import {QComponent} from './QComponent';
  /*
  * Utility Systems class
  */
  export class USys extends QComponent {
    public options: UtilityGroup[];
    public results: any[];
    public data: any[];

    constructor(name: string, options: UtilityGroup[], data:any[]) {
      super(name);
      this.options = options;
      this.results = [];
      this.data = data;
    }

    update(agent:any,step: number) {
      var tmp = [], max = 0, avg, top;
        for (var i = 0; i < this.options.length; i++) {
          tmp[i] = 0;
          for (var j = 0; j < this.options[i].considerations.length; j++) {
            let c = this.options[i].considerations[j];
            let x = c.x(agent, this.options[i].params);
            tmp[i] += c.f(x, c.m, c.b, c.k);
          }
          avg = tmp[i] / this.options[i].considerations.length;

          this.results.push({point:agent.id, opt: this.options[i].name, result: avg });
          if (avg > max) {
            agent.top = {name: this.options[i].name, util:avg};
            top = i;
            max = avg;
          }
        }
        this.options[top].action(step, agent);
    }
  }

  interface UtilityGroup {
    name: string;
    considerations: Consideration[];
    //what actually happens if this is selected
    action(step, agent): void;
    params: any;
  }

  interface Consideration {
    //for this person
    x(subject:any, optionParams:any): number;
    name: string;
    m: number;
    b: number;
    k: number;
    f(x,m,b,k): number;
  }
