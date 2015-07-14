var idEx = {}, h = 1 / 24;
idEx.modes = ["SUCCEPTIBLE", "LATENT", "INFECTIOUS"];
idEx.flowSet = {
  pLoad: {
    min: 0,
    max: 1000
  },
  immuneResponse: {
    min: 0,
    max: 100
  },
  pShedding: {
    min: 0,
    max: 10
  }
};
idEx.flowMap = {
  "pLoad": {
    "SUCCEPTIBLE": function(agent) {
      return agent.pLoad + h * (0.7 *  agent.pLoad);
    },
    "INFECTIOUS": function(agent) {
      return agent.pLoad + h *  0.5 * (1 - agent.pLoad / 1000) * agent.pLoad - agent.immuneResponse;
    },
    LATENT: function(agent) {
      return agent.pLoad + h * 0.01 * (1 - agent.pLoad / 100) - agent.immuneResponse;
    }
  },
  "pShedding": {
    "SUCCEPTIBLE": function(agent) {
      return 0;
    },
    "INFECTIOUS": function(agent) {
      return agent.pLoad / 10 * h;
    },
    "LATENT": function(agent) {
      return agent.pLoad / 5 * h;
    }
  },
  "immuneResponse": {
    "SUCCEPTIBLE": function(agent) {
      return 0;
    },
    "INFECTIOUS": function(agent) {
      return agent.pLoad - 50 * h;
    },
    "LATENT": function(agent) {
      return agent.pLoad - 25 * h;
    }
  }
};
idEx.jumpMap = {
  "pLoad": {
    "SUCCEPTIBLE": {
      "INFECTIOUS": function(x) {
        return x;
      }
    },
    "INFECTIOUS": {
      "LATENT": function(x) {
        return x;
      }
    }
  }
};
idEx.jumpSet = {
  "INFECTIOUS": {
    key: "pLoad",
    value: 300,
    check: QEpiKit.Utils.gtEq
  },
  "LATENT": {
    key: "pLoad",
    value: 200,
    check: QEpiKit.Utils.ltEq
  }
};
var StudentAutomata = new QEpiKit.HybridAutomata(idEx.flowSet, idEx.flowMap, idEx.jumpSet, idEx.jumpMap);
var SchoolContact = new QEpiKit.ContactPatch("boarding-school", 30);




