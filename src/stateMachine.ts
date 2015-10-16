module QEpiKit {

  export class StateMachine extends QComponent {
    public states: any;
    public actions: any;
    public transitions: any[];
    public conditions: any;
    public data: any[];
    public results: any[];

    constructor(name: string, states: any, transitions: any[], conditions: any, data: any[]) {
      super(name);
      this.states = states;
      this.transitions = this.checkTransitions(transitions);
      this.conditions = conditions;
      this.data = data;
    }

    update(agent:any, step: number) {
        for (var s in agent.states) {
          let state = agent.states[s];
          this.states[state](step, agent);
          for (var i = 0; i < this.transitions.length; i++) {
            for (var j = 0; j < this.transitions[i].from.length; j++) {
              let trans = this.transitions[i].from[j];
              if (trans === state) {
                let cond = this.conditions[this.transitions[i].name];
                let value;
                if(typeof(cond.value) === 'function'){
                  value = cond.value();
                } else {
                  value = cond.value;
                }
                let r = cond.check(agent[cond.key], value);
                if (r === StateMachine.SUCCESS) {

                  agent.states[s] = this.transitions[i].to;
                }
              }
            }
          }
        }
    }

    checkTransitions(transitions): any[] {
      for (var t = 0; t < transitions.length; t++) {
        if (typeof transitions[t].from === 'string') {
          transitions[t].from = [transitions[t].from];
        } else {
          //;
        }
      }
      return transitions;
    }
  }
}
