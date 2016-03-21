module QEpiKit {
  export class MarkovChain{
    public states:any[];
    public transitions: any[];
    private _randomFn:number();

    constructor(states:any[], transitions:any[], randomFN = Math.random){
      this.states = states;
      this.transitions = transitions;
      this._randomFn = randomFN;
    }

    update(){

    }
  }
}
