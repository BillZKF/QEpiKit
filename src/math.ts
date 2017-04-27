
export class Vector {
    constructor(array: number, size: number) {

    }
}


export class Matrix {
    constructor(mat: number[][]) {

    }
}


export class activationMethods {
    static ReLU(x: number) {
        return Math.max(x, 0);
    }
    static sigmoid(x: number) {
        return 1 / (1 + Math.exp(-x));
    }
    static tanh(x: number) {
        let val = (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
        return val;
    }
};

export class deriviteMethods {
    static ReLU(value: number) {
        let der = value <= 0 ? 0 : 1;
        return der;
    }
    static sigmoid(value: number) {
        let sig = activationMethods.sigmoid;
        return sig(value) * (1 - sig(value));
    }
    static tanh(value: number) {
        return 1 - Math.pow(activationMethods.tanh(value), 2);
    }
}

export function logistic(x: number, m: number, b: number, k: number) {
  var y = 1 / (m + Math.exp(-k * (x - b)));
  return y;
}

export function logit(x: number, m: number, b: number, k: number) {
  var y = 1 / Math.log(x / (1 - x));
  return y;
}

export function linear(x: number, m: number, b: number, k: number) {
  var y =  m * x + b;
  return y;
}

export function exponential(x: number, m: number, b: number, k: number) {
  var y = 1 - Math.pow(x, k) / Math.pow(1, k);
  return y;
}
