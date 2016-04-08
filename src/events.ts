module QEpiKit {
  /**
  *QEvents are events which occur in an Environment at a specified time
  */
  export interface QEvent {
    name: string;
    /**
    * at the time the event starts
    */
    at: number;
    /**
    *until this time;
    */
    until?: number;
    /**
    * trigged false until trigger function is called for event, then set true
    */
    triggered: boolean;
    /**
    * trigger called at time /event specified by event
    */
    trigger(): void;
  }


  /** Events class includes methods for organizing events.
  *
  */
  export class Events {
    public queue: QEvent[];

    constructor(events: QEvent[] = []) {
      this.queue = [];
      this.schedule(events);
    }

    scheduleRecurring(qevent: QEvent, every: number, end: number) {
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
    }

    schedule(qevents: QEvent[]) {
      qevents.forEach(function(d){
        d.until = d.until || d.at;
      });
      this.queue = this.queue.concat(qevents);
      this.queue = this.organize(this.queue, 0, this.queue.length);
    }

    partition(array, left, right) {
      var cmp = array[right - 1].at,
        minEnd = left,
        maxEnd;
      for (maxEnd = left; maxEnd < right - 1; maxEnd += 1) {
        if (array[maxEnd].at <= cmp) {
          this.swap(array, maxEnd, minEnd);
          minEnd += 1;
        }
      }
      this.swap(array, minEnd, right - 1);
      return minEnd;
    }

    swap(array, i, j) {
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
      return array;
    }

    organize(events: QEvent[], left: number, right: number) {
      if (left < right) {
        var p = this.partition(events, left, right);
        this.organize(events, left, p);
        this.organize(events, p + 1, right);
      }
      return events;
    }
  }
}
