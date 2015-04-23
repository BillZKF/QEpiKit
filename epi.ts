module QKit {
    export class Epi {
        static prevalence(cases:number, total:number) {
            var prev: number = cases / total;
            return prev;
        }

        static riskDifference(table: EpiTable2) {
            var rd: number = table.a / (table.a + table.b) - table.c / (table.c + table.d);
            return rd;
        }

        static riskRatio(table: EpiTable2) {
            var rratio : number = (table.a / (table.a + table.b)) / (table.c / (table.c + table.d));
            return rratio;
        }

        static oddsRatio(table: EpiTable2) {
            var or: number = (table.a * table.d) / (table.b * table.c);
            return or;
        }
    }

    export interface EpiTable2 {
        a : number; //expYOutY
        b : number; //expYOutN
        c : number; //expNOutY
        d : number; //expNOutN
    }
} 