var agents = [{
  "id": 1,
  "pLoad": 4,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 13,
  "name": {
    "first": "Melisa",
    "last": "Castaneda"
  }
}, {
  "id": 2,
  "pLoad": 8,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 12,
  "name": {
    "first": "Ana",
    "last": "Yates"
  }
}, {
  "id": 3,
  "pLoad": 4,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 15,
  "name": {
    "first": "Carr",
    "last": "Sanchez"
  }
}, {
  "id": 4,
  "pLoad": 4,
  "pShedding": 0,
  "immuneResponse": 1,
  "currentMode": "SUCCEPTIBLE",
  "age": 12,
  "name": {
    "first": "Finley",
    "last": "Frazier"
  }
}, {
  "id": 5,
  "pLoad": 10,
  "pShedding": 0,
  "immuneResponse": 1,
  "currentMode": "SUCCEPTIBLE",
  "age": 16,
  "name": {
    "first": "Sellers",
    "last": "Herrera"
  }
}, {
  "id": 6,
  "pLoad": 3,
  "pShedding": 0,
  "immuneResponse": 1,
  "currentMode": "SUCCEPTIBLE",
  "age": 13,
  "name": {
    "first": "Wanda",
    "last": "Vasquez"
  }
}, {
  "id": 7,
  "pLoad": 1,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 16,
  "name": {
    "first": "Lawanda",
    "last": "Guerrero"
  }
}, {
  "id": 8,
  "pLoad": 10,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 15,
  "name": {
    "first": "Melton",
    "last": "Ward"
  }
}, {
  "id": 9,
  "pLoad": 2,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 12,
  "name": {
    "first": "Pansy",
    "last": "Harris"
  }
}, {
  "id": 10,
  "pLoad": 6,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 16,
  "name": {
    "first": "Arnold",
    "last": "Ortega"
  }
}, {
  "id": 11,
  "pLoad": 1,
  "pShedding": 0,
  "immuneResponse": 1,
  "currentMode": "SUCCEPTIBLE",
  "age": 13,
  "name": {
    "first": "Marsh",
    "last": "Hoover"
  }
}, {
  "id": 12,
  "pLoad": 3,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 13,
  "name": {
    "first": "Aurora",
    "last": "Butler"
  }
}, {
  "id": 13,
  "pLoad": 3,
  "pShedding": 0,
  "immuneResponse": 1,
  "currentMode": "SUCCEPTIBLE",
  "age": 12,
  "name": {
    "first": "Salas",
    "last": "Hendricks"
  }
}, {
  "id": 14,
  "pLoad": 9,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 15,
  "name": {
    "first": "Ladonna",
    "last": "Webb"
  }
}, {
  "id": 15,
  "pLoad": 550,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "INFECTIOUS",
  "age": 16,
  "name": {
    "first": "Blair",
    "last": "Lara"
  }
}, {
  "id": 16,
  "pLoad": 4,
  "pShedding": 0,
  "immuneResponse": 1,
  "currentMode": "SUCCEPTIBLE",
  "age": 12,
  "name": {
    "first": "Knapp",
    "last": "Freeman"
  }
}, {
  "id": 17,
  "pLoad": 1,
  "pShedding": 0,
  "immuneResponse": 1,
  "currentMode": "SUCCEPTIBLE",
  "age": 14,
  "name": {
    "first": "Jenkins",
    "last": "Curtis"
  }
}, {
  "id": 18,
  "pLoad": 5,
  "pShedding": 0,
  "immuneResponse": 1,
  "currentMode": "SUCCEPTIBLE",
  "age": 12,
  "name": {
    "first": "Kerr",
    "last": "Fleming"
  }
}, {
  "id": 19,
  "pLoad": 9,
  "pShedding": 0,
  "immuneResponse": 1,
  "currentMode": "SUCCEPTIBLE",
  "age": 16,
  "name": {
    "first": "Nikki",
    "last": "Hinton"
  }
}, {
  "id": 20,
  "pLoad": 5,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 13,
  "name": {
    "first": "Blankenship",
    "last": "Knowles"
  }
}, {
  "id": 21,
  "pLoad": 7,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 16,
  "name": {
    "first": "Richards",
    "last": "Wiley"
  }
}, {
  "id": 22,
  "pLoad": 5,
  "pShedding": 0,
  "immuneResponse": 1,
  "currentMode": "SUCCEPTIBLE",
  "age": 16,
  "name": {
    "first": "Lowe",
    "last": "Petersen"
  }
}, {
  "id": 23,
  "pLoad": 4,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 13,
  "name": {
    "first": "Morgan",
    "last": "Gregory"
  }
}, {
  "id": 24,
  "pLoad": 1,
  "pShedding": 0,
  "immuneResponse": 1,
  "currentMode": "SUCCEPTIBLE",
  "age": 13,
  "name": {
    "first": "Gutierrez",
    "last": "Eaton"
  }
}, {
  "id": 25,
  "pLoad": 3,
  "pShedding": 0,
  "immuneResponse": 0,
  "currentMode": "SUCCEPTIBLE",
  "age": 15,
  "name": {
    "first": "Tabitha",
    "last": "Battle"
  }
}];
for (var i = 0; i < agents.length; i++) {
  SchoolContact.assign(agents[i]);
}

contactFunction = function(other, agent, t) {
    var val = other.pLoad + agent.pShedding * other[agent.id];
    return val;
};
t = 0;
var d2 = null;
run = function(until) {
  if (t <= until) {
    for (var i = 0; i < agents.length; i++) {
      agents[i].time = t;
      StudentAutomata.update(agents[i], h);
      if (agents[i].currentMode === "INFECTIOUS" || agents[i].currentMode === "LATENT") {
        SchoolContact.encounters(agents[i], {
          key: "currentMode",
          value: "SUCCEPTIBLE",
          check: QEpiKit.Utils.equalTo
        }, contactFunction, "pLoad");
      }
    }
    if(!d2){
      d2 = new QEpiKit.renderer.infectionNetwork(agents, QEpiKit.ContactPatch.WIWArray, "ha-contact-graph");
    } else {
      d2.update(agents,QEpiKit.ContactPatch.WIWArray);
    }
    t += h;
  }
};

setInterval(function(){run(2);}, 3500);
