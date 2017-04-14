import { generateUUID } from './utils';
import { Patch, CompartmentModel } from './compartment';
import { Environment } from './environment';
import { StateMachine } from './stateMachine';
import { generatePop } from './utils';
/**
*Batch run environments
*/
export class Experiment {
    constructor(environment, setup, target) {
        this.environment = environment;
        this.setup = setup;
        this.target = setup.target;
        this.experimentLog = [];
    }
    start(runs, step, until) {
        var r = 0;
        while (r < runs) {
            this.prep(r, this.setup);
            this.environment.time = 0; //
            this.environment.run(step, until, 0);
            this.experimentLog[r] = this.report(r, this.setup);
            r++;
        }
    }
    prep(r, cfg, agents, visualize) {
        let groups = {};
        let currentAgentId = 0;
        this.environment = new Environment();
        if (typeof cfg.agents !== 'undefined') {
            cfg.agents.forEach((group) => {
                groups[group.name] = generatePop(group.count, group.params, cfg.environment.spatialType, group.boundaries, currentAgentId);
                currentAgentId = groups[group.name][groups[group.name].length - 1].id;
            });
        }
        cfg.components.forEach((cmp) => {
            switch (cmp.type) {
                case 'state-machine':
                    let sm = new StateMachine(cmp.name, cmp.states, cmp.transitions, cmp.conditions, groups[cmp.agents][0]);
                    this.environment.add(sm);
                    break;
                case 'compartmental':
                    let patches = [];
                    cfg.patches.forEach((patch) => {
                        if (cmp.patches.indexOf(patch.name) != -1) {
                            patches.push(new Patch(patch.name, cmp.compartments, patch.populations));
                        }
                    });
                    let cModel = new CompartmentModel('cmp.name', cmp.compartments, patches);
                    this.environment.add(cModel);
                    break;
                case 'every-step':
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
        switch (cfg.experiment) {
            default:
                if (r == null) {
                    visualize();
                }
                else {
                    //agents = this.environment.agents;
                    this.environment.run(cfg.environment.step, cfg.environment.until, 0);
                }
                break;
        }
    }
    report(r, cfg) {
        let sums = {};
        let means = {};
        let freqs = {};
        let model = {};
        let count = this.environment.agents.length;
        //cfg.report.sum = cfg.report.sum.concat(cfg.report.mean);
        for (let i = 0; i < this.environment.agents.length; i++) {
            let d = this.environment.agents[i];
            cfg.report.sums.forEach((s) => {
                sums[s] = sums[s] == undefined ? d[s] : d[s] + sums[s];
            });
            cfg.report.freqs.forEach((f) => {
                if (!isNaN(d[f]) && typeof d[f] != 'undefined') {
                    freqs[f] = freqs[f] == undefined ? d[f] : d[f] + freqs[f];
                }
            });
            if ('compartments' in d) {
                cfg.report.compartments.forEach((cm) => {
                    model[cm] = model[cm] == undefined ? d.populations[cm] : d.populations[cm] + model[cm];
                });
            }
        }
        ;
        cfg.report.means.forEach((m) => {
            means[m] = sums[m] / count;
        });
        return {
            count: count,
            sums: sums,
            means: means,
            freqs: freqs,
            model: model
        };
    }
    //on each run, change one param, hold others constant
    sweep(params, runsPer, baseline = true) {
        var expPlan = [];
        if (baseline === true) {
            params.baseline = [true];
        }
        for (var prop in params) {
            for (var i = 0; i < params[prop].length; i++) {
                for (var k = 0; k < runsPer; k++) {
                    expPlan.push({
                        param: prop,
                        value: params[prop][i],
                        run: k
                    });
                }
            }
        }
        this.plans = expPlan;
    }
    boot(params) {
        let runs;
        for (let param in params) {
            if (typeof runs === 'undefined') {
                runs = params[param].length;
            }
            if (params[param].length !== runs) {
                throw "length of parameter arrays did not match";
            }
        }
        this.plans = params;
    }
}
//# sourceMappingURL=experiment.js.map