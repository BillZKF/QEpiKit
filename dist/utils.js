var QEpiKit;
(function (QEpiKit) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.generateUUID = function () {
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
            var uuid = new Array(36);
            var rnd = 0, r;
            for (var i = 0; i < 36; i++) {
                if (i == 8 || i == 13 || i == 18 || i == 23) {
                    uuid[i] = '-';
                }
                else if (i == 14) {
                    uuid[i] = '4';
                }
                else {
                    if (rnd <= 0x02)
                        rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
            return uuid.join('');
        };
        Utils.always = function (a) {
            if (a === Utils.SUCCESS) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.eventually = function (a) {
            if (a === Utils.SUCCESS) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.RUNNING;
            }
        };
        Utils.equalTo = function (a, b) {
            if (a === b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.notEqualTo = function (a, b) {
            if (a !== b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.gt = function (a, b) {
            if (a > b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.gtEq = function (a, b) {
            if (a >= b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.lt = function (a, b) {
            if (a < b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.ltEq = function (a, b) {
            if (a <= b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.hasProp = function (a, b) {
            a = a || false;
            if (a === b) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.getMatcherString = function (check) {
            var string = null;
            switch (check) {
                case QEpiKit.Utils.equalTo:
                    string = "equal to";
                    break;
                case QEpiKit.Utils.notEqualTo:
                    string = "not equal to";
                    break;
                case QEpiKit.Utils.gt:
                    string = "greater than";
                    break;
                case QEpiKit.Utils.gtEq:
                    string = "greater than or equal to";
                    break;
                case QEpiKit.Utils.lt:
                    string = "less than";
                    break;
                case QEpiKit.Utils.ltEq:
                    string = "less than or equal to";
                    break;
                default:
                    break;
            }
            return string;
        };
        Utils.SUCCESS = 1;
        Utils.FAILED = 2;
        Utils.RUNNING = 3;
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
    QEpiKit.Utils = Utils;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=utils.js.map