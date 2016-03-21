module QEpiKit {
  export class QLearner {

    public name: string;
    public Q: any;
    public R: any;
    public goal: number;
    public gamma: number;
    private rawMax: number = 1;

    //TODO - change episode to update

    constructor(R: any, gamma: number, goal: number) {
      this.R = R;
      this.gamma = gamma;
      this.goal = goal;
      this.Q = {};
      for (var state in R) {
        this.Q[state] = {};
        for (var action in R[state]) {
          this.Q[state][action] = 0;
        }
      }
      this.gamma = gamma;
    }

    transition(state, action) {
      var bestAction = this.max(action);
      this.Q[state][action] = this.R[state][action] + (this.gamma * this.Q[action][bestAction]);
    }

    max(state) {
      var max = 0, maxAction = null;
      for (var action in this.Q[state]) {
        if (!maxAction) {
          max = this.Q[state][action];
          maxAction = action;
        } else if (this.Q[state][action] === max && (Math.random() > 0.5)) {
          max = this.Q[state][action]
          maxAction = action;
        } else if (this.Q[state][action] > max) {
          max = this.Q[state][action];
          maxAction = action;
        }
      }
      return maxAction;
    }

    possible(state) {
      var possible = [];
      for (var action in this.R[state]) {
        if (this.R[state][action] > -1) {
          possible.push(action);
        }
      }
      return possible[Math.floor(Math.random() * possible.length)];
    }

    episode(state) {
      this.transition(state, this.possible(state));
      return this.Q;
    }

    normalize() {
      for (var state in this.Q) {
        for (var action in this.Q[state]) {
          if (this.Q[action][state] >= this.rawMax) {
            this.rawMax = this.Q[action][state];
          }
        }
      }
      for (var state in this.Q) {
        for (var action in this.Q[state]) {
          this.Q[action][state] = Math.round(this.Q[action][state] / this.rawMax * 100);
        }
      }
    }
  }
}
