//assign each params
BasicNeedsParams = [
  {name:'bathroom', assign: null},
  {name:'waterPump', assign: null},
  {name:'tent', assign:null},
  {name:'inQueue', assign: false},
  {name:'useTime', assign: 0.000013},
  {name:'kgPerDayExcrete', assign: 0.15},
  {name:'needsBathroom', assign: function(agent){return random.real(0, 0.9);}},
  {name:'needsSleep', assign: 0},
  {name:'dailyWaterRequired', assign: function(agent){return random.real(0, 1.5);}},
  {name:'waterPathConcentration', assign: 0},
  {name:'waterAvailable', assign:function(agent){
    return random.real(0, 1);
  }},
];

cBored = {
  name: 'bored',
  x: function(subject, optionParams) {
    return 1 - subject.needsSleep;
  },
  extents: [0, 1],
  f: QEpiKit.linear,
  m: 1,
  b: 0,
  k: 0
};

oIdle = {
  name: 'idle',
  considerations: [cBored],
  action: function(step, person) {
    QActions.moveWithin(step, person, boundaries.people);
    QActions.drink(step, person);
    person.needsSleep += step * 1.5;
  }
};

cNeedBathroom = {
  name: 'needBathroom',
  x: function(subject, optionParams) {
    return Math.min(1,subject.needsBathroom);
  },
  extents: [0, 1],
  f: QEpiKit.linear,
  m: 1,
  b: 0,
  k: 0
};

oBathroom = {
  name: 'useBathroom',
  considerations: [cNeedBathroom],
  action: function(step, person) {
    QActions.useFacility(step, person, bathrooms, 'bathroom', QActions.excrete);
  }
};

cNeedWater = {
  name: 'needWater',
  x: function(subject, optionParams) {
    return Math.min(1, 1 - subject.waterAvailable);
  },
  extents: [0, 1],
  f: QEpiKit.linear,
  m: 1,
  b: 0,
  k: 0
};

oWater = {
  name: 'getWater',
  considerations: [cNeedWater],
  action: function(step, person) {
    QActions.useFacility(step, person, waterPumps, 'waterPump', QActions.getWater);
  }
};

cNeedSleep = {
  name: 'needSleep',
  x: function(subject, optionParams) {
    return Math.min(0.99, subject.needsSleep);
  },
  extents: [0, 1],
  f: QEpiKit.linear,
  m: 1,
  b: 0,
  k: 0
};

oSleep = {
  name: 'getSleep',
  considerations: [cNeedSleep],
  action: function(step, person) {
    if (person.mesh.position.distanceTo(person.tent.mesh.position) > 1) {
      QActions.moveTo(step, person, person.tent);
    } else {
      if (person.needsSleep > 0) {
        person.needsSleep -= step * 2;
      } else {
        person.needsSleep = 0;
      }
    }
  }
};
