module QKit {
  export class ContactPatch {
    public static CID: number = 0;
    public static WIWArray: any[];
    public id: number;
    public name: string;
    public capacity: number;
    public pop: number;
    public members: Object;

    static createID(): number {
      var id = ContactPatch.CID;
      ContactPatch.CID++;
      return id;
    }

    static defaultFreqF(a, b): number {
      var val = 100 - Math.abs(a.age - b.age) / 100;
      return val;
    }

    static defaultContactF(a, time): boolean {
      var c = 2 * Math.sin(time) + a;
      if (c >= 1) {
        return true;
      } else {
        return false;
      }
    }

    constructor(name: string, capacity: number) {
      this.id = ContactPatch.createID();
      this.name = name;
      this.capacity = capacity;
      this.pop = 0;
      this.members = {};
    }

    assign(agent: any, contactValueFunc: Function) {
      var contactValue;
      contactValueFunc = contactValueFunc || ContactPatch.defaultFreqF;
      if (this.pop <= this.capacity) {
        this.members[agent.id] = agent;
        for (var other in this.members) {
          other = Number(other);
          if (other !== agent.id && !isNaN(other)) {
            contactValue = contactValueFunc(this.members[other], agent);
            this.members[agent.id][other] = contactValue;
            this.members[other][agent.id] = contactValue;
          }
        }
        this.pop++;
        return this.id;
      } else {
        return null;
      }
    }

    checkContacts(agent: any, precondition: Condition, contactFunc: Function, resultKey: string) {
      contactFunc = contactFunc || ContactPatch.defaultContactF;
      for (var contact in this.members) {
        if (precondition.check(this.members[contact][precondition.key], precondition.value)) {
          agent[resultKey] = contactFunc(this.members[agent.id][contact], agent.time);
          ContactPatch.WIWArray.push({
            patch: this.id,
            name: this.name,
            infected: contact,
            by: agent.id,
            time: agent.time
          });
        }
      }
    }
  }
}
