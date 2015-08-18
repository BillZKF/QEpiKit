var QEpiKit;
(function (QEpiKit) {
    var QComponent = (function () {
        function QComponent(name) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.time = 0;
            this.history = [];
        }
        QComponent.prototype.update = function (step) {
            this.time += step;
        };
        QComponent.prototype.run = function (step, until, saveInterval) {
            this.time = 0;
            while (this.time <= until) {
                var rem = (this.time / step) % saveInterval;
                if (rem == 0) {
                    this.history.push(JSON.parse(JSON.stringify(this)));
                }
                this.update(step);
            }
        };
        QComponent.SUCCESS = 1;
        QComponent.FAILED = 2;
        QComponent.RUNNING = 3;
        return QComponent;
    })();
    QEpiKit.QComponent = QComponent;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=QComponent.js.map