declare var jStat: any;
import {QComponent} from './QComponent';

export class MHSampler extends QComponent {
    id: string;
    name: string;
    time: number;
    save: boolean;
    rng: any;
    kept: number = 0;
    fixed: any;
    data: any[];
    chain: any[];
    target: number[]
    constructor(name: string, rng: any, data: any[], target?: number[], save: boolean = true) {
        super(name);
        this.time = 0;
        this.rng = rng;
        this.data = data;
        this.chain = [];
        this.save = save;
        this.target = target;
    }

    update(agent: any, step: number) {
        let newProb = 0;
        agent.y = agent.proposal(agent, step, this.rng);
        if (typeof this.target !== 'undefined') {
            this.target.forEach((d) => {
                newProb += agent.lnProbF(agent, step, d);
            });
            newProb *= 1 / this.target.length;
        } else {
            newProb = agent.lnProbF(agent, step);
        }
        let diff = newProb - agent.lnProb;
        let u = this.rng.random();
        if (Math.log(u) <= diff || diff >= 0) {
            agent.lnProb = newProb;
            agent.x = agent.y;
        } else {
            this.kept += 1;
        }
        if (this.save === true) {
            this.chain.push({ id: agent.id, time: agent.time, x: agent.x });
        }

    }
}
