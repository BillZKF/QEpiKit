module QKit {
  export class Utils {
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


    public static equalTo(a, b) {
      if (a === b) {
        return true;
      } else {
        return false;
      }
    }

    public staticnotEqualTo(a, b) {
      if (a !== b) {
        return true;
      } else {
        return false;
      }
    }

    public static gt(a, b) {
      if (a > b) {
        return true;
      } else {
        return false;
      }
    }

    public static gtEq(a, b) {
      if (a >= b) {
        return true;
      } else {
        return false;
      }
    }

    public static lt(a, b) {
      if (a < b) {
        return true;
      } else {
        return false;
      }
    }

    public static ltEq(a, b) {
      if (a <= b) {
        return true;
      } else {
        return false;
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
    data: any[];
  }
}
