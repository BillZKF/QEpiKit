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
        Utils.fromJSON = function (json) {
            json = JSON.parse(json);
            var n;
            switch (json.type) {
                case "root":
                    n = new QEpiKit.BTRoot(json.id, json.children);
                    break;
                case "selector":
                    n = new QEpiKit.BTSelector(json.id, json.children);
                    break;
                case "sequence":
                    n = new QEpiKit.BTSequence(json.id, json.children);
                    break;
                case "parallel":
                    n = new QEpiKit.BTParallel(json.id, json.children, json.number);
                    break;
                case "condition":
                    n = new QEpiKit.BTCondition(json.id, json.condition);
                    break;
                case "action":
                    n = new QEpiKit.BTAction(json.id, json.condition, json.action);
                    break;
                default: ;
            }
            return n;
        };
        return Utils;
    })();
    QEpiKit.Utils = Utils;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=utils.js.map