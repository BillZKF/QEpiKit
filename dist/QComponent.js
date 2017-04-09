var QEpiKit;
(function (QEpiKit) {
    /**
    *QComponents are the base class for many model components.
    */
    var QComponent = (function () {
        function QComponent(name) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.time = 0;
            this.history = [];
        }
        /** Take one time step forward (most subclasses override the base method)
        * @param step size of time step (in days by convention)
        */
        QComponent.prototype.update = function (agent, step) {
            //something super!
        };
        return QComponent;
    }());
    QComponent.SUCCESS = 1;
    QComponent.FAILED = 2;
    QComponent.RUNNING = 3;
    QEpiKit.QComponent = QComponent;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=QComponent.js.map