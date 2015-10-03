module QEpiKit {
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

    update(step: number) {
      var tmp = [], max = [], avg, top, dataLen = this.data.length;
      for (var d = 0; d < dataLen; d++) {
        max[d] = 0;
        for (var i = 0; i < this.options.length; i++) {
          tmp[i] = 0;
          for (var j = 0; j < this.options[i].considerations.length; j++) {
            let c = this.options[i].considerations[j];
            let x = c.x(this.data[d], this.options[i].params);
            tmp[i] += c.f(x, c.m, c.b, c.k);
          }
          avg = tmp[i] / this.options[i].considerations.length;

          this.results.push({point:d, opt: this.options[i].name, result: avg });
          if (avg > max[d]) {
            this.data[d].top = {name: this.options[i].name, util:avg};
            top = i;
            max[d] = avg;
          }
        }
        this.options[top].action(this.data[d]);
      }
      this.time += step;
    }
  }

  interface UtilityGroup {
    name: string;
    considerations: Consideration[];
    action(x): void;
    params: any;
  }

  interface Consideration {
    x(subject:any, optionParams:any): number;
    name: string;
    m: number;
    b: number;
    k: number;
    f(x,m,b,k): number;
  }

  export function logistic(x: number, m: number, b: number, k: number) {
    var y = 1 / (m + Math.exp(-k * (x - b)));
    return y;
  }

  export function logit(x: number, m: number, b: number, k: number) {
    var y = 1 / Math.log(x / (1 - x));
    return y;
  }

  export function linear(x: number, m: number, b: number, k: number) {
    var y =  1 / (m * x + b);
    return y;
  }

  export function exponential(x: number, m: number, b: number, k: number) {
    var y = 1 - (Math.pow(x, k) / Math.pow(1, k));
    return y;
  }

}
