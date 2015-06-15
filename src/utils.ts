module QKit {
  export class Utils {
    public static createCSVURI = function(data: any[]) {
      var dataString;
      var csvContent = "data:text/csv;charset=utf-8,";
      data.forEach(function(infoArray, index) {
        dataString = data.join(",");
        csvContent += index < data.length ? dataString + "\n" : dataString;
      });
      return encodeURI(csvContent);
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
    agent : any;
    blackboard : any;
    result: any;
    operate():void;
  }
}
