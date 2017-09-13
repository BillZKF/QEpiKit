declare var QActions, QEpiKit;
import {generateUUID, generatePop, addResources, assignParam, Match} from './utils';
import {Patch, CompartmentModel} from './compartment';
import {Environment} from './environment';
import {StateMachine} from './stateMachine';
import {RNGBurtle, RNGxorshift7} from './random';

/**
*Batch run environments
*/
export class Experiment {
  public environment: Environment;
  public type: string = 'sweep';
  public rng: any;
  public setup: any;
  public currentCFG: any;
  public experimentLog: any[];
  public genLog: any[];
  public plans: any;


  constructor(environment: Environment, setup?, target?) {
    this.environment = environment;
    this.setup = setup;
    this.rng = setup.experiment.rng === 'xorshift7' ? new RNGxorshift7(setup.experiment.seed) : new RNGBurtle(setup.experiment.seed);
    this.experimentLog = [];
    this.currentCFG = {};
    this.genLog = [];
  }

  start(runs: number, step: number, until: number, prepCB?: Function) {
    var r = 0;
    runs = runs * this.setup.experiment.size;
    while (r < runs) {
      this.prep(r, this.setup, prepCB);
      this.environment.time = 0;//
      this.environment.run(step, until, 0);
      this.experimentLog[r] = this.report(r, this.setup);
      this.after(r, this.setup);
      if (r % this.setup.experiment.size === 0 && r !== 0) {
        this.endGen(r, this.setup);
      }
      r++;
    }
  }

  prep(r: number, cfg: any, cb?: Function) {
    this.parseCFG(cfg);
    if (cb !== undefined) {
      cb();
    }
  }

  endGen(run, cfg){
    let prevStart = Math.min(0, run - cfg.experiment.size);
    this.genLog.push(this.genAvg(this.experimentLog.slice(prevStart, run), cfg))
    this.updateAssignment(cfg, cfg.experiment.params);
  }

  parseCFG(cfg) {
    let groups = {};
    let currentAgentId = 0;
    cfg = JSON.parse(JSON.stringify(cfg));
    cfg.boundaries = {};
    this.environment = new Environment();
    this.environment.rng = this.rng;

    if ('agents' in cfg) {
      for (let grName in cfg.agents) {
        let group = cfg.agents[grName];
        group.params.groupName = grName;
        this.environment.boundaries[grName] = group.boundaries;
        groups[grName] = generatePop(group.count, group.params, cfg.environment.spatialType, group.boundaries, currentAgentId, this.rng)
        currentAgentId = groups[grName][groups[grName].length - 1].id;
      }
    }

    if ('patches' in cfg) {
      cfg.patches.forEach((patch) => {
        this.environment.boundaries[patch.name] = patch.boundaries;
        patch.params = {groupName : patch.name};
        groups[patch.name] = generatePop(1, patch.params, cfg.environment.spatialType, patch.boundaries, currentAgentId, this.rng);
      })
    }

    if ('resources' in cfg) {
      let resources = [];
      for (let rsc in cfg.resources) {
        resources = addResources(resources, cfg.resources[rsc], cfg.resources[rsc].quantity);
      }
      this.environment.resources = resources;
    }
    if ('entities' in cfg) {
      for (let entity in cfg.entities) {
        for (let method in cfg.entities[entity].methods) {
          for(let p in cfg.entities[entity].params){
            //copy to outside for external references
            cfg.entities[entity][p] = cfg.entities[entity].params[p].assign;
          }
          cfg.entities[entity].methods[method] = QActions[method];
        }
        this.environment.entities[entity] = cfg.entities[entity];
      }
    }
    cfg.components.forEach((cmp) => {
      switch (cmp.type) {
        case 'state-machine':
          for (let state in cmp.states) {
            cmp.states[state] = QActions[cmp.states[state]];
          }
          for (let cond in cmp.conditions) {
            cmp.conditions[cond].check = Match[cmp.conditions[cond].check];
          }
          let sm = new StateMachine(cmp.name, cmp.states, cmp.transitions, cmp.conditions, groups[cmp.agents][0]);
          this.environment.add(sm);
          break;
        case 'compartmental':
          let patches = [];
          cfg.patches.forEach((patch) => {
            if (cmp.patches.indexOf(patch.name) != -1) {
              for (let compartment in cmp.compartments) {
                cmp.compartments[compartment].operation = QActions[cmp.compartments[compartment].operation];
              }
              let p = new Patch(patch.name, cmp.compartments, patch.populations);
              groups[patch.name][0][0] = Object.assign(groups[patch.name][0][0], p);
              patches.push(groups[patch.name][0][0]);
            }
          })
          let cModel = new CompartmentModel(cmp.name, cmp.compartments, patches);
          this.environment.add(cModel);
          break;
        case 'every-step':
          cmp.action = QActions[cmp.action];
          this.environment.add({
            id: generateUUID(),
            name: cmp.name,
            update: cmp.action,
            data: groups[cmp.agents][0]
          });
          break;
        default:
          break;
      }
    });
  }

