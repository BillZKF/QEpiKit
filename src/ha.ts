module QEpiKit {
  export class HybridAutomata extends QComponent {
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

    update(agent, step) {
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
          //second order integration
          let tempD = this.flowMap[key][agent.currentMode](agent[key]);
          temp[key] = agent[key] + tempD;
          agent[key] += 0.5 * (tempD + this.flowMap[key][agent.currentMode](temp[key]));
        }
      }
    }
  }
}
