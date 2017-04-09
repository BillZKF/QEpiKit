var QEpiKit;
(function (QEpiKit) {
    var Utils = (function () {
        function Utils() {
        }
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
        Utils.arrayFromRange = function (start, end, step) {
            var range = [];
            var i = start;
            while (i < end) {
                range.push(i);
                i += step;
            }
            return range;
        };
        /**
        * shuffle - fisher-yates shuffle
        */
        Utils.shuffle = function (array, randomF) {
            var currentIndex = array.length, temporaryValue, randomIndex;
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(randomF() * currentIndex);
                currentIndex -= 1;
                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        };
        Utils.generateUUID = function () {
            // http://www.broofa.com/Tools/Math.uuid.htm
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
        Utils.not = function (result) {
            var newResult;
            if (result === Utils.SUCCESS) {
                newResult = Utils.FAILED;
            }
            else if (result === Utils.FAILED) {
                newResult = Utils.SUCCESS;
            }
            return newResult;
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
        Utils.inRange = function (a, b) {
            if (b >= a[0] && b <= a[1]) {
                return Utils.SUCCESS;
            }
            else {
                return Utils.FAILED;
            }
        };
        Utils.notInRange = function (a, b) {
            if (b >= a[0] && b <= a[1]) {
                return Utils.FAILED;
            }
            else {
                return Utils.SUCCESS;
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
                case QEpiKit.Utils.hasProp:
                    string = "has the property";
                    break;
                default:
                    try {
                        string = "not a defined matcher";
                    }
                    catch (e) {
                        console.log(e);
                    }
                    break;
            }
            return string;
        };
        Utils.setMin = function (params, keys) {
            for (var param in params) {
                if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
                    params[param].current = params[param].value - params[param].error;
                }
                else if (typeof (keys) === 'undefined') {
                    params[param].current = params[param].value - params[param].error;
                }
            }
        };
        Utils.setMax = function (params, keys) {
            for (var param in params) {
                if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
                    params[param].current = params[param].value + params[param].error;
                }
                else if (typeof (keys) === 'undefined') {
                    params[param].current = params[param].value + params[param].error;
                }
            }
        };
        Utils.setStandard = function (params, keys) {
            for (var param in params) {
                if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
                    params[param].current = params[param].value;
                }
                else if (typeof (keys) === 'undefined') {
                    params[param].current = params[param].value;
                }
            }
        };
        Utils.dataToMatrix = function (items, stdized) {
            if (stdized === void 0) { stdized = false; }
            var data = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (stdized) {
                    item = Utils.standardized(item);
                }
                item.forEach(function (x, ii) {
                    if (typeof data[ii] === 'undefined') {
                        data[ii] = [1, x];
                    }
                    else {
                        data[ii].push(x);
                    }
                });
            }
            return data;
        };
        /*
        * relative to the mean, how many standard deviations
        */
        Utils.standardized = function (arr) {
            var std = jStat.stdev(arr);
            var mean = jStat.mean(arr);
            var standardized = arr.map(function (d) {
                return (d - mean) / std;
            });
            return standardized;
        };
        /*
        * between 0 and 1 when min and max are known
        */
        Utils.normalize = function (x, min, max) {
            var val = x - min;
            return val / (max - min);
        };
        /*
        * give the real unit value
        */
        Utils.invNorm = function (x, min, max) {
            return (x * max - x * min) + min;
        };
        /*
        *
        */
        Utils.randRange = function (min, max) {
            return (max - min) * Math.random() + min;
        };
        Utils.prototype.getRange = function (data, prop) {
            var range = {
                min: 1e15,
                max: -1e15
            };
            for (var i = 0; i < data.length; i++) {
                if (range.min > data[i][prop]) {
                    range.min = data[i][prop];
                }
                if (range.max < data[i][prop]) {
                    range.max = data[i][prop];
                }
            }
            return range;
        };
        return Utils;
    }());
    Utils.SUCCESS = 1;
    Utils.FAILED = 2;
    Utils.RUNNING = 3;
    QEpiKit.Utils = Utils;
    var Match = (function () {
        function Match() {
        }
        Match.gt = function (a, b) {
            if (a > b) {
                return true;
            }
            return false;
        };
        Match.ge = function (a, b) {
            if (a >= b) {
                return true;
            }
            return false;
        };
        Match.lt = function (a, b) {
            if (a < b) {
                return true;
            }
            return false;
        };
        Match.le = function (a, b) {
            if (a <= b) {
                return true;
            }
            return false;
        };
        return Match;
    }());
    QEpiKit.Match = Match;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=utils.js.map