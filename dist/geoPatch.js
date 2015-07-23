var QEpiKit;
(function (QEpiKit) {
    var GeoPatch = (function () {
        function GeoPatch(name, geoJSONurl, population) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.geoJSONurl = geoJSONurl;
            this.population = population;
            this.getGeoJSON();
        }
        GeoPatch.prototype.getGeoJSON = function () {
            var gjReq = new XMLHttpRequest();
            gjReq.open("GET", this.geoJSONurl, true);
            try {
                gjReq.send();
            }
            catch (err) {
                throw err;
            }
            gjReq.onreadystatechange = function () {
                if (gjReq.readyState == gjReq.DONE) {
                    this.geoJSON = gjReq.response;
                }
            };
        };
        GeoPatch.prototype.useCompartmentModel = function (model) {
            this.compartmentModel = model;
        };
        GeoPatch.prototype.setTravelMap = function (environment, map) {
            this.environment = environment;
            this.travelMap = map;
            for (var dest in map) {
                this.environment.geoNetwork[this.name][dest] = map[dest];
            }
        };
        return GeoPatch;
    })();
    QEpiKit.GeoPatch = GeoPatch;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=geoPatch.js.map