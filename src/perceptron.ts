module mljs{
  export class Perceptron {
    id: string;
    bias:number;
    actFn:Function;
    derFn:Function;
    der: number;
    value: number;
    totalInput: number;
    totalBack : number;

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

    constructor(activationType: string = "tanh"){
      this.id = generateId();
      this.bias = 0.1;
      this.value = 0;
      this.der = 0;
      this.totalInput = 0;
      this.totalBack = 0;
      this.actFn = Perceptron.activationMethods[activationType];
      this.derFn = Perceptron.deriviteMethods[activationType];
    }
  }
}
