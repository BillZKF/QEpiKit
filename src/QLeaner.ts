module QEpiKit{
  export class QLearner{
    public Q : any[];
    public R : any[];
    public gamma : number;

    constructor(R: any[], gamma: number){
      this.R = R || [];
      this.Q = [];
      this.gamma = gamma;
    }

    update(){

    }

    add(state, action){
      this.Q[state][action] 
    }
  }
}
