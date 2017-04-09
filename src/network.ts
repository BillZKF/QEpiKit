declare const cytoscape: any;

module QEpiKit {

    export class Network {
        learnRate: number;
        iter: number;
        correct: number;
        hiddenNum: number[];
        el: string;
        accuracy: number;
        values: any[];
        totals: any[];
        der: any[];
        derTotals: any[];
        biases: any[];
        weights: any[];
        actFn: Function;
        derFn: Function;
        weightChanges: any[]

        static activationMethods = {
            ReLU: function(x: number) {
                return Math.max(x, 0);
            },
            sigmoid: function(x: number) {
                return 1 / (1 + Math.exp(-x));
            },
            tanh: function(x:number){
              let val = (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
              return val;
            }
        };

        static deriviteMethods = {
            ReLU: function(value: number) {
                let der = value <= 0 ? 0 : 1;
                return der;
            },
            sigmoid: function(value: number) {
                let sig = Network.activationMethods.sigmoid;
                return sig(value) * (1 - sig(value));
            },
            tanh: function(value: number){
              return 1 - Math.pow(Network.activationMethods.tanh(value), 2);
            }
        }

        static costMethods = {
            sqErr: function(target: number, guess: number) {
                return guess - target;
            },
            absErr: function(){

            }
        }

        constructor(data: number[][], labels:number[][], hiddenNum: number[], el: string, activationType: string = "tanh") {
            this.el = el;
            this.iter = 0;
            this.correct = 0;
            this.hiddenNum = hiddenNum;
            this.learnRate = 0.01;
            this.actFn = Network.activationMethods[activationType];
            this.derFn = Network.deriviteMethods[activationType];
            this.init(data, labels);
        }

        learn(iterations: number, data: number[][], labels: number[][], render: number = 100) {
            this.correct = 0;
            for (let i = 0; i < iterations; i++) {
                let randIdx = Math.floor(Math.random() * data.length);
                this.iter++;
                this.forward(data[randIdx]);
                let max = -1;
                let maxIdx = Math.floor(Math.random() * this.values.length);
                this.values[this.values.length - 1].forEach((x:number, idx:number) => {
                  if(x > max){
                    maxIdx = idx;
                    max = x;
                  }
                });
                let guessed = this.values[this.values.length - 1][maxIdx] >= 0.5 ? 1 : 0;
                if (guessed === labels[randIdx][maxIdx]) {
                    this.correct++;
                }
                this.accuracy = this.correct / (i + 1);
                this.backward(labels[randIdx]);
                this.updateWeights();
                this.resetTotals();
            }
        }

        classify(data:number[]){
          this.resetTotals();
          this.forward(data);
          return this.values[this.values.length - 1];
        }

        init(data: number[][], labels:any[][]) {
            let inputs: any[] = [];
            this.der = [];
            this.values = [];
            this.weights = [];
            this.weightChanges = [];
            this.totals = [];
            this.derTotals = [];
            this.biases = [];

            for (let n = 0; n < data[0].length; n++) {
                inputs.push(0);
            }

            for (let col = 0; col < this.hiddenNum.length; col++) {
                this.der[col] = [];
                this.values[col] = [];
                this.totals[col] = [];
                this.derTotals[col] = [];
                for (let row = 0; row < this.hiddenNum[col]; row++) {
                    this.values[col][row] = 0;
                    this.der[col][row] = 0;
                    this.totals[col][row] = 0;
                    this.derTotals[col][row] = 0;
                }
            }

            this.values.unshift(inputs);
            this.totals.unshift(inputs);
            this.der.unshift(inputs);
            this.derTotals.unshift(inputs);
            this.values[this.hiddenNum.length + 1] = labels[0].map((l:number)=>{return 0});
            this.totals[this.hiddenNum.length + 1] =  labels[0].map((l:number)=>{return 0});
            this.der[this.hiddenNum.length + 1] =  labels[0].map((l:number)=>{return 0});
            this.derTotals[this.hiddenNum.length + 1] =  labels[0].map((l:number)=>{return 0});

            for (let wg = 0; wg < this.values.length - 1; wg++) {
                this.weights[wg] = [];
                this.weightChanges[wg] = [];
                this.biases[wg] = [];
                for (let src = 0; src < this.values[wg].length; src++) {
                    this.weights[wg][src] = [];
                    this.weightChanges[wg][src] = [];
                    for (let dst = 0; dst < this.values[wg + 1].length; dst++) {
                        this.biases[wg][dst] = Math.random() - 0.5;
                        this.weights[wg][src][dst] = Math.random() - 0.5;
                        this.weightChanges[wg][src][dst] = 0;
                    }
                }
            }
        }

        resetTotals() {
            for (let col = 0; col < this.totals.length; col++) {
                for (let row = 0; row < this.totals[col].length; row++) {
                    this.totals[col][row] = 0;
                    this.derTotals[col][row] = 0;
                }
            }
        }

        forward(input: number[]) {
            this.values[0] = input;
            for (let wg = 0; wg < this.weights.length; wg++) {
                let srcVals = wg;
                let dstVals = wg + 1;
                for (let src = 0; src < this.weights[wg].length; src++) {
                    for (let dst = 0; dst < this.weights[wg][src].length; dst++) {
                        this.totals[dstVals][dst] += this.values[srcVals][src] * this.weights[wg][src][dst];
                    }
                }
                this.values[dstVals] = this.totals[dstVals].map((total: number, idx: number) => {
                    return this.actFn(total + this.biases[wg][idx]);
                })
            }
        }

        backward(labels: number[]) {
            for (let wg = this.weights.length - 1; wg >= 0; wg--) {
                let srcVals = wg;
                let dstVals = wg + 1;
                for (let src = 0; src < this.weights[wg].length; src++) {
                    let err = 0;
                    for (let dst = 0; dst < this.weights[wg][src].length; dst++) {
                        if (wg === this.weights.length - 1) {
                            err += labels[dst] - this.values[dstVals][dst];
                            this.der[dstVals][dst] = err;
                        } else {
                            err += this.der[dstVals][dst] * this.weights[wg][src][dst];
                        }
                    }
                    this.derTotals[srcVals][src] = err;
                    this.der[srcVals][src] = err * this.derFn(this.values[srcVals][src]);
                }
            }
        }

        updateWeights() {
            for (let wg = 0; wg < this.weights.length; wg++) {
                let srcVals = wg;
                let dstVals = wg + 1;
                for (let src = 0; src < this.weights[wg].length; src++) {
                    for (let dst = 0; dst < this.weights[wg][src].length; dst++) {
                        let momentum = this.weightChanges[wg][src][dst] * 0.1;
                        this.weightChanges[wg][src][dst] = (this.values[srcVals][src] * this.der[dstVals][dst] * this.learnRate) + momentum;
                        this.weights[wg][src][dst] += this.weightChanges[wg][src][dst];
                    }
                }
                this.biases[wg] = this.biases[wg].map((bias: number, idx: number) => {
                    return this.learnRate * this.der[dstVals][idx] + bias;
                })
            }
        }

        mse() {
            let err: number = 0;
            let count: number = 0;
            for (let j = 0; j < this.derTotals.length; j++) {
                err += this.derTotals[j].reduce((last: number, current: number) => {
                    count++;
                    return last + Math.pow(current, 2)
                }, 0);
            }
            return err / count;
        }        
    }
}
