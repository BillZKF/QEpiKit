import {Experiment} from './experiment';
import {Environment} from './environment';
import {Chromasome, Gene} from './genetic';
import {RNGBurtle} from './random';
import {assignParam} from './utils';

declare var jStat: any;
export class Evolve extends Experiment {
  public environment: Environment;
  public type: string = 'evolve';
  public rng: any;
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
      this.population[i] = { score: 1e6, params: [] };
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
    let prevStart = Math.min(0, run - cfg.experiment.size);
    this.population.sort(this.ascSort);
    this.population = this.population.slice(0, cfg.experiment.size);
    this.mutate(this.population, 1);
    this.genLog.push(this.genAvg(this.experimentLog.slice(prevStart, run), cfg))
    this.genLog[this.genLog.length - 1].order = this.genLog.length - 1;
    this.genLog[this.genLog.length - 1].score = this.scoreMean(this.population);
    this.genLog[this.genLog.length - 1].scoreSD = this.scoreSD(this.population);
    this.population = this.population.concat(this.mate(Math.min(4, this.population.length)));
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
    for (let i = 0; i < population.length; i++) {
      if (this.rng.random() > chance) {
        continue;
      }
      let best = population[0].params;
      let current = population[i].params;
      for (let p = 0; p < current.length; p++) {
        let diff = best[p].assign - current[p].assign;
        if (diff < 1e-15) {
          current[p].assign += this.rng.normal(0, 1) * this.mutateRate;
        } else {
          current[p].assign += diff * this.mutateRate;
        }
      }
    }
  }

  mate(parents: number) {
    let numChildren = Math.min(2, Math.max(10, this.population.length));
    let numParams = this.population[0].params.length;
    let children = [];
    for (let i = 0; i < numChildren; i++) {
      let child = { params: [], score: 0 };
      let p1 = Math.floor(this.rng.random() * parents);
      let p2 = Math.floor(this.rng.random() * parents);
      let split = Math.floor(this.rng.random() * numParams);
      child.params = [].concat(this.population[p1].params.slice(0, split), this.population[p2].params.slice(split, numParams));
      children.push(child);
    }
    console.log(children);
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
