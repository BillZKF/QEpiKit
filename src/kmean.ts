export class kMean {
    public centroids: any[];
    public limits: any;
    public iterations: number;
    public data: any[];
    public props: any[];

    constructor(data: any[], props: any[], k: number) {
        this.centroids = [];
        this.limits = {};
        this.iterations = 0;
        //create a limits obj for each prop
        props.forEach(p => {
            this.limits[p] = {
                min: 1e15,
                max: -1e15
            }
        });
        //set limits for each prop
        data.forEach(d => {
            props.forEach(p => {
                if (d[p] > this.limits[p].max) {
                    this.limits[p].max = d[p];
                }
                if (d[p] < this.limits[p].min) {
                    this.limits[p].min = d[p];
                }
            })
        })

        //create k random points
        for (let i = 0; i < k; i++) {
            this.centroids[i] = { count: 0 };
            props.forEach(p => {
                let centroid = Math.random() * this.limits[p].max + this.limits[p].min;
                this.centroids[i][p] = centroid;
            })
        }

        this.data = data;
        this.props = props;
    }

    update() {
        this._assignCentroid();
        this._moveCentroid();
    }

    run() {
        let finished = false;

        while (!finished) {
            this.update();
            this.centroids.forEach(c => {
                finished = c.finished;
            });
            this.iterations++;
        }
        return [this.centroids, this.data];
    }

    _assignCentroid() {
        this.data.forEach((d, j) => {
            let distances: any[] = [];
            let totalDist: any[] = [];
            let minDist: number;
            let minIndex: number;
            //foreach point, get the per prop distance from each centroid
            this.centroids.forEach((c, i) => {
                distances[i] = {};
                totalDist[i] = 0;
                this.props.forEach(p => {
                    distances[i][p] = Math.sqrt((d[p] - c[p]) * (d[p] - c[p]));
                    totalDist[i] += distances[i][p];
                })
                totalDist[i] = Math.sqrt(totalDist[i]);
            })
            minDist = Math.min.apply(null, totalDist);
            minIndex = totalDist.indexOf(minDist);
            d.centroid = minIndex;
            d.distances = distances;
            this.centroids[minIndex].count += 1;
        })
    }

    _moveCentroid() {
        this.centroids.forEach((c, i) => {
            let distFromCentroid = {};
            this.props.forEach(p => distFromCentroid[p] = []);
            //get the per prop distances from the centroid among its' assigned points
            this.data.forEach(d => {
                if (d.centroid === i) {
                    this.props.forEach(p => {
                        distFromCentroid[p].push(d[p]);
                    })
                }
            })

            //handle centroid with no assigned points (randomly assign new);
            if (c.count === 0) {
                this.props.forEach(p => {
                    distFromCentroid[p] = [Math.random() * this.limits[p].max + this.limits[p].min];
                })
                //console.log(i, ' was unassigned this time ', this.iterations, 'was assigned', distFromCentroid);
            }

            //get the sum and mean per property of the assigned points
            this.props.forEach(p => {
                let sum = distFromCentroid[p].reduce((prev: number, next: number) => {
                    return prev + next;
                }, 0)
                let mean = sum / distFromCentroid[p].length;
                //console.log(i, '\'s average dist was', mean, ' the current pos was ', c[p]);
                if (c[p] !== mean) {
                    c[p] = mean;
                    c.finished = false;
                    c.count = 0;
                } else {
                    c.finished = true;
                }
            })
        });
    }
}
