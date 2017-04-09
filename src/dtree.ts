module QEpiKit {
    // Based on the C 4.5 algorithm
    export class DecTree {
        public tree: any;
        public props: string[];

        constructor() {
          this.tree = {};
        }

        learn(data:any[], labelKey:string){
          this.props = Object.keys(data[0]);
        }

        tick(data:any[], labelKey:string){
          let freq = this.nominal(data, labelKey);
        }

        split(data: any[]) {
            for (let i = 0; i < this.props.length; i++) {
                if (typeof data[0][this.props[i]] === 'number') {

                } else {
                  //let criteria = nominal()
                }
            }
        }

        nominal(data:any[], prop:string){
          let freq = frequencies(data, prop);
          let max = -1;
          freq.maxName ='';
          for(let name in freq){
            if(freq[name] > max){
              freq.maxName = name;
              max = freq[name];
            }
          }
          return freq;
        }

        numeric(data:any[], prop:string){
          let rng = range(data, prop);
        }

        classify(point: any[]) {

        }
    }
}
