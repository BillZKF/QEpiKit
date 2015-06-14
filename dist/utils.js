var QKit;
(function (QKit) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.equalTo = function (a, b) {
            if (a === b) {
                return true;
            }
            else {
                return false;
            }
        };
        Utils.prototype.staticnotEqualTo = function (a, b) {
            if (a !== b) {
                return true;
            }
            else {
                return false;
            }
        };
        Utils.gt = function (a, b) {
            if (a > b) {
                return true;
            }
            else {
                return false;
            }
        };
        Utils.gtEq = function (a, b) {
            if (a >= b) {
                return true;
            }
            else {
                return false;
            }
        };
        Utils.lt = function (a, b) {
            if (a < b) {
                return true;
            }
            else {
                return false;
            }
        };
        Utils.ltEq = function (a, b) {
            if (a <= b) {
                return true;
            }
            else {
                return false;
            }
        };
        Utils.createCSVURI = function (data) {
            var dataString;
            var csvContent = "data:text/csv;charset=utf-8,";
            data.forEach(function (infoArray, index) {
                dataString = data.join(",");
                csvContent += index < data.length ? dataString + "\n" : dataString;
            });
            return encodeURI(csvContent);
        };
        return Utils;
    })();
    QKit.Utils = Utils;
})(QKit || (QKit = {}));
//# sourceMappingURL=utils.js.map