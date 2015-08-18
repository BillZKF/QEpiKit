module QEpiKit{

  /**Observer interface adds the ability to assess the outcome of a model environement run.
  */
  export interface Observer {
    assess(eventName): void;
    data: any[];
    results: any[];
  }

  /**Action to be performed by a QComponent by calling operate
  */
  export interface Action {
    label:string;
    result: any;
    mathJax: string;
    operate(x): void;
  }

  /**Condition to be checked against in data[key]
  */
  export interface Condition {
    label: string;
    key: string;
    value: any;
    data: any;
    check(): number;
  }

  /**Model param to be modified when running model
  */
  export interface ModelParam{
    label: string;
    value: number;
    error: number;
    units: string;
    current: number;
  }

  /**Quantitative resource used by Environment
  */
  export interface Resource{
    label: string;
    amount: number;
    unit: string;
  }

  /**
  *QEvents are events which occur in an Environment at a specified time
  */
  export interface QEvent {
    name:string;
    /**
    * trigged false until trigger function is called for event, then set true
    */
    triggered: boolean;
    /**
    * trigger called at time /event specified by event
    */
    trigger():void;
  }
}
