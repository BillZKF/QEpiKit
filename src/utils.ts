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
  }
}
