module QEpiKit {
  export class Utils {
    public static SUCCESS: number = 1;
    public static FAILED: number = 2;
    public static RUNNING: number = 3;

    public static createCSVURI = function(data: any[]) {
      var dataString;
      var URI;
      var csvContent = "data:text/csv;charset=utf-8,";
      var csvContentArray = [];
      data.forEach(function(infoArray) {
        dataString = infoArray.join(",");
        csvContentArray.push(dataString);
      });

      csvContent += csvContentArray.join("\n");
      URI = encodeURI(csvContent);
      return URI;
    }

    public static generateUUID(): string {
      // http://www.broofa.com/Tools/Math.uuid.htm
      var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      var uuid = new Array(36);
      var rnd = 0, r;

      for (var i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
          uuid[i] = '-';
        } else if (i == 14) {
          uuid[i] = '4';
        } else {
          if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
          r = rnd & 0xf;
          rnd = rnd >> 4;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
      return uuid.join('');
    }

    public static always(a) {
      if (a === Utils.SUCCESS) {
        return Utils.SUCCESS;
      } else {
        return Utils.FAILED;
      }
    }

    public static eventually(a) {
      if (a === Utils.SUCCESS) {
        return Utils.SUCCESS;
      } else {
        return Utils.RUNNING;
      }
    }

    public static equalTo(a, b) {
      if (a === b) {
        return Utils.SUCCESS;
      } else {
        return Utils.FAILED;
      }
    }

    public static notEqualTo(a, b) {
      if (a !== b) {
        return Utils.SUCCESS;
      } else {
        return Utils.FAILED;
      }
    }

    public static gt(a, b) {
      if (a > b) {
        return Utils.SUCCESS;
      } else {
        return Utils.FAILED;
      }
    }

    public static gtEq(a, b) {
      if (a >= b) {
        return Utils.SUCCESS;
      } else {
        return Utils.FAILED;
      }
    }

    public static lt(a, b) {
      if (a < b) {
        return Utils.SUCCESS;
      } else {
        return Utils.FAILED;
      }
    }

    public static ltEq(a, b) {
      if (a <= b) {
        return Utils.SUCCESS;
      } else {
        return Utils.FAILED;
      }
    }

    public static hasProp(a, b) {
      a = a || false;
      if (a === b) {
        return Utils.SUCCESS;
      } else {
        return Utils.FAILED;
      }
    }

    public static getMatcherString(check) {
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
        case QEpiKit.Utils.ltEq:
          string = "has the property";
          break;
        default:
          break;
      }
      return string;
    }
  }

  export interface Action {
    agent: any;
    blackboard: any;
    result: any;
    operate(): void;
  }

  export interface Condition {
    label: string;
    key: string;
    value: any;
    data: any;
    check: Function;
  }
}
