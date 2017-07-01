export class Resource {
  public label: string;
  public units: string;
  public tags: string[];
  public current: number = 0;
  public available: boolean = true;
  public useUpperLimit: boolean = false;
  public useLowerLimit: boolean = false;
  public upperLimit: number;
  public lowerLimit: number;
  public added: number = 0;
  public removed: number = 0;
  public incomingTrans: number = 0;
  public outgoingTrans: number = 0;

  constructor(template: any) {
    this.label = template.label;
    this.units = template.units;
    this.current = template.current || 0;
    this.available = template.available || true;
    this.useUpperLimit = template.useUpperLimit || false;
    this.lowerLimit = template.useLowerLimit || false;
    if (this.useLowerLimit) {
      this.upperLimit = template.upperLimit;
    }

    if (this.useLowerLimit) {
      this.lowerLimit = template.lowerLimit;
    }
  }

  lowerLimitCB(quantity) {
    this.available = false;
  }

  upperLimitCB(quantity) {
    this.available = false;
  }

  remove(quantity) {
    if (this.available) {
      if (this.useLowerLimit || (this.useUpperLimit && this.current >= this.upperLimit)) {
        let gap = this.lowerLimit - (this.current - quantity);
        if (gap > 0) {
          quantity = quantity - gap;
          this.lowerLimitCB(quantity);
        }
      }
      this.removed = this.removed || 0;
      this.current -= quantity;
      this.removed += quantity;
      this.outgoingTrans += 1;
      return quantity;
    }
    return 0;
  }

  add(quantity) {
    if (this.available || (this.useLowerLimit && this.current <= this.lowerLimit)) {
      if (this.useUpperLimit) {
        let excess = (this.current + quantity) - this.upperLimit;
        if (excess > 0) {
          quantity = quantity - excess;
          this.upperLimitCB(quantity);
        }
      }
      this.added = this.added || 0;
      this.current += quantity;
      this.added += quantity;
      this.incomingTrans += 1;
      return quantity;
    }
    return 0;
  }

  transfer(resourceB, quantity) {
    quantity = this.remove(quantity);
    resourceB.add(quantity);
  }

  give(agent, quantity) {
    quantity = this.remove(quantity);
    agent[this.label] = agent[this.label] || 0;
    agent[this.label] += quantity;
  }
}
