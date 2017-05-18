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
    public improvement: number;
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
            this.experimentLog[this.experimentLog.length - 1].best = true;
            console.log('best: ', this.experimentLog[this.experimentLog.length - 1]);
            r++;
        }
        this.improvement = this.improvementScore(this.experimentLog);
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

    dscSort(a: any, b: any) {
        if (a.score > b.score) {
            return -1;
        } else if (a.score < b.score) {
            return 1;
        }
        return 0;
    }

    ascSort(a: any, b: any) {
        if (a.score > b.score) {
            return 1;
        } else if (a.score < b.score) {
            return -1;
        }
        return 0;
    }

    prep(r: number, cfg: any) {
        let report;
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
            report = this.report(r, cfg);
            this.population[j].score = this.cost(report, this.target);
            report.score = this.population[j].score;
            this.experimentLog.push(report);
        }
    }

    cost(predict, target) {
        let dev = 0;
        let dimensions = 0
        for (let key in target.means) {
            dev += Math.abs(target.means[key] - predict.means[key]);
            dimensions++;
        }
        for (let key in target.freqs) {
            dev += Math.abs(target.freqs[key] - predict.freqs[key]);
            dimensions++;
        }
        for (let key in target.model) {
            dev += Math.abs(target.model[key] - predict.model[key]);
            dimensions++;
        }
        return dev / dimensions;
    }

    report(r: number, cfg: any) {
        let report = super.report(r, cfg);
        return report;
    }

    improvementScore(log: any[], avgGeneration = true){
      let N = log.length;
      let sum = 0;
      let ranked;
        if(avgGeneration){
          ranked = this.genAvg(log);
          N = ranked.length;
        } else {
          ranked= log.map((d,i)=>{d.order = i; return d;});
        }
        ranked.sort(this.dscSort);
        ranked.map((d,i)=>{d.rank = i; return d;});
      for(let i = 0; i < ranked.length; i++){
        sum += Math.abs( ranked[i].order/ N - ranked[i].rank / N )
      }
      return 1 - 2 * sum / N;
    }

    genAvg(log: any[]){
      let sums = {};
      let pops = {};
      let avgs = [];
      log.forEach((d)=>{
        sums[d.run] = sums[d.run] + d.score || d.score;
        pops[d.run] = pops[d.run] + 1 || 1;
      })
      for(let run in sums){
        avgs[run] = {order: run, score:sums[run] / pops[run]};
      }
      return avgs
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
            let diff = best[j].code - gene.code;
            if (!this.discrete) {
                if (diff == 0 || !this.gradient) {
                    gene.code += this.rng.normal(0, 1) * this.mutateRate;
                } else {
                    gene.code += diff * this.mutateRate;
                }
            } else {
                let upOrDown = diff > 0 ? 1 : -1;
                gene.code += upOrDown;
            }
            gene.code = Math.min(Math.max(0, gene.code), 1);
        }
    }
}
