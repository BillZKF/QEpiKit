var QKit;
(function (QKit) {
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
        return Epi;
    })();
    QKit.Epi = Epi;
})(QKit || (QKit = {}));
//# sourceMappingURL=epi.js.map