module QEpiKit{
  export class HybridAutomata{
    public flowSet;
    public flowMap;
    public jumpSet;
    public jumpMap;

    constructor(flowSet, flowMap, jumpSet, jumpMap){
      this.flowSet = flowSet;
      this.flowMap = flowMap;
      this.jumpSet = jumpSet;
      this.jumpMap = jumpMap;
    }

    update(agent, step){
      var temp = JSON.parse(JSON.stringify(agent));
      for (var mode in this.jumpSet) {
        var edge = this.jumpSet[mode];
        var edgeState = edge.check(agent[edge.key], edge.value);
        if (edgeState === QEpiKit.Utils.SUCCESS && mode != agent.currentMode) {
          try{
          agent[edge.key] = this.jumpMap[edge.key][agent.currentMode][mode](agent[edge.key]);
          agent.currentMode = mode;
        } catch(Err){
          //no transition this direction;
        }
        }
        for(var key in this.flowMap){
          temp[key] = this.flowMap[key][agent.currentMode](agent);
          agent[key] = 0.5 * (temp[key] + this.flowMap[key][agent.currentMode](temp));
        }
      }

    }
  }
}
