module QEpiKit {
  /**
  *QComponents are the base class for many model components.
  */
  export class QComponent {
    public static SUCCESS: number = 1;
    public static FAILED: number = 2;
    public static RUNNING: number = 3;

    public id: string;
    public name: string;
    public time: number;
    public history: any[];

    constructor(name: string) {
      this.id = QEpiKit.Utils.generateUUID();
      this.name = name;
      this.time = 0;
      this.history = [];
    }

    /** Take one time step forward (most subclasses override the base method)
    * @param step size of time step (in days by convention)
    */
    update(step: number) {
      this.time += step;
    }

    /** Run QComponent from t = 0 until t = until using time step = step
    * @param step size of time step (in days by convention)
    * @param until the end time
    * @param saveInterval save every 'x' steps
    */
    run(step: number, until: number, saveInterval: number) {
      this.time = 0;
      while (this.time <= until) {
        this.update(step);
        let rem = (this.time / step) % saveInterval;
        if (rem == 0) {
          this.history.push(JSON.parse(JSON.stringify(this)));
        }
      }
    }
  }
}
