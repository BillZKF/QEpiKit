var QEpiKit;
(function (QEpiKit) {
    var ContactPatch = (function () {
        function ContactPatch(name, capacity) {
            this.id = ContactPatch.createID();
            this.name = name;
            this.capacity = capacity;
            this.pop = 0;
            this.members = {};
        }
        ContactPatch.createID = function () {
            var id = ContactPatch.CID;
            ContactPatch.CID++;
            return id;
        };
        ContactPatch.defaultFreqF = function (a, b) {
            var val = 100 - Math.abs(a.age - b.age) / 100;
            return val;
        };
        ContactPatch.defaultContactF = function (a, time) {
            var c = 2 * Math.sin(time) + a;
            if (c >= 1) {
                return true;
            }
            else {
                return false;
            }
        };
        ContactPatch.prototype.assign = function (agent, contactValueFunc) {
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
            }
            else {
                return null;
            }
        };
        ContactPatch.prototype.encounters = function (agent, precondition, contactFunc, resultKey) {
            contactFunc = contactFunc || ContactPatch.defaultContactF;
            for (var contact in this.members) {
                if (precondition.check(this.members[contact][precondition.key], precondition.value)) {
                    agent[resultKey] = contactFunc(this.members[agent.id][contact], agent.time);
                    ContactPatch.WIWArray.push({
                        patchID: this.id,
                        name: this.name,
                        infected: contact,
                        by: agent.id,
                        time: agent.time
                    });
                }
            }
        };
        ContactPatch.CID = 1;
        ContactPatch.WIWArray = [];
        return ContactPatch;
    })();
    QEpiKit.ContactPatch = ContactPatch;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=contactPatch.js.map