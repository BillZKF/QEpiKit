import {Experiment} from './experiment';
import {Environment} from './environment';
import {Chromasome, Gene} from './genetic';
import {RNGBurtle} from './random';
import {assignParam, scaleInv, scale} from './utils';

declare var jStat: any;
export class Evolutionary extends Experiment {
  public rng: any;
  public environment: Environment;
  public setup: any;
  public experimentLog: any[];
  public plans: any;
  public method: string = "normal"
  public population: Chromasome[];
  public mating: boolean;
  public params: any[];
  public target: any;
  public mutateRate: number;
  public improvement: number;
  public size: number;

  constructor(environment: Environment, setup: any, discrete: boolean = false, mating: boolean = true) {
    super(environment, setup)
    this.target = setup.evolution.target;
    this.method = setup.evolution.method || "normal";
    this.params = setup.experiment.params;
    this.size = setup.experiment.size;
    this.mating = mating;
    if (this.size < 2) {
      this.mating = false;
    }

    this.population = [];
    this.mutateRate = 0.5;
    for (let i = 0; i < this.size; i++) {
      let chroma = new Chromasome();
      for (let k = 0; k < this.params.length; k++) {
        //new Gene(this.ranges[k].range, this.method, this.rng)
        chroma.genes.push();
      }
      this.population.push(chroma);
    }
  }

  start(runs: number, step: number, until: number, prepCB?:Function) {
    let r = 0;
    while (r < runs) {
      this.prep(r, this.setup, prepCB);
      this.population.sort(this.ascSort);
      this.population = this.population.slice(0, this.size);
      this.experimentLog[this.experimentLog.length - 1].best = true;
      console.log("run " + r + " score :  mean = " + this.scoreMean(this.population) + '  sd = ' + this.scoreSD(this.population));
      r++;
    }
    this.improvement = this.improvementScore(this.experimentLog);
    return this.experimentLog;
  }

  getParams(chroma: Chromasome, cfg: any) {
    let out = {};
    for (let pm = 0; pm < this.params.length; pm++) {
      let cfgPm = this.params[pm];
      if (cfgPm.level === 'agents' || typeof cfgPm.level === 'undefined') {
        out[cfgPm.level + "_" + cfgPm.name] = scaleInv(chroma.genes[pm].code, cfgPm.range[0], cfgPm.range[1] - cfgPm.range[0]);
      } else {
        out[cfgPm.level + "_" + cfgPm.name] = scaleInv(chroma.genes[pm].code, cfgPm.range[0], cfgPm.range[1] - cfgPm.range[0]);
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

  prep(r: number, cfg: any, cb:Function) {
    let report;
    if (this.mating) {
      let topPercent = Math.round(0.1 * this.size) + 2; //ten percent of original size + 2
      let children = this.mate(topPercent);
      this.population = this.population.concat(children);
    }
    for (let i = 0; i < this.population.length; i++) {
      this.mutate(this.population[i], 1);
    }
    for (let j = 0; j < this.population.length; j++) {
      this.updateAssignment(cfg, this.population[j], this.params);
      super.prep(r, cfg, cb);
      this.environment.time = 0;
      report = this.report(r, cfg);
      this.population[j].score = this.cost(report, this.target);
      report.score = this.population[j].score;
      this.experimentLog.push(report);
    }
  }

  updateAssignment(cfg: any, chroma: Chromasome, parameters: any[]) {
    for (let pm = 0; pm < parameters.length; pm++) {
      let param = parameters[pm];
      switch (param.level) {
        case 'agents':
          cfg.agents[param.group].params[param.name].assign = scaleInv(chroma.genes[pm].code, param.range[0], param.range[1] - param.range[0]);
          break;
        case 'entities':
          cfg.entities[param.group][param.name] = scaleInv(chroma.genes[pm].code, param.range[0], param.range[1] - param.range[0]);
          break;
        default:
          cfg[param.level].params[param.group][param.name] = scaleInv(chroma.genes[pm].code, param.range[0], param.range[1] - param.range[0]);
          break;
      }
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

  improvementScore(log: any[], avgGeneration = true) {
    let N = log.length;
    let sum = 0;
    let ranked;
    if (avgGeneration) {
      ranked = this.genAvg(log, this.setup);
      N = ranked.length;
    } else {
      ranked = log.map((d, i) => { d.order = i; return d; });
    }
    ranked.sort(this.dscSort);
    ranked.map((d, i) => { d.rank = i; return d; });
    for (let i = 0; i < ranked.length; i++) {
      sum += Math.abs(ranked[i].order / N - ranked[i].rank / N)
    }
    return 1 - 2 * sum / N;
  }

  genAvg(log: any[], cfg:any) {
    let sums = {};
    let pops = {};
    let avgs = [];
    log.forEach((d) => {
      sums[d.run] = sums[d.run] + d.score || d.score;
      pops[d.run] = pops[d.run] + 1 || 1;
    })
    for (let run in sums) {
      avgs[run] = { order: run, score: sums[run] / pops[run] };
    }
    return avgs
  }

  centroid(pop){
    let centroid = [];
    for(let i = 0; i < this.params.length; i++){
      centroid[i] = jStat.mean(this.population.map((d) => { return d.genes[i].code}));
    }
    return centroid;
  }

  vectorScores(pop) {
    let vec = [];
    for (let i = 0; i < pop.length; i++) {
      vec[i] = pop[i].score;
    }
    return vec;
  }

  scoreMean(pop) {
    let vals = this.vectorScores(pop);
    return jStat.mean(vals);
  }

  scoreSD(pop) {
    let vals = this.vectorScores(pop);
    return jStat.stdev(vals);
  }

  weightedSum() {
    //must be sorted already
    let mean = this.scoreMean(this.population);
    let sd = this.scoreSD(this.population);
    let weights = this.population.map((p, idx) => {
      return (p.score - mean) / sd;
    });
    let sum = this.params.map((param, idx) => {
      return this.population.reduce((acc, current, currentIdx) => {
        return current.genes[idx].code * weights[currentIdx] + acc;
      }, 0)
    });
    return sum;
  }

  mate(parents: number): Chromasome[] {
    let numChildren = Math.min(2, Math.max(10, this.params.length));
    let children: Chromasome[] = [];
    for (let i = 0; i < numChildren; i++) {
      let child = new Chromasome();
      for (let j = 0; j < this.params.length; j++) {
        let gene = new Gene([this.params[j].range[0], this.params[j].range[1]], this.method, this.rng);
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
        let centroid = this.centroid([this.population[0], this.population[1]]);
        if (this.rng.random() > chance) {
            return;
        }
        for (let j = 0; j < chroma.genes.length; j++) {
            let gene = chroma.genes[j];
            let diff = best[j].code - gene.code;
            if (diff == 0 || this.method === 'normal') {
                gene.code += this.rng.normal(0, 1) * this.mutateRate;
            } else {
                gene.code += diff * this.mutateRate;
            }
            gene.code = Math.min(Math.max(0, gene.code), 1);
        }
    }
}
