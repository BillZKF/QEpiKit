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
      this.getGeoJSON();
    }

    getGeoJSON() {
      var gjReq = new XMLHttpRequest();
      gjReq.open("GET", this.geoJSONurl, true);
      try {
        gjReq.send();
      } catch (err) {
        throw err;
      }
      gjReq.onreadystatechange = function() {
        if (gjReq.readyState == gjReq.DONE) {
          this.geoJSON = gjReq.response;
        }
      }
    }

    useCompartmentModel(model){
      this.compartmentModel = model;
    }

    setTravelMap(environment, map){
      this.environment = environment;
      this.travelMap = map;
      for(var dest in map){
        this.environment.geoNetwork[this.name][dest] = map[dest];
      }
    }
  }
}
