export class KNN {

  setNeighbors(point:any, data:any[], param:any, classifier:string) {
    data.forEach((d) => {
      if (d.id !== point.id) {
        point.neighbors[d.id] = point.neighbors[d.id] || {};
        point.neighbors[d.id][classifier] = d[classifier];
        point.neighbors[d.id][param.param] = Math.abs(point[param.param] - d[param.param]) / param.range;
      }
    });
  }

  sort(neighbors:any[], param:string) {
    var list:any = [];
    for (var neigh in neighbors) {
      list.push(neighbors[neigh]);
    }
    list.sort((a:any, b:any) => {
      if (a[param] >= b[param]) {
        return 1;
      }

      if (b[param] >= a[param]) {
        return -1;
      }

      return 0;
    })

    return list;
  }

  setDistances(data:any[], trained:any[], kParamsObj:any[], classifier:string) {
    for (var i = 0; i < data.length; i++) {
      data[i].neighbors = {};
      for (var k = 0; k < kParamsObj.length; k++) {
        if (typeof data[i][kParamsObj[k].param] === 'number') {
          this.setNeighbors(data[i], trained, kParamsObj[k], classifier);
        }
      }

      for (var n in data[i].neighbors) {
        var neighbor = data[i].neighbors[n];
        var dist = 0;
        for (var p = 0; p < kParamsObj.length; p++) {
          dist += neighbor[kParamsObj[p].param] * neighbor[kParamsObj[p].param];
        }
        neighbor.distance = Math.sqrt(dist);
      }
    }
    return data;
  }

  getRange(data:any[], kParams:string[]) {
    let ranges : any = [],
      min = 1e20,
      max = 0;
    for (var j = 0; j < kParams.length; j++) {
      for (var d = 0; d < data.length; d++) {
        if (data[d][kParams[j]] < min) {
          min = data[d][kParams[j]];
        }

        if (data[d][kParams[j]] > max) {
          max = data[d][kParams[j]];
        }
      }
      ranges.push({
        param: kParams[j],
        min: min,
        max: max,
        range: max - min
      });
    };
    return ranges;
  }

  classify(data:any[], trainedData:any[], kParams:string[], classifier:string, nearestN:number) {
    let kParamsObj:any = this.getRange([].concat(data, trainedData), kParams);
    data = this.setDistances(data, trainedData, kParamsObj, classifier);
    let ordered : any = [];

    for (let d = 0; d < data.length; d++) {
      let results = {};
      ordered = this.sort(data[d].neighbors, 'distance');

      let n = 0;
      while (n < nearestN) {
        let current = ordered[n][classifier];
        results[current] = results[current] || 0;
        results[current] += 1;
        n++;
      }

      var max = 0,
        likeliest = '';
      for (let param in results) {
        if (results[param] > max) {
          max = results[param];
          likeliest = param;
        }
      }
      data[d][classifier] = likeliest;
    }

    return data;
  }
}
