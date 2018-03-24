declare var jStat: any;
declare var THREE: any;
declare var turf: any;
declare var scene: any;
declare var QActions: any;

import {Resource} from './resource';

export const SUCCESS: number = 1;
export const FAILED: number = 2;
export const RUNNING: number = 3;


export function createCSVURI(data: any[]) {
  var dataString;
  var URI;
  var csvContent = "data:text/csv;charset=utf-8,";
  var csvContentArray = [];
  data.forEach(function(infoArray) {
    dataString = infoArray.join(",");
    csvContentArray.push(dataString);
  });
  csvContent += csvContentArray.join("\n");
  URI = encodeURI(csvContent);
  return URI;
}

export function arrayFromRange(start, end, step) {
  var range = [];
  var i = start;
  while (i < end) {
    range.push(i);
    i += step;
  }
  return range;
}


/**
* shuffle - fisher-yates shuffle
*/
export function shuffle(array: any[], rng: any) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(rng.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function generateUUID(): string {
  // http://www.broofa.com/Tools/Math.uuid.htm
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = new Array(36);
  var rnd = 0, r;

  for (var i = 0; i < 36; i++) {
    if (i == 8 || i == 13 || i == 18 || i == 23) {
      uuid[i] = '-';
    } else if (i == 14) {
      uuid[i] = '4';
    } else {
      if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
      r = rnd & 0xf;
      rnd = rnd >> 4;
      uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
    }
  }
  return uuid.join('');
}

export function always(a) {
  if (a === SUCCESS) {
    return SUCCESS;
  } else {
    return FAILED;
  }
}

export function eventually(a) {
  if (a === SUCCESS) {
    return SUCCESS;
  } else {
    return RUNNING;
  }
}

export function equalTo(a, b) {
  if (a === b) {
    return SUCCESS;
  } else {
    return FAILED;
  }
}

export function not(result) {
  var newResult;
  if (result === SUCCESS) {
    newResult = FAILED;
  } else if (result === FAILED) {
    newResult = SUCCESS;
  }
  return newResult;
}

export function notEqualTo(a, b) {
  if (a !== b) {
    return SUCCESS;
  } else {
    return FAILED;
  }
}

export function gt(a, b) {
  if (a > b) {
    return SUCCESS;
  } else {
    return FAILED;
  }
}

export function gtEq(a, b) {
  if (a >= b) {
    return SUCCESS;
  } else {
    return FAILED;
  }
}

export function lt(a, b) {
  if (a < b) {
    return SUCCESS;
  } else {
    return FAILED;
  }
}

export function ltEq(a, b) {
  if (a <= b) {
    return SUCCESS;
  } else {
    return FAILED;
  }
}

export function hasProp(a, b) {
  a = a || false;
  if (a === b) {
    return SUCCESS;
  } else {
    return FAILED;
  }
}

export function inRange(a, b) {
  if (b >= a[0] && b <= a[1]) {
    return SUCCESS;
  } else {
    return FAILED;
  }
}

export function notInRange(a, b) {
  if (b >= a[0] && b <= a[1]) {
    return FAILED;
  } else {
    return SUCCESS;
  }
}

export function getMatcherString(check) {
  var string = null;
  switch (check) {
    case equalTo:
      string = "equal to";
      break;
    case notEqualTo:
      string = "not equal to";
      break;
    case gt:
      string = "greater than";
      break;
    case gtEq:
      string = "greater than or equal to";
      break;
    case lt:
      string = "less than";
      break;
    case ltEq:
      string = "less than or equal to";
      break;
    case hasProp:
      string = "has the property";
      break;
    default:
      try {
        string = "not a defined matcher";
      } catch (e) {
        console.log(e);
      }
      break;
  }
  return string;
}

export function setMin(params, keys?) {
  for (var param in params) {
    if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
      params[param].current = params[param].value - params[param].error;
    } else if (typeof (keys) === 'undefined') {
      params[param].current = params[param].value - params[param].error;
    }
  }
}

