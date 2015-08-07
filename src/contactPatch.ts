module QEpiKit {
  export class ContactPatch {
    public static CID: number = 1;
    public static WIWArray: any[] = [];
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
      var val = (50 - Math.abs(a.age - b.age)) / 100;
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
      if (this.pop < this.capacity) {
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

    encounters(agent: any, precondition: any, contactFunc: Function, resultKey: string) {
      contactFunc = contactFunc || ContactPatch.defaultContactF;
      for (var contact in this.members) {
        if (precondition.check(this.members[contact][precondition.key], precondition.value) && Number(contact) !== agent.id) {
          this.members[agent.id][resultKey] = contactFunc(this.members[contact], agent);
          ContactPatch.WIWArray.push({
            patchID: this.id,
            name: this.name,
            infected: contact,
            infectedAge: this.members[contact].age,
            result: this.members[agent.id][resultKey],
            resultKey: resultKey,
            by: agent.id,
            byAge: agent.age,
            time: agent.time
          });
        }
      }
    }
  }
}
