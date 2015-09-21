module QEpiKit {
  export class ContactPatch {
    public static WIWArray: any[] = [];
    public id: string;
    public name: string;
    public capacity: number;
    public pop: number;
    public members: Object;


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
      this.id = QEpiKit.Utils.generateUUID();
      this.name = name;
      this.capacity = capacity;
      this.pop = 0;
      this.members = {};
    }

    assign(agent: any, contactValueFunc: Function) {
      var contactValue;
      contactValueFunc = contactValueFunc || ContactPatch.defaultFreqF;
      if (this.pop < this.capacity) {
        this.members[agent.id] = {properties:agent};
        for (var other in this.members) {
          other = Number(other);
          if (other !== agent.id && !isNaN(other)) {
            contactValue = contactValueFunc(this.members[other].properties, agent);
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

    encounters(agent: any, precondition: any, contactFunc: Function, resultKey: string, save:boolean = false) {
      contactFunc = contactFunc || ContactPatch.defaultContactF;
      let contactVal;
      for (var contact in this.members) {
        if(precondition.key === 'states'){
          contactVal = JSON.stringify(this.members[contact].properties[precondition.key]);
        } else {
          contactVal = this.members[contact].properties[precondition.key];
        }
        if (precondition.check(this.members[contact].properties[precondition.key], precondition.value) && Number(contact) !== agent.id) {
          var oldVal = this.members[contact].properties[resultKey];
          var newVal = contactFunc(this.members[contact], agent);
          if(oldVal !== newVal && save === true){
            this.members[contact].properties[resultKey] = newVal;
            ContactPatch.WIWArray.push({
              patchID: this.id,
              name: this.name,
              infected: contact,
              infectedAge: this.members[contact].properties.age,
              result: this.members[contact].properties[resultKey],
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
}