export function setMax(params, keys?) {
  for (var param in params) {
    if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
      params[param].current = params[param].value + params[param].error;
    } else if (typeof (keys) === 'undefined') {
      params[param].current = params[param].value + params[param].error;
    }
  }
}

export function setStandard(params, keys?) {
  for (var param in params) {
    if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
      params[param].current = params[param].value;
    } else if (typeof (keys) === 'undefined') {
      params[param].current = params[param].value;
    }
  }
}

export function dataToMatrix(items: any[], stdized = false) {
  let data = [];
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    if (stdized) {
      item = scale(item);
    }
    item.forEach((x, ii) => {
      if (typeof data[ii] === 'undefined') {
        data[ii] = [1, x];
      } else {
        data[ii].push(x);
      }
    });
  }
  return data;
}

export function categoriesToVector(data:any[]){
  let values = [];
  let keys = {};
  let matrix;
  let idx = 0;
  data.forEach((x) => {
    let key = x + '';
    if(!(key in keys)){
        values.push(key);
        keys[key] = values.length - 1;
    }
  });
  matrix = data.map((y) => {
    let z = values.map((v) => {return 0});
    let idx = keys[y + ''];
    z[idx] = 1;
    return z;
  })
  return {labels:keys, data: matrix};
}

export function scale(vals: any, center?: number, scale?: number) {
  if (typeof vals === 'number') {
    return (vals - center) / scale;
  } else {
    center = center || jStat.mean(vals);
    scale = scale || jStat.stdev(vals);
    return vals.map((d: number) => {
      return (d - center) / scale;
    })
  }
}

export function scaleInv(vals: any, center: number, scale: number) {
  if (typeof vals === 'number') {
    return vals * scale + center;
  } else {
    return vals.map((d: number) => {
      return d * scale + center;
    });
  }
}

/*
* relative to the mean, how many sds
*/
export function standardized(arr: number[]) {
  let std = jStat.stdev(arr);
  let mean = jStat.mean(arr);
  let standardized = arr.map((d) => {
    return (d - mean) / std;
  })
  return standardized;
}


/*
* between 0 and 1 when min and max are known
*/
export function normalize(x: number, min: number, max: number) {
  let val = x - min;
  return val / (max - min);
}

/*
* give the real unit value
*/
export function invNorm(x: number, min: number, max: number) {
  return (x * max - x * min) + min;
}

/*
*
*/
export function randRange(min: number, max: number) {
  return (max - min) * Math.random() + min;
}

export function getRange(data: any[], prop: string) {
  let range = {
    min: 1e15,
    max: -1e15
  };
  for (let i = 0; i < data.length; i++) {
    if (range.min > data[i][prop]) {
      range.min = data[i][prop];
    }
    if (range.max < data[i][prop]) {
      range.max = data[i][prop];
    }
  }
  return range;
}

export class Match {
  static gt(a: number, b: number) {
    if (a > b) {
      return SUCCESS;
    }
    return FAILED;
  }
  static ge(a: number, b: number) {
    if (a >= b) {
      return SUCCESS;
    }
    return FAILED;
  }
  static lt(a: number, b: number) {
    if (a < b) {
      return SUCCESS;
    }
    return FAILED;
  }
  static le(a: number, b: number) {
    if (a <= b) {
      return SUCCESS;
    }
    return FAILED;
  }
  static always(a) {
    if (a === SUCCESS) {
      return SUCCESS;
    } else {
      return FAILED;
    }
  }

  static eventually(a) {
    if (a === SUCCESS) {
      return SUCCESS;
    } else {
      return RUNNING;
    }
  }

  static equalTo(a, b) {
    if (a === b) {
      return SUCCESS;
    } else {
      return FAILED;
    }
  }

