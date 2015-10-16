var QEpiKit;
(function (QEpiKit) {
    var Epi = (function () {
        function Epi() {
        }
        Epi.prevalence = function (cases, total) {
            var prev = cases / total;
            return prev;
        };
        Epi.riskDifference = function (table) {
            var rd = table.a / (table.a + table.b) - table.c / (table.c + table.d);
            return rd;
        };
        Epi.riskRatio = function (table) {
            var rratio = (table.a / (table.a + table.b)) / (table.c / (table.c + table.d));
            return rratio;
        };
        Epi.oddsRatio = function (table) {
            var or = (table.a * table.d) / (table.b * table.c);
            return or;
        };
        Epi.IPF2D = function (rowTotals, colTotals, iterations, seeds) {
            var rT = 0, cT = 0, seedCells = seeds;
            rowTotals.forEach(function (r, i) {
                rT += r;
                seedCells[i] = seedCells[i] || [];
            });
            colTotals.forEach(function (c, j) {
                cT += c;
                seedCells.forEach(function (row, k) {
                    seedCells[k][j] = seedCells[k][j] || Math.round(rowTotals[k] / rowTotals.length + (colTotals[j] / colTotals.length) / 2 * Math.random());
                });
            });
            if (rT === cT) {
                for (var iter = 0; iter < iterations; iter++) {
                    seedCells.forEach(function (row, ii) {
                        var currentRowTotal = 0;
                        row.forEach(function (cell, j) {
                            currentRowTotal += cell;
                        });
                        row.forEach(function (cell, jj) {
                            seedCells[ii][jj] = cell / currentRowTotal;
                            seedCells[ii][jj] *= rowTotals[ii];
                        });
                    });
                    for (var col = 0; col < colTotals.length; col++) {
                        var currentColTotal = 0;
                        seedCells.forEach(function (r, k) {
                            currentColTotal += r[col];
                        });
                        seedCells.forEach(function (row, kk) {
                            seedCells[kk][col] = row[col] / currentColTotal;
                            seedCells[kk][col] *= colTotals[col];
                        });
                    }
                }
                return seedCells;
            }
        };
        return Epi;
    })();
    QEpiKit.Epi = Epi;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=epi.js.map