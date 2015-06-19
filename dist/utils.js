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
        Utils.notEqualTo = function (a, b) {
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
            var URI;
            var csvContent = "data:text/csv;charset=utf-8,";
            var csvContentArray = [];
            data.forEach(function (infoArray) {
                dataString = infoArray.join(",");
                csvContentArray.push(dataString);
            });
            csvContent += csvContentArray.join("\n");
            URI = encodeURI(csvContent);
            return URI;
        };
        return Utils;
    })();
    QKit.Utils = Utils;
})(QKit || (QKit = {}));
//# sourceMappingURL=utils.js.map