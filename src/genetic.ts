import {normalize} from './utils';

export class Gene {
    score: number;
    code: number;
    constructor(range: number[], discrete: boolean, rng: any) {
        let val = rng.randRange(range[0], range[1]);
        if (!discrete) {
            this.code = normalize(val, range[0], range[1]);
        } else {
            this.code = Math.floor(val);
        }
    }
}

export class Chromasome {
    score: number;
    genes: Gene[] = [];
}
