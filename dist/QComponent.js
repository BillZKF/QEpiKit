var QEpiKit;
(function (QEpiKit) {
    var QComponent = (function () {
        function QComponent(name) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.time = 0;
            this.history = [];
        }
        QComponent.prototype.update = function (agents, step) {
            this.time += step;
        };
        QComponent.SUCCESS = 1;
        QComponent.FAILED = 2;
        QComponent.RUNNING = 3;
        return QComponent;
    })();
    QEpiKit.QComponent = QComponent;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=QComponent.js.map