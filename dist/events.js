var QEpiKit;
(function (QEpiKit) {
    /** Events class includes methods for organizing events.
    *
    */
    var Events = (function () {
        function Events(events) {
            if (events === void 0) { events = []; }
            this.queue = [];
            this.schedule(events);
        }
        /**
        * schedule an event with the same trigger multiple times.
        * @param qevent is the event to be scheduled. The at parameter should contain the time at first instance.
        * @param every interval for each occurnce
        * @param end until
        */
        Events.prototype.scheduleRecurring = function (qevent, every, end) {
            var recur = [];
            var duration = end - qevent.at;
            var occurences = Math.floor(duration / every);
            if (!qevent.until) {
                qevent.until = qevent.at;
            }
            for (var i = 0; i <= occurences; i++) {
                recur.push({ name: qevent.name + i, at: qevent.at + (i * every), until: qevent.until + (i * every), trigger: qevent.trigger, triggered: false });
            }
            this.schedule(recur);
        };
        /*
        * schedule a one time events. this arranges the event queue in chronological order.
        * @param qevents an array of events to be schedules.
        */
        Events.prototype.schedule = function (qevents) {
            qevents.forEach(function (d) {
                d.until = d.until || d.at;
            });
            this.queue = this.queue.concat(qevents);
            this.queue = this.organize(this.queue, 0, this.queue.length);
        };
        Events.prototype.partition = function (array, left, right) {
            var cmp = array[right - 1].at, minEnd = left, maxEnd;
            for (maxEnd = left; maxEnd < right - 1; maxEnd += 1) {
                if (array[maxEnd].at <= cmp) {
                    this.swap(array, maxEnd, minEnd);
                    minEnd += 1;
                }
            }
            this.swap(array, minEnd, right - 1);
            return minEnd;
        };
        Events.prototype.swap = function (array, i, j) {
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
            return array;
        };
        Events.prototype.organize = function (events, left, right) {
            if (left < right) {
                var p = this.partition(events, left, right);
                this.organize(events, left, p);
                this.organize(events, p + 1, right);
            }
            return events;
        };
        return Events;
    }());
    QEpiKit.Events = Events;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=events.js.map