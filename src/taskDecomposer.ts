declare var jStat;
import {Network} from './network';
import { RNGBurtle } from './random';
export class TaskDecomposer {
  public rng: RNGBurtle;
  public training: any[];
  public labels: any[];
  public taskLibrary: any[];
  public networkParams: any;
  public bestNet: Network;
  public trainingSummary = [];
  
  constructor(exampleInputs, exampleTasks, taskLibrary, networkParams, rng = new RNGBurtle(Math.random())){
    this.training = exampleInputs;
    this.labels = exampleTasks;
    this.taskLibrary = taskLibrary;
    this.networkParams = networkParams;
    this.rng = rng;
  }

  train(samples=50, batches = 25, popSize = 25){
    let costFns = Object.keys(Network.costMethods);
    let actFns = Object.keys(Network.activationMethods);
    let topNet;
    let networks = [];
    let testResults = [];
    let summary = [];
    for(let i = 0; i < batches; i++){
      let topAccuracy = -100;
      let bottomAccuracy = 100;
      let sumAcc = 0;
      let lowestLoss = 1e9;
      for(let j = 0; j < popSize; j++){
        let act = actFns[Math.floor(this.rng.randRange(0, actFns.length))];
        let cost = costFns[Math.floor(this.rng.randRange(0, costFns.length))];
        let hidden = this.networkParams.hidden.map((layer) => { 
          return Math.floor(this.rng.randRange(layer[0],layer[1]));
        })
        if(i === 0){
          networks[j] = new Network(this.training, this.labels, hidden, act, cost);
        } else {
          networks[j] = new Network(this.training, this.labels, hidden, act, cost);
          if(Math.random() < 0.75){
            networks[j].copyNetwork(topNet);
            networks[j].actFn = topNet.actFn;
            networks[j].derFn = topNet.derFn;
            networks[j].costFn = topNet.costFn;
            networks[j].iter = topNet.iter;
          }
        }
        networks[j].learn(samples, this.training, this.labels);
        testResults[j] = networks[j].evaluate(this.training, this.labels);
        if(testResults[j].accuracy > topAccuracy){
          topAccuracy = testResults[j].accuracy;
          topNet = networks[j];
        }
        if(testResults[j].loss < lowestLoss){
          lowestLoss = testResults[j].loss;
           
        }

        if(testResults[j].accuracy < bottomAccuracy){
          bottomAccuracy = testResults[j].accuracy;
        }
        sumAcc += testResults[j].accuracy;
      }
      summary[i] = {lowestLoss: lowestLoss, meanAccuracy : sumAcc / popSize, mostAcc: topAccuracy, leastAcc: bottomAccuracy};
    }
    this.trainingSummary = summary;
    this.bestNet = topNet;
  }

  liveTrain(input, labels, callback){
    //console.log(input, labels)
    let result = this.bestNet.classify(input);
    let max = jStat.max(result);
    let labelIdx = result.indexOf(max);
    let label = '';
    for(let key in labels){
      if(labels[key] === labelIdx){
        label = key;
      }
    }
    
    callback(label)//.then((trueResult) => {
      //this.bestNet.backward(trueResult);
      //this.bestNet.updateWeights();
      //this.bestNet.resetTotals();
      //this.training.push(input);
      //this.labels.push(trueResult);
  }
}
