module QEpiKit{

  export class StateMachine extends QComponent implements Observer{
    public states: any;
    public actions: any;
    public transitions : any[];
    public conditions: any;
    public data: any[];
    public results: any[];

    constructor(name:string, states:any, transitions: any[], conditions: any, data:any[]){
      super(name);
      this.states = states;
      this.transitions = transitions;
      this.data = data;
    }

    update(step:number){
      for(var d = 0; d < this.data.length; d++){
        this.states[this.data[d].current](step, this.data[d]);
        for(var i = 0; i < this.transitions.length; i++){
          if(this.transitions[i].from === this.data[d].current){
            let cond = this.conditions[this.transitions[i].name];
            let r = cond.check(this.data[d][cond.key], cond.value);
            if(r === StateMachine.SUCCESS){
              this.data[d].current = this.transitions[i].to;
            }
          }
        }
      }
    }

    assess(eventName:string){
      
    }
  }
}