  report(r: number, cfg: any) {
    let sums = {};
    let means = {};
    let freqs = {};
    let model = {}selu;
    let count = this.environment.agents.length;
    //cfg.report.sum = cfg.report.sum.concat(cfg.report.mean);
    for (let i = 0; i < this.environment.agents.length; i++) {
      let d = this.environment.agents[i];
      cfg.report.sums.forEach((s) => {
        sums[s] = sums[s] == undefined ? d[s] : d[s] + sums[s];
      });
      cfg.report.freqs.forEach((f) => {
        if (typeof d[f] === 'number' || typeof d[f] === 'boolean' && !isNaN(d[f])) {
          freqs[f] = freqs[f] == undefined ? 1 : d[f] + freqs[f];
        }
      })
      if ('compartments' in d) {
        cfg.report.compartments.forEach((cm) => {
          model[cm] = model[cm] == undefined ? d.populations[cm] : d.populations[cm] + model[cm];
        });
      }
    };
    cfg.report.means.forEach((m) => {
      means[m] = sums[m] / count;
    })
    return {
      run: r,
      cfg: this.currentCFG,
      count: count,
      sums: sums,
      means: means,
      freqs: freqs,
      model: model
    }
  }

  //on each run, change one param, hold others constant
  after(run, cfg) {

  }

  genAvg(logs: any[], cfg: any) {
    let sums = {};
    let freqs = {};
    let sumMeans = {};
    let means = {};
    logs.forEach((log) => {
      cfg.report.sums.forEach((s) => {
        sums[s] = sums[s] == undefined ? log.sums[s] : log.sums[s] + sums[s];
      });

      cfg.report.freqs.forEach((f) => {
        freqs[f] = freqs[f] == undefined ? log.freqs[f] : log.freqs[f] + freqs[f];
      });

      cfg.report.means.forEach((m) => {
        sumMeans[m] = sumMeans[m] == undefined ? log.means[m] : log.means[m] + sumMeans[m];
      });
    });

    cfg.report.means.forEach((m) => {
      means[m] = sumMeans[m] / logs.length;
    });

    cfg.report.freqs.forEach((f) => {
      means[f] = freqs[f] / logs.length;
    });

    return {
      means: means,
      sums: sums,
      freqs: freqs
    };
  }

  /*
  * Assign new environmental parameters from experimental parameters.
  */
  updateAssignment(cfg: any, parameters: any[]) {
    for (let pm = 0; pm < parameters.length; pm++) {
      let param = parameters[pm];
      let val = assignParam({}, param, param.name, this.rng);
      this.currentCFG[param.level] = this.currentCFG[param.level] || {};
      this.currentCFG[param.level][param.group] = this.currentCFG[param.level][param.group] || {};
      this.currentCFG[param.level][param.group][param.name] = val;
      switch (param.level) {
        case 'agents':
          if (param.group === 'boundaries') {
            cfg.agents.boundaries[param.name].assign = val;
          } else {
            cfg.agents[param.group].params[param.name].assign = val;
          }
          break;
        case 'entities':
          cfg.entities[param.group].params[param.name].assign = val;
          cfg.entities[param.group][param.name] = val;
          break;
        default:
          cfg[param.level].params[param.group][param.name] = val;
          break;
      }
    }
  }
}
