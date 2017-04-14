
abstract class Random {
    seed: number;
    called: number;
    constructor(seed) {
        this.seed = seed;
        this.called = 0;
    }

    abstract random(): number;


    randRange(min: number, max: number) {
        return (max - min) * this.random() + min;
    }

    pick(array: any[]) {
        return array[Math.floor(this.random() * array.length)];
    }

    /**
    *Below is adapted from jStat:https://github.com/jstat/jstat/blob/master/src/special.js
    **/

    randn() {
        var u, v, x, y, q;
        do {
            u = this.random();
            v = 1.7156 * (this.random() - 0.5);
            x = u - 0.449871;
            y = Math.abs(v) + 0.386595;
            q = x * x + y * (0.19600 * y - 0.25472 * x);
        } while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));
        return v / u;
    }

    randg(shape) {
        var oalph = shape;
        var a1, a2, u, v, x;

        if (!shape)
            shape = 1;

        if (shape < 1)
            shape += 1;
        a1 = shape - 1 / 3;
        a2 = 1 / Math.sqrt(9 * a1);
        do {
            do {
                x = this.randn();
                v = 1 + a2 * x;
            } while (v <= 0);
            v = v * v * v;
            u = this.random();
        } while (u > 1 - 0.331 * Math.pow(x, 4) &&
            Math.log(u) > 0.5 * x * x + a1 * (1 - v + Math.log(v)));
        // alpha > 1
        if (shape == oalph)
            return a1 * v;
        // alpha < 1
        do {
            u = this.random();
        } while (u === 0);
        return Math.pow(u, 1 / oalph) * a1 * v;
    }

    beta(alpha, beta) {
        var u = this.randg(alpha);
        return u / (u + this.randg(beta));
    }

    gamma(shape, scale) {
        return this.randg(shape) * scale;
    }

    logNormal(mu, sigma) {
        return Math.exp(this.randn() * sigma + mu);
    }



    normal(mean, std) {
        return this.randn() * std + mean;
    }

    poisson(l) {
        var p = 1, k = 0, L = Math.exp(-l);
        do {
            k++;
            p *= this.random();
        } while (p > L);
        return k - 1;
    }

    weibull(scale, shape) {
        return scale * Math.pow(-Math.log(this.random()), 1 / shape);
    }
}

/**
* Bob Jenkins' small noncryptographic PRNG (pseudorandom number generator) ported to JavaScript
* adapted from:
* https://github.com/graue/burtleprng
* which is from http://www.burtleburtle.net/bob/rand/smallprng.html
*/
export class RNGBurtle extends Random {
    seed: number;
    ctx: number[];
    constructor(seed: number) {
        super(seed);
        this.seed >>>= 0;
        this.ctx = new Array(4);
        this.ctx[0] = 0xf1ea5eed;
        this.ctx[1] = this.ctx[2] = this.ctx[3] = this.seed;
        for (var i = 0; i < 20; i++) {
            this.random();
        }
    }

    rot(x, k) {
        return (x << k) | (x >> (32 - k));
    }

    random() {
        var ctx = this.ctx;
        var e = (ctx[0] - this.rot(ctx[1], 27)) >>> 0;
        ctx[0] = (ctx[1] ^ this.rot(ctx[2], 17)) >>> 0;
        ctx[1] = (ctx[2] + ctx[3]) >>> 0;
        ctx[2] = (ctx[3] + e) >>> 0;
        ctx[3] = (e + ctx[0]) >>> 0;
        this.called += 1;
        return ctx[3] / 4294967296.0;
    }
}

/*
* xorshift7*, by François Panneton and Pierre L'ecuyer: 32-bit xor-shift random number generator
* adds robustness by allowing more shifts than Marsaglia's original three. It is a 7-shift generator with 256 bits, that passes BigCrush with no systmatic failures.
* Adapted from https://github.com/davidbau/xsrand
*/

export class RNGxorshift7 extends Random {
    seed: number
    x: number[];
    i: number;
    constructor(seed: number) {
        let j, w, X = [];
        super(seed);

        // Seed state array using a 32-bit integer.
        w = X[0] = this.seed;

        // Enforce an array length of 8, not all zeroes.
        while (X.length < 8) {
            X.push(0);
        }
        for (j = 0; j < 8 && X[j] === 0; ++j) {
            if (j == 8) {
                w = X[7] = -1;
            } else {
                w = X[j]
            }
        }
        this.x = X;
        this.i = 0;

        // Discard an initial 256 values.
        for (j = 256; j > 0; --j) {
            this.random();
        }
    }


    random() {
        let X = this.x, i = this.i, t, v, w, res;
        t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
        t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
        t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
        t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
        t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
        X[i] = v;
        this.i = (i + 1) & 7;
        res = (v >>> 0) / ((1 << 30) * 4)
        this.called += 1;
        return res;
    }
}
