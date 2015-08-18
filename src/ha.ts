module QEpiKit {
  export class HybridAutomata extends QComponent implements Observer {
    public flowSet;
    public flowMap;
    public jumpSet;
    public jumpMap;
    public data: any[];
    public results: any[];

    constructor(name: string, data, flowSet, flowMap, jumpSet, jumpMap) {
      super(name);
      this.data = data;
      this.flowSet = flowSet;
      this.flowMap = flowMap;
      this.jumpSet = jumpSet;
      this.jumpMap = jumpMap;
    }

    update(step) {
      for (var i = 0; i < this.data.length; i++) {
        let agent = this.data[i];
        let temp = JSON.parse(JSON.stringify(agent));
        for (var mode in this.jumpSet) {
          let edge = this.jumpSet[mode];
          let edgeState = edge.check(agent[edge.key], edge.value);
          if (edgeState === QEpiKit.Utils.SUCCESS && mode != agent.currentMode) {
            try {
              agent[edge.key] = this.jumpMap[edge.key][agent.currentMode][mode](agent[edge.key]);
              agent.currentMode = mode;
            } catch (Err) {
              //no transition this direction;
              //console.log(Err);
            }
          }
          for (var key in this.flowMap) {
            temp[key] = this.flowMap[key][agent.currentMode](agent);
            agent[key] = 0.5 * (temp[key] + this.flowMap[key][agent.currentMode](temp));
          }
        }
      }
      this.time += step;
    }

    assess() {

    }
  }
}
