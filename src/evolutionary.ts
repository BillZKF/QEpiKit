import {Experiment} from './experiment';
import {Environment} from './environment';
import {Chromasome, Gene} from './genetic';
import {RNGBurtle} from './random';
import {invNorm} from './utils';

declare var jStat: any;
export class Evolutionary extends Experiment {
    public rng: any;
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

    constructor(environment: Environment, setup: any, discrete: boolean = false, gradient: boolean = true, mating: boolean = true) {
        super(environment, setup)
        this.target = setup.evolution.target;
        this.ranges = setup.evolution.params;
        this.size = setup.experiment.size;
        this.mating = mating;
        if(this.size < 2){
          this.mating = false;
        }
        this.discrete = discrete;
        this.gradient = gradient;
        this.population = [];
        this.mutateRate = 0.03;
        for (let i = 0; i < this.size; i++) {
            let chroma = new Chromasome();
            for (let k = 0; k < this.ranges.length; k++) {
                chroma.genes.push(new Gene(this.ranges[k].range, this.discrete, this.rng));
            }
            this.population.push(chroma);
        }
    }

    start(runs: number, step: number, until: number) {
        let r = 0;
        while (r < runs) {
            this.prep(r, this.setup);
            this.population.sort(this.ascSort);
            this.population = this.population.slice(0, this.size);
            this.experimentLog[this.experimentLog.length - 1].best = this.population[0].score;
            console.log('best: ', this.experimentLog[this.experimentLog.length - 1].best);
            r++;
        }
        return this.experimentLog;
    }

    getParams(chroma:Chromasome, cfg:any){
      let out = {};
      for (let pm = 0; pm < this.ranges.length; pm++) {
          let cfgPm = this.ranges[pm];
          if (cfgPm.level === 'agents' || typeof cfgPm.level === 'undefined') {
            out[cfgPm.level+"_"+cfgPm.name] = invNorm(chroma.genes[pm].code, cfgPm.range[0], cfgPm.range[1]);
          } else {
            out[cfgPm.level+"_"+cfgPm.name] = invNorm(chroma.genes[pm].code, cfgPm.range[0], cfgPm.range[1]);
          }
      }
      return out;
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
        for (let i = 1; i < this.population.length; i++) {
            this.mutate(this.population[i], 1);
        }
        for (let j = 0; j < this.population.length; j++) {
            for (let pm = 0; pm < this.ranges.length; pm++) {
                let cfgPm = this.ranges[pm];
                let groupIdx;
                if (cfgPm.level === 'agents' || typeof cfgPm.level === 'undefined') {
                    cfg.agents[cfgPm.group].params[cfgPm.name].assign = invNorm(this.population[j].genes[pm].code, cfgPm.range[0], cfgPm.range[1]);
                } else {
                  cfg[cfgPm.level].params[cfgPm.group][cfgPm.name] = invNorm(this.population[j].genes[pm].code, cfgPm.range[0], cfgPm.range[1]);
                }
            }
            super.prep(r, cfg);
            this.environment.time = 0;
            let predict = this.report(r, cfg);
            this.population[j].score = this.cost(predict, this.target);
            this.experimentLog.push(predict);
        }
    }

    cost(predict, target) {
        let dev = 0;
        let dimensions = 0
        for (let key in target.means) {
            dev += target.means[key] - predict.means[key];
            dimensions++;
        }
        for (let key in target.freqs) {
            dev += target.freqs[key] - predict.freqs[key];
            dimensions++;
        }
        for (let key in target.model) {
            dev += target.model[key] - predict.model[key];
            dimensions++;
        }
        return Math.pow(dev, 2) / dimensions;
    }

    report(r: number, cfg: any) {
        return super.report(r, cfg);
    }

    mate(parents: number): Chromasome[] {
        let numChildren = 0.5 * this.ranges.length * this.ranges.length;
        let children: Chromasome[] = [];
        for (let i = 0; i < numChildren; i++) {
            let child = new Chromasome();
            for (let j = 0; j < this.ranges.length; j++) {
                let gene = new Gene([this.ranges[j].range[0], this.ranges[j].range[1]], this.discrete, this.rng);
                let rand = Math.floor(this.rng.random() * parents);
                let expressed = this.population[rand].genes.slice(j, j + 1);
                gene.code = expressed[0].code;
                child.genes.push(gene);
            }
            children.push(child);
        }
        return children;
    }

    mutate(chroma: Chromasome, chance: number) {
        let best = this.population[0].genes;
        if (this.rng.random() > chance) {
            return;
        }
        for (let j = 0; j < chroma.genes.length; j++) {
            let gene = chroma.genes[j];
            let diff: number;
            if (this.gradient) {
                diff = best[j].code - gene.code;
            } else {
                diff = this.rng.randRange(-1, 1);
            }

            let upOrDown = diff > 0 ? 1 : -1;
            if (!this.discrete) {
                if (diff == 0) {
                    gene.code += this.rng.normal( 0, 0.2) * this.mutateRate;
                } else {
                    gene.code += diff * this.mutateRate;
                }
            } else {
                gene.code += upOrDown;
            }
            gene.code = Math.min(Math.max(0, gene.code), 1);
        }
    }
}
