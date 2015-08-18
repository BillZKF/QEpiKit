var QEpiKit;
(function (QEpiKit) {
    var GeoPatch = (function () {
        function GeoPatch(name, geoJSONurl, population) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.geoJSONurl = geoJSONurl;
            this.population = population;
        }
        return GeoPatch;
    })();
    QEpiKit.GeoPatch = GeoPatch;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=geoPatch.js.map