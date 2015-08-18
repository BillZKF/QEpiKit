module QEpiKit {
  export class GeoPatch {
    public id: string;
    public name: string;
    public geoJSONurl: string;
    public geoJSON: JSON;
    public population: number;
    public members: any[];
    public compartmentModel: CompartmentModel;
    public travelMap: any[];
    public children: GeoPatch[];
    public environment: Environment;


    constructor(name: string, geoJSONurl: string, population: number) {
      this.id = QEpiKit.Utils.generateUUID();
      this.name = name;
      this.geoJSONurl = geoJSONurl;
      this.population = population;
    }




  }
}
