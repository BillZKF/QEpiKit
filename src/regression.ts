module QEpiKit {
    export function ols(ivs, dv) {
        let data = Utils.dataToMatrix(ivs, this.standardized);
        let dvData = dv.data;
        let n = dvData.length;

        let means = ivs.map((a) => { return a.mean; });
        let sds = ivs.map((a) => { return a.sd; });
        let vars = ivs.map((a) => { return [a.variance]; });
        means.unshift(1);
        sds.unshift(1);
        vars.unshift([1]);
        if (this.standardized) {
            dvData = Utils.standardized(dv.data);
        }
        let X = data;
        let Y = dvData.map((y) => { return [y]; });
        let Xprime = jStat.transpose(X);
        let XprimeX = jStat.multiply(Xprime, X);
        let XprimeY = jStat.multiply(Xprime, Y);

        //coefficients
        let b = jStat.multiply(jStat.inv(XprimeX), XprimeY);
        this.betas = b.reduce((a, b) => { return a.concat(b); });

        //standard error of the coefficients
        this.stErrCoeff = jStat.multiply(jStat.inv(XprimeX), vars)
            .reduce((a, b) => { return a.concat(b); });

        //t statistics
        this.tStats = this.stErrCoeff.map((se, i) => { return this.betas[i] / se });

        //p values
        this.pValues = this.tStats.map((t, i) => { return jStat.ttest(t, means[i], sds[i], n) });

        //residuals
        let yhat = [];
        let res = dv.data.map((d, i) => {
            data[i].shift();
            let row = data[i];
            yhat[i] = this.predict(row);
            return d - yhat[i];
        });
        let residual = yhat;
        return this.betas;
    }

    export function pls(x, y){

    }
}
