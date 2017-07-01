declare var jStat: any;

export class Gene {
    type: string;
    score: number;
    code: number;
    constructor(params: number[], type: string, rng: any) {
      switch(type){
        case 'normal': this.code = rng.normal(params[0], params[1]); break;
        default : this.code = rng.random(); break;
      }
    }
}


export class Chromasome {
    score: number;
    genes: Gene[] = [];
}
