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

      csvContent +=  csvContentArray.join("\n");
      URI = encodeURI(csvContent);
      return URI;
    }
  }
}
