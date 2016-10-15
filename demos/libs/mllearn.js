var mljs;
(function (mljs) {
    class DecTree {
        constructor() {
            this.tree = {};
        }
        learn(data, labelKey) {
            this.props = Object.keys(data[0]);
        }
        tick(data, labelKey) {
            let freq = this.nominal(data, labelKey);
        }
        split(data) {
            for (let i = 0; i < this.props.length; i++) {
                if (typeof data[0][this.props[i]] === 'number') {
                }
                else {
                }
            }
        }
        nominal(data, prop) {
            let freq = mljs.frequencies(data, prop);
            let max = -1;
            freq.maxName = '';
            for (let name in freq) {
                if (freq[name] > max) {
                    freq.maxName = name;
                    max = freq[name];
                }
            }
            return freq;
        }
        numeric(data, prop) {
            let rng = range(data, prop);
        }
        classify(point) {
        }
    }
    mljs.DecTree = DecTree;
})(mljs || (mljs = {}));
var mljs;
(function (mljs) {
    class Gene {
        constructor(range, discrete) {
            let val = mljs.randRange(range[0], range[1]);
            if (!discrete) {
                this.code = mljs.normalize(val, range[0], range[1]);
            }
            else {
                this.code = Math.floor(val);
            }
        }
    }
    mljs.Gene = Gene;
    class Chromasome {
        constructor() {
            this.genes = [];
        }
    }
    mljs.Chromasome = Chromasome;
    class Genetic {
        constructor(size, ranges, target, cost, discrete = false, gradient = true) {
            this.ranges = ranges;
            this.target = target;
            this.discrete = discrete;
            this.cost = cost;
            this.size = size;
            this.gradient = gradient;
            this.population = [];
            for (let i = 0; i < this.size; i++) {
                let chroma = new Chromasome();
                for (let k = 0; k < ranges.length; k++) {
                    chroma.genes.push(new Gene(this.ranges[k], this.discrete));
                }
                this.population.push(chroma);
            }
        }
        run(generations, mating = false) {
            this.mutateRate = 0.01;
            this.mating = mating;
            while (generations--) {
                this.generation();
                this.population.sort(this.ascSort);
            }
            return this.population;
        }
        dscSort(a, b) {
            if (a.score > b.score) {
                return -1;
            }
            else if (a.score < b.score) {
                return 1;
            }
            return 0;
        }
        ascSort(a, b) {
            if (a.score > b.score) {
                return 1;
            }
            else if (a.score < b.score) {
                return -1;
            }
            return 0;
        }
        generation() {
            if (this.mating) {
                let topOnePercent = Math.round(0.01 * this.size) + 2;
                let children = this.mate(topOnePercent);
                this.population = this.population.concat(children);
            }
            for (let i = 0; i < this.population.length; i++) {
                this.mutate(this.population[i], 1);
            }
            for (let j = 0; j < this.population.length; j++) {
                this.population[j].score = this.cost(this.population[j], this.target);
            }
        }
        mate(parents) {
            let numChildren = 0.5 * this.ranges.length * this.ranges.length;
            let children = [];
            for (let i = 0; i < numChildren; i++) {
                let child = new Chromasome();
                for (let j = 0; j < this.ranges.length; j++) {
                    let gene = new Gene([this.ranges[j][0], this.ranges[j][1]], this.discrete);
                    let rand = Math.floor(Math.random() * parents);
                    let expressed = this.population[rand].genes.slice(j, j + 1);
                    gene.code = expressed[0].code;
                    child.genes.push(gene);
                }
                children.push(child);
            }
            return children;
        }
        mutate(chroma, chance) {
            if (Math.random() > chance) {
                return;
            }
            let best = this.population[0].genes;
            for (let j = 0; j < chroma.genes.length; j++) {
                let gene = chroma.genes[j];
                let diff;
                if (this.gradient) {
                    diff = best[j].code - gene.code;
                }
                else {
                    diff = mljs.randRange(-1, 1);
                }
                let upOrDown = diff > 0 ? 1 : -1;
                if (!this.discrete) {
                    gene.code += upOrDown * this.mutateRate * Math.random();
                }
                else {
                    gene.code += upOrDown;
                }
                gene.code = Math.min(Math.max(0, gene.code), 1);
            }
        }
    }
    mljs.Genetic = Genetic;
})(mljs || (mljs = {}));
var mljs;
(function (mljs) {
    class Network {
        constructor(data, labels, hiddenNum, el, activationType = "tanh") {
            this.el = el;
            this.iter = 0;
            this.correct = 0;
            this.hiddenNum = hiddenNum;
            this.learnRate = 0.01;
            this.actFn = Network.activationMethods[activationType];
            this.derFn = Network.deriviteMethods[activationType];
            this.init(data, labels);
        }
        learn(iterations, data, labels, render = 100) {
            this.correct = 0;
            for (let i = 0; i < iterations; i++) {
                let randIdx = Math.floor(Math.random() * data.length);
                this.iter++;
                this.forward(data[randIdx]);
                let max = -1;
                let maxIdx = Math.floor(Math.random() * this.values.length);
                this.values[this.values.length - 1].forEach((x, idx) => {
                    if (x > max) {
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
                if (this.iter % render === 0) {
                    this.renderGraph();
                }
                this.resetTotals();
            }
        }
        classify(data) {
            this.resetTotals();
            this.forward(data);
            return this.values[this.values.length - 1];
        }
        init(data, labels) {
            let inputs = [];
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
            this.values[this.hiddenNum.length + 1] = labels[0].map((l) => { return 0; });
            this.totals[this.hiddenNum.length + 1] = labels[0].map((l) => { return 0; });
            this.der[this.hiddenNum.length + 1] = labels[0].map((l) => { return 0; });
            this.derTotals[this.hiddenNum.length + 1] = labels[0].map((l) => { return 0; });
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
        forward(input) {
            this.values[0] = input;
            for (let wg = 0; wg < this.weights.length; wg++) {
                let srcVals = wg;
                let dstVals = wg + 1;
                for (let src = 0; src < this.weights[wg].length; src++) {
                    for (let dst = 0; dst < this.weights[wg][src].length; dst++) {
                        this.totals[dstVals][dst] += this.values[srcVals][src] * this.weights[wg][src][dst];
                    }
                }
                this.values[dstVals] = this.totals[dstVals].map((total, idx) => {
                    return this.actFn(total + this.biases[wg][idx]);
                });
            }
        }
        backward(labels) {
            for (let wg = this.weights.length - 1; wg >= 0; wg--) {
                let srcVals = wg;
                let dstVals = wg + 1;
                for (let src = 0; src < this.weights[wg].length; src++) {
                    let err = 0;
                    for (let dst = 0; dst < this.weights[wg][src].length; dst++) {
                        if (wg === this.weights.length - 1) {
                            err += labels[dst] - this.values[dstVals][dst];
                            this.der[dstVals][dst] = err;
                        }
                        else {
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
                this.biases[wg] = this.biases[wg].map((bias, idx) => {
                    return this.learnRate * this.der[dstVals][idx] + bias;
                });
            }
        }
        mse() {
            let err = 0;
            let count = 0;
            for (let j = 0; j < this.derTotals.length; j++) {
                err += this.derTotals[j].reduce((last, current) => {
                    count++;
                    return last + Math.pow(current, 2);
                }, 0);
            }
            return err / count;
        }
        renderGraph() {
            let elements = [];
            this.values.forEach((layer, lIdx) => {
                layer.forEach((node, nIdx) => {
                    elements.push({ data: { id: "l" + lIdx + 'n' + nIdx, label: node + ' : ' + this.der[lIdx][nIdx] } });
                });
            });
            this.weights.forEach((wg, wgIdx) => {
                let srcLy = wgIdx;
                let dstLy = wgIdx + 1;
                wg.forEach((src, srcIdx) => {
                    src.forEach((dst, dstIdx) => {
                        elements.push({ data: { id: "wg" + wgIdx + 'src' + srcIdx + 'dst' + dstIdx, source: 'l' + srcLy + 'n' + srcIdx, target: 'l' + dstLy + 'n' + dstIdx, label: dst + " : " + this.weightChanges[wgIdx][srcIdx][dstIdx] } });
                    });
                });
            });
            cytoscape({
                container: document.getElementById("graph"),
                elements: elements,
                layout: {
                    name: 'grid',
                    rows: this.values.length
                },
                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-color': '#666',
                            'label': 'data(label)'
                        }
                    }, {
                        selector: 'edge',
                        style: {
                            'background-color': '#333',
                            'label': 'data(label)'
                        }
                    }]
            });
        }
    }
    Network.activationMethods = {
        ReLU: function (x) {
            return Math.max(x, 0);
        },
        sigmoid: function (x) {
            return 1 / (1 + Math.exp(-x));
        },
        tanh: function (x) {
            let val = (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
            return val;
        }
    };
    Network.deriviteMethods = {
        ReLU: function (value) {
            let der = value <= 0 ? 0 : 1;
            return der;
        },
        sigmoid: function (value) {
            let sig = Network.activationMethods.sigmoid;
            return sig(value) * (1 - sig(value));
        },
        tanh: function (value) {
            return 1 - Math.pow(Network.activationMethods.tanh(value), 2);
        }
    };
    Network.costMethods = {
        sqErr: function (target, guess) {
            return guess - target;
        }
    };
    mljs.Network = Network;
})(mljs || (mljs = {}));
var mljs;
(function (mljs) {
    class Perceptron {
        constructor(activationType = "tanh") {
            this.id = mljs.generateId();
            this.bias = 0.1;
            this.value = 0;
            this.der = 0;
            this.totalInput = 0;
            this.totalBack = 0;
            this.actFn = Perceptron.activationMethods[activationType];
            this.derFn = Perceptron.deriviteMethods[activationType];
        }
    }
    Perceptron.activationMethods = {
        ReLU: function (x) {
            return Math.max(x, 0);
        },
        sigmoid: function (x) {
            return 1 / (1 + Math.exp(-x));
        },
        tanh: function (x) {
            let val = (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
            return val;
        }
    };
    Perceptron.deriviteMethods = {
        ReLU: function (value) {
            let der = value <= 0 ? 0 : 1;
            return der;
        },
        sigmoid: function (value) {
            let sig = mljs.Network.activationMethods.sigmoid;
            return sig(value) * (1 - sig(value));
        },
        tanh: function (value) {
            return 1 - Math.pow(mljs.Network.activationMethods.tanh(value), 2);
        }
    };
    mljs.Perceptron = Perceptron;
})(mljs || (mljs = {}));
var mljs;
(function (mljs) {
    function cor(data, x, y) {
        let coef = cov(data, x, y) / (sd(data, x) * sd(data, y));
        return coef;
    }
    mljs.cor = cor;
    function cov(data, x, y) {
        let meanX = mean(data, x);
        let meanY = mean(data, y);
        let total = 0;
        for (let j = 0; j < data.length; j++) {
            let sqDev = (data[j][x] - meanX) * (data[j][y] - meanY);
            total += sqDev;
        }
        return total / (data.length - 1);
    }
    mljs.cov = cov;
    function mean(data, key) {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i][key];
        }
        return sum / data.length;
    }
    mljs.mean = mean;
    function variance(data, key) {
        let mu = mean(data, key);
        let devs = [];
        for (let i = 0; i < data.length; i++) {
            devs[i] = { dev: Math.pow(data[i][key] - mu, 2) };
        }
        return mean(devs, 'dev');
    }
    mljs.variance = variance;
    function sd(data, key) {
        return Math.sqrt(variance(data, key));
    }
    mljs.sd = sd;
    function leastSquares(data, x, y) {
        let meanY = mean(data, y);
        let meanX = mean(data, x);
        let den = 0;
        let numer = 0;
        for (let i = 0; i < data.length; i++) {
            numer += (data[i][x] - meanX) * (data[i][y] - meanY);
            den += Math.pow(data[i][x] - meanX, 2);
        }
        let b1 = numer / den;
        let b0 = meanY - b1 * meanX;
        return [b0, b1];
    }
    mljs.leastSquares = leastSquares;
    function sqError(a, b) {
        let res = (a - b) * (a - b);
        return res;
    }
    mljs.sqError = sqError;
    function frequencies(data, key) {
        let result = {};
        for (let i = 0; i < data.length; i++) {
            let valueOcc = data[i][key];
            if (!(valueOcc in result)) {
                result[valueOcc] = 0;
            }
            result[valueOcc]++;
        }
        return result;
    }
    mljs.frequencies = frequencies;
})(mljs || (mljs = {}));
var mljs;
(function (mljs) {
    function generateId() {
        let i = 0;
        let chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let id = [];
        while (i < 4) {
            id[i] = chars[Math.floor(Math.random() * chars.length)];
            i++;
        }
        return id.join('');
    }
    mljs.generateId = generateId;
    function normalize(x, min, max) {
        let val = x - min;
        return val / (max - min);
    }
    mljs.normalize = normalize;
    function invNorm(x, min, max) {
        return (x * max - x * min) + min;
    }
    mljs.invNorm = invNorm;
    function randRange(min, max) {
        return (max - min) * Math.random() + min;
    }
    mljs.randRange = randRange;
    function getRange(data, prop) {
        let range = {
            min: 1e10,
            max: -1e10
        };
        for (let i = 0; i < data.length; i++) {
            if (range.min > data[i][prop]) {
                range.min = data[i][prop];
            }
            if (range.max < data[i][prop]) {
                range.max = data[i][prop];
            }
        }
        return range;
    }
    mljs.getRange = getRange;
    class Match {
        static gt(a, b) {
            if (a > b) {
                return true;
            }
            return false;
        }
        static ge(a, b) {
            if (a >= b) {
                return true;
            }
            return false;
        }
        static lt(a, b) {
            if (a < b) {
                return true;
            }
            return false;
        }
        static le(a, b) {
            if (a <= b) {
                return true;
            }
            return false;
        }
    }
    mljs.Match = Match;
})(mljs || (mljs = {}));
//# sourceMappingURL=mllearn.js.map