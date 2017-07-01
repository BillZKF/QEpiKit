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
    label?: string;
    key: string;
    value: any;
    data?: any;
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