  static not(result) {
    var newResult;
    if (result === SUCCESS) {
      newResult = FAILED;
    } else if (result === FAILED) {
      newResult = SUCCESS;
    }
    return newResult;
  }

  static notEqualTo(a, b) {
    if (a !== b) {
      return SUCCESS;
    } else {
      return FAILED;
    }
  }

  static gtEq(a, b) {
    if (a >= b) {
      return SUCCESS;
    } else {
      return FAILED;
    }
  }


  static ltEq(a, b) {
    if (a <= b) {
      return SUCCESS;
    } else {
      return FAILED;
    }
  }

  static hasProp(a, b) {
    a = a || false;
    if (a === b) {
      return SUCCESS;
    } else {
      return FAILED;
    }
  }

  static inRange(a, b) {
    if (b >= a[0] && b <= a[1]) {
      return SUCCESS;
    } else {
      return FAILED;
    }
  }

  static notInRange(a, b) {
    if (b >= a[0] && b <= a[1]) {
      return FAILED;
    } else {
      return SUCCESS;
    }
  }
}

export function addResources(arr, template, number) {
  for (var i = 0; i < number; i++) {
    arr.push(new Resource(template));
  }
  return arr;
}

export function generatePop(numAgents: number, options: any, type: any, boundaries: any, currentAgentId: number, rng: any) {
  var pop = [];
  var locs = {
    type: 'FeatureCollection',
    features: []
  };
  options = options || [];
  type = type || 'continuous';
  for (var a = 0; a < numAgents; a++) {
    pop[a] = {
      id: currentAgentId,
      type: type,
      states: {}
    };
    //movement params
    pop[a].movePerDay = rng.normal(2500 * 24, 1000); // m/day
    pop[a].prevX = 0;
    pop[a].prevY = 0;
    pop[a].movedTotal = 0;

    if (pop[a].type === 'continuous') {

      pop[a].mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 1), new THREE.MeshBasicMaterial({
        color: 0x000000
      }));
      pop[a].mesh.qId = pop[a].id;
      pop[a].mesh.type = 'agent';

      pop[a].position = { x: 0, y: 0, z: 0 };

      pop[a].boundaryGroup = options.groupName
      pop[a].position.x = rng.randRange(boundaries.left, boundaries.right);
      pop[a].position.y = rng.randRange(boundaries.bottom, boundaries.top);

      pop[a].mesh.position.x = pop[a].position.x;
      pop[a].mesh.position.y = pop[a].position.y;

      if (typeof scene !== 'undefined') {
        scene.add(pop[a].mesh);
      }
    }

    if (pop[a].type === 'geospatial') {
      locs.features[a] = turf.point([rng.randRange(-75.1467, -75.1867), rng.randRange(39.9200, 39.9900)]);
      pop[a].location = locs.features[a];
      pop[a].location.properties.agentRefID = pop[a].id;
    }

    pop[a] = assignParams(pop[a], options, rng);
    currentAgentId++;
  }

  for (let a = 0; a < pop.length; a++) {
    for (let key in pop[a].states) {
      pop[a][pop[a].states[key]] = true;
    }
  }
  return [pop, locs];
}

export function assignParams(targetObj: any, params:any[], rng:any){
  for (let key in params) {
    targetObj[key] = assignParam(targetObj, params[key], key, rng);
  }
  return targetObj;
}

export function assignParam(targetObj:any, param:any, key:string, rng:any){
  if (typeof param.states !== 'undefined') {
    targetObj.states[key] = rng.pick(param.states.params[0], param.states.params[1]);
    return targetObj.states[key];
  }
  if (typeof param.distribution !== 'undefined') {
    targetObj[key] = rng[param.distribution.name](param.distribution.params[0], param.distribution.params[1]);
  }
  if (typeof param.action !== 'undefined') {
    targetObj[key] = QActions[param.action];
  }
  if (typeof param.assign !== 'undefined') {
    targetObj[key] = param.assign;
  }
  return targetObj[key];
}
