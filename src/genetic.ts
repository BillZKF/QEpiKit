module QEpiKit {
    export class Gene {
        score: number;
        code: number;
        constructor(range: number[], discrete: boolean) {
            let val = Utils.randRange(range[0], range[1]);
            if (!discrete) {
                this.code = Utils.normalize(val, range[0], range[1]);
            } else {
                this.code = Math.floor(val);
            }
        }
    }

    export class Chromasome {
        score: number;
        genes: Gene[] = [];
    }

    export class Genetic {
        population: Chromasome[];
        discrete: boolean;
        mating: boolean;
        gradient: boolean;
        ranges: number[][];
        target: number[];
        mutateRate: number;
        size: number;
        cost: (gene: Chromasome, target: number[]) => number;

        constructor(size: number, ranges: number[][], target: number[], cost: () => number, discrete: boolean = false, gradient: boolean = true) {
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

        run(generations: number, mating: boolean = false) {
            this.mutateRate = 0.01;
            this.mating = mating;
            while (generations--) {
                this.generation();
                this.population.sort(this.ascSort);
            }
            return this.population;
        }


        dscSort(a: Chromasome, b: Chromasome) {
            if (a.score > b.score) {
                return -1;
            } else if (a.score < b.score) {
                return 1;
            }
            return 0;
        }

        ascSort(a: Chromasome, b: Chromasome) {
            if (a.score > b.score) {
                return 1;
            } else if (a.score < b.score) {
                return -1;
            }
            return 0;
        }

        generation() {
            if (this.mating) {
                let topOnePercent = Math.round(0.01 * this.size) + 2; //ten percent of original size + 2
                let children = this.mate(topOnePercent);
                this.population = this.population.concat(children);
            }
            for (let i = 0; i < this.population.length; i++) {
                this.mutate(this.population[i], 1);
            }

            for(let j = 0; j < this.population.length; j++){
              this.population[j].score = this.cost(this.population[j], this.target);
            }
        }

        mate(parents: number): Chromasome[] {
            let numChildren = 0.5 * this.ranges.length * this.ranges.length;
            let children:Chromasome[] = [];
            for(let i = 0; i < numChildren; i++){
              let child = new Chromasome();
              for(let j =0; j < this.ranges.length; j++){
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

        mutate(chroma: Chromasome, chance: number) {
            if (Math.random() > chance) {
                return;
            }
            let best = this.population[0].genes;
            for (let j = 0; j < chroma.genes.length; j++) {
                let gene = chroma.genes[j];
                let diff: number;
                if(this.gradient){
                  diff = best[j].code - gene.code;
                } else {
                  diff = Utils.randRange(-1,1);
                }
                let upOrDown = diff > 0 ? 1 : -1;
                if (!this.discrete) {
                    gene.code += upOrDown * this.mutateRate * Math.random();
                } else {
                    gene.code += upOrDown;
                }
                gene.code = Math.min(Math.max(0, gene.code), 1);
            }
        }

    }
}
