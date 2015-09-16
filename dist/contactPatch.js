var QEpiKit;
(function (QEpiKit) {
    var ContactPatch = (function () {
        function ContactPatch(name, capacity) {
            this.id = QEpiKit.Utils.generateUUID();
            this.name = name;
            this.capacity = capacity;
            this.pop = 0;
            this.members = {};
        }
        ContactPatch.defaultFreqF = function (a, b) {
            var val = (50 - Math.abs(a.age - b.age)) / 100;
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
                this.members[agent.id] = { properties: agent };
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
            }
            else {
                return null;
            }
        };
        ContactPatch.prototype.encounters = function (agent, precondition, contactFunc, resultKey) {
            contactFunc = contactFunc || ContactPatch.defaultContactF;
            for (var contact in this.members) {
                if (precondition.check(this.members[contact].properties[precondition.key], precondition.value) && Number(contact) !== agent.id) {
                    var oldVal = this.members[contact].properties[resultKey];
                    var newVal = contactFunc(this.members[contact], agent);
                    if (oldVal !== newVal) {
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
        };
        ContactPatch.WIWArray = [];
        return ContactPatch;
    })();
    QEpiKit.ContactPatch = ContactPatch;
})(QEpiKit || (QEpiKit = {}));
//# sourceMappingURL=contactPatch.js.map