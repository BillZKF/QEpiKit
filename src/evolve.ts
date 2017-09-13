import {Experiment} from './experiment';
import {Environment} from './environment';
import {Chromasome, Gene} from './genetic';
import {RNGBurtle} from './random';
import {assignParam, scale, scaleInv} from './utils';

declare var jStat: any;
export class Evolve extends Experiment {
  public environment: Environment;
  public type: string = 'evolve';
  public rng: any;
  public ranges: number;
  public setup: any;
  public currentCFG: any;
  public experimentLog: any[];
  public genLog: any[];
  public plans: any;
  public population: any[] = [];
  public target: any[];
  public improvement: number;
  public mutateRate: number = 0.5;

  constructor(environment: Environment, setup: any) {
    super(environment, setup);
    this.target = setup.evolution.target;
    for (let i = 0; i < this.setup.experiment.size; i++) {
      this.population[i] = { score: 1e16, params: [] };
      for (let p = 0; p < this.setup.experiment.params.length; p++) {
        let setParam = this.setup.experiment.params[p];
        this.population[i].params.push({
          level: setParam.level,
          group: setParam.group,
          name: setParam.name,
          assign: assignParam({}, setParam, setParam.name, this.rng)
        });
      }
    }
    this.ranges = this.setup.experiment.params.map((d) => {return d.distribution.params});
  }

  start(runs: number, step: number, until: number, prepCB?: Function) {
    var r = 0;
    runs = runs * this.setup.experiment.size;
    while (r < runs) {
      this.prep(r, this.setup, prepCB);
      this.environment.time = 0;
      this.environment.run(step, until, 0);
      this.experimentLog[r] = this.report(r, this.setup);
      this.after(r, this.setup);
      if (r % this.setup.experiment.size === 0 && r !== 0) {
        this.endGen(r, this.setup);
      }
      r++;
    }
    this.improvement = this.overall(this.genLog);
  }

  overall(genLog: any[]) {
    let N = genLog.length;
    let sum = 0;
    let ranked = genLog;
    ranked.sort(this.dscSort);
    ranked.map((d, i) => { d.rank = i; return d; });
    for (let i = 0; i < ranked.length; i++) {
      sum += Math.abs(ranked[i].order / N - ranked[i].rank / N)
    }
    return 1 - 2 * sum / N;
  }


  prep(run: number, setup: any, prepCB: Function) {
    setup.experiment.params = this.population[run % setup.experiment.size].params;
    super.updateAssignment(setup, setup.experiment.params);
    super.prep(run, setup, prepCB);
  }

  endGen(run, cfg) {
    let children;
    let prevStart = Math.min(0, run - cfg.experiment.size);
    this.population.sort(this.ascSort);
    this.population = this.population.slice(0, cfg.experiment.size);
    children = this.mate(Math.min(5, Math.max(2, Math.floor(this.population.length * 0.333))));
    this.mutate(this.population, 1);
    this.genLog.push(this.genAvg(this.experimentLog.slice(prevStart, run), cfg));
    this.genLog[this.genLog.length - 1].order = this.genLog.length - 1;
    this.genLog[this.genLog.length - 1].score = this.scoreMean(this.population);
    this.genLog[this.genLog.length - 1].scoreSD = this.scoreSD(this.population);
    this.population.splice(this.population.length - children.length - 1, children.length);
    this.population = this.population.concat(children);
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



  after(run, cfg) {
    this.population[run % cfg.experiment.size].score = this.cost(this.experimentLog[run], this.target);
    this.experimentLog[run].score = this.population[run % cfg.experiment.size].score;
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

  mutate(population: any[], chance: number) {
    for (let i = 1; i < population.length; i++) {
      if (this.rng.random() > chance) {
        continue;
      }
      let best = population[0].params;
      let current = population[i].params;
      for (let p = 0; p < current.length; p++) {
        let scaledB = scale(best[p].assign, this.ranges[p][0], this.ranges[p][1] - this.ranges[p][0]);
        let scaledC = scale(current[p].assign, this.ranges[p][0], this.ranges[p][1] - this.ranges[p][0]);
        let diff = scaledB - scaledC;
        if (diff === 0) {
          scaledC += this.rng.normal(0, 1e-8) * this.mutateRate;
        } else {
          scaledC += diff * this.mutateRate;
        }
          //clamp to uniform min and max.
          current[p].assign = scaleInv(Math.max(this.ranges[p][0], Math.min(scaledC, this.ranges[p][1])), this.ranges[p][0], this.ranges[p][1] - this.ranges[p][0]);
      }
    }
  }

  mate(parents: number) {
    let numParams = this.population[0].params.length;
    let numChildren = Math.max(Math.min(10, Math.max(2, Math.floor(this.population.length * 0.333))));
    let children = [];
    for (let i = 0; i < numChildren; i++) {
      let child = { params: [], score: 0 };
      let p1 = Math.floor(this.rng.random() * parents);
      let p2 = Math.floor(this.rng.random() * parents);
      if(p1 === p2){
        p2 = p2 === 0 ? parents - 1 : p2 - 1;
      }
      let split = Math.floor(this.rng.random() * numParams);
      child.params = [].concat(this.population[p1].params.slice(0, split), this.population[p2].params.slice(split, numParams));
      children.push(child);
    }
    return children;
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
}
