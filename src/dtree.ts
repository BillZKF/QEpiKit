
// Based on the C 4.5 algorithm
export class DecTree {
    public tree: any;
    public props: string[];

    constructor() {
        this.tree = {};
    }

    learn(data: any[], labelKey: string) {
        this.props = Object.keys(data[0]);
    }

    tick(data: any[], labelKey: string) {
        
    }

    split(data: any[]) {
        for (let i = 0; i < this.props.length; i++) {
            if (typeof data[0][this.props[i]] === 'number') {

            } else {
                //let criteria = nominal()
            }
        }
    }

}
