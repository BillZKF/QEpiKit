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

    public static fromJSON = function(json) {
      json = JSON.parse(json);
      var n;
      switch (json.type) {
        case "root":
          n = new BTRoot(json.id, json.children);
          break;
        case "selector":
          n = new BTSelector(json.id, json.children);
          break;
        case "sequence":
          n = new BTSequence(json.id, json.children);
          break;
        case "parallel":
          n = new BTParallel(json.id, json.children, json.number);
          break;
        case "condition":
          n = new BTCondition(json.id, json.condition);
          break;
        case "action":
          n = new BTAction(json.id, json.condition, json.action);
          break;
        default: ;
      }
      return n;
    }

    public static generateUUID():string {
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
  }

  export interface Action {
    agent: any;
    blackboard: any;
    result: any;
    operate(): void;
  }

  export interface Condition {
    key: string;
    value: any;
    check: Function;
  }
}
