module QEpiKit {
  export class GeoPatch {
    public id: string;
    public name: string;
    public geoJSON: JSON;
    public travelMap: any[];
    public children: GeoPatch[];
    public environment: Environment;


    constructor(name: string, geoJSON: JSON) {
      this.id = QEpiKit.Utils.generateUUID();
      this.name = name;
      this.geoJSON = JSON;
    }




  }
}
