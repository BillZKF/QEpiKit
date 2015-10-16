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
    public data: any[];
    public results: any[];
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
    update(agents:any, step: number) {
      this.time += step;
    }
  }
}
