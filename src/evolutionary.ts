module QEpiKit {
    export class Evolutionary extends Experiment {
        public environment: Environment;
        public setup: any;
        public experimentLog: any[];
        public plans: any;
        public population: Chromasome[];
        public discrete: boolean;
        public mating: boolean;
        public gradient: boolean;
        public ranges: any[];
        public target: any;
        public mutateRate: number;
        public size: number;

        constructor(environment: Environment, setup: any, discrete: boolean = false, gradient: boolean = true) {
            super(environment, setup)
            this.ranges = setup.evolution.params;
            this.size = setup.experiment.size;
            this.discrete = discrete;
            this.gradient = gradient;
            this.population = [];
            for (let i = 0; i < this.size; i++) {
                let chroma = new Chromasome();
                for (let k = 0; k < this.ranges.length; k++) {
                    chroma.genes.push(new Gene(this.ranges[k].ranges, this.discrete));
                }
                this.population.push(chroma);
            }
        }

        dscSort(a: Chromasome, b: Chromasome) {
            if (a.score > b.score) {
                return -1;
            } else if (a.score < b.score) {
                return 1;
            }
            return 0;
        }

        ascSort(a: Chromasome, b: Chromasome) {
            if (a.score > b.score) {
                return 1;
            } else if (a.score < b.score) {
                return -1;
            }
            return 0;
        }

        prep(r: number, cfg: any) {
            if (this.mating) {
                let topPercent = Math.round(0.1 * this.size) + 2; //ten percent of original size + 2
                let children = this.mate(topPercent);
                this.population = this.population.concat(children);
            }
            for (let i = 0; i < this.population.length; i++) {
                this.mutate(this.population[i], 1);
            }

            for (let j = 0; j < this.population.length; j++) {
                for(let pm = 0; pm < this.ranges.length; pm++){
                  let cfgPm = this.ranges[pm];
                  let groupIdx = cfg.agents.map((d,i) => {if (cfgPm.group == d.name) {return i;} });
                  let paramIdx = cfg.agents[groupIdx[0]].map((dd,ii) => {if (cfgPm.name == dd.name) {return ii;} })
                  cfg.agents[groupIdx[0]].params[paramIdx[0]] = Utils.invNorm(this.population[j].genes[pm].code, cfgPm.range[0], cfgPm.range[1]);
                }
                super.prep(r, cfg);
                let predict = this.report(r, cfg);
                this.population[j].score = this.cost(predict, this.target);
            }
        }

        cost(predict, target) {
            let dev = 0;
            for (let key in target.mean) {
                dev += Math.pow(target.mean[key] - predict.mean[key], 2);
            }
            return dev;
        }

        report(r:number, cfg:any) {
          return super.report(r, cfg);
        }

        mate(parents: number): Chromasome[] {
            let numChildren = 0.5 * this.ranges.length * this.ranges.length;
            let children: Chromasome[] = [];
            for (let i = 0; i < numChildren; i++) {
                let child = new Chromasome();
                for (let j = 0; j < this.ranges.length; j++) {
                    let gene = new Gene([this.ranges[j].range[0], this.ranges[j].range[1]], this.discrete);
                    let rand = Math.floor(Math.random() * parents);
                    let expressed = this.population[rand].genes.slice(j, j + 1);
                    gene.code = expressed[0].code;
                    child.genes.push(gene);
                }
                children.push(child);
            }
            return children;
        }

        mutate(chroma: Chromasome, chance: number) {
            if (Math.random() > chance) {
                return;
            }
            let best = this.population[0].genes;
            for (let j = 0; j < chroma.genes.length; j++) {
                let gene = chroma.genes[j];
                let diff: number;
                if (this.gradient) {
                    diff = best[j].code - gene.code;
                } else {
                    diff = Utils.randRange(-1, 1);
                }
                let upOrDown = diff > 0 ? 1 : -1;
                if (!this.discrete) {
                    gene.code += upOrDown * this.mutateRate * Math.random();
                } else {
                    gene.code += upOrDown;
                }
                gene.code = Math.min(Math.max(0, gene.code), 1);
            }
        }
    }
}
