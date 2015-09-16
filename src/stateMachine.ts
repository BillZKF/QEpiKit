module QEpiKit {

  export class StateMachine extends QComponent implements Observer {
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

    update(step: number) {
      for (var d = 0; d < this.data.length; d++) {
        for (var s in this.data[d].states) {
          let state = this.data[d].states[s];
          this.states[state](step, this.data[d]);
          for (var i = 0; i < this.transitions.length; i++) {
            for (var j = 0; j < this.transitions[i].from.length; j++) {
              let trans = this.transitions[i].from[j];
              if (trans === this.data[d].states[s]) {
                let cond = this.conditions[this.transitions[i].name];
                let value;
                if(typeof(cond.value) === 'function'){
                  value = cond.value();
                } else {
                  value = cond.value;
                }
                let r = cond.check(this.data[d][cond.key], value);
                if (r === StateMachine.SUCCESS) {
                  this.data[d].states[s] = this.transitions[i].to;
                }
              }
            }
          }
        }
      this.data[d].time += step;
      }
      this.time += step;
    }

    checkTransitions(transitions): any[] {
      for (var t = 0; t < transitions.length; t++) {
        if (typeof transitions[t].from === 'string') {
          transitions[t].from = [transitions[t].from];
        }
      }
      return transitions;
    }

    assess(eventName: string) {

    }
  }
}
