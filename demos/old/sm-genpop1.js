schools = {"type": "FeatureCollection",
  "features":[{
  "type": "Feature",
  "properties": {name:'south-school', capacity:1600},
  "geometry": {
    "type": "Point",
    "coordinates": [39.92122, -75.16923]
  }
}, {
  "type": "Feature",
  "properties": {name:'north-school', capacity:1400},
  "geometry": {
    "type": "Point",
    "coordinates": [39.99797, -75.1606]
  }
}]};

workplaces = {"type": "FeatureCollection",
  "features":[{
  "type": "Feature",
  "properties": {name:'ibex', capacity:1345},
  "geometry": {
    "type": "Point",
    "coordinates": [39.95462, -75.15987]
  }
}, {
  "type": "Feature",
  "properties": {name:'comcat', capacity:1437},
  "geometry": {
    "type": "Point",
    "coordinates": [39.95380, -75.17047]
  }
}, {
  "type": "Feature",
  "properties": {name:'serpta', capacity:1530},
  "geometry": {
    "type": "Point",
    "coordinates": [39.95255, -75.16395]
  }
}, {
  "type": "Feature",
  "properties": {name:'gov', capacity:1650},
  "geometry": {
    "type": "Point",
    "coordinates": [39.95265, -75.15927]
  }
}]};

neighborhoods = {"type": "FeatureCollection",
  "features":[{
    "type": "Feature",
    "properties": {name:'north-philadelphia', capacity:1400},
    "geometry": {
      "type": "Point",
      "coordinates": [39.92122, -75.16923]
    }
  },{
    "type": "Feature",
    "properties": {name:'center-city', capacity:1400},
    "geometry": {
      "type": "Point",
      "coordinates": [39.95255, -75.16395]
    }
  }, {
    "type": "Feature",
    "properties": {name:'south-philadelphia', capacity:1400},
    "geometry": {
      "type": "Point",
      "coordinates": [39.92122, -75.16923]
    }
  }]};

function genPatches(){
  wpPatches = {};
  for (var i = 0; i < workplaces.features.length; i++) {
    loc = workplaces.features[i];
    wpPatches[loc.properties.name] = new QEpiKit.ContactPatch(loc.properties.name, loc.properties.capacity);
    wpPatches[loc.properties.name].location = loc;
  }

  schoolPatches = {};
  for (var ii = 0; ii < schools.features.length; ii++) {
    loc = schools.features[ii];
    schoolPatches[loc.properties.name] = new QEpiKit.ContactPatch(loc.properties.name, loc.properties.capacity);
    schoolPatches[loc.properties.name].location = loc;
  }

  nhPatches = {};
  for (var k = 0; k < neighborhoods.features.length; k++) {
    loc = neighborhoods.features[k];
    nhPatches[loc.properties.name] = new QEpiKit.ContactPatch(loc.properties.name, loc.properties.capacity);
    nhPatches[loc.properties.name].location = loc;
  }
};

function genPop(numAgents){
  var agents = [];
  genPatches();
  locations = turf.random('points', numAgents, {
    bbox: [-75.1867, 39.9900, -75.1467, 39.9200]
  });
  for (var j = 0; j < numAgents; j++) {
    agents[j] = {
      id: j,
      time: 0,
      age: random.integer(4, 65),
      moveRate: random.real(0.2, 5), //miles per day
      states: {
        'illness': 'succeptible',
        'activity': 'atHome'
      },
      responseProb: 0,
      pathogenLoad: 0, //shed per hour
      location: locations.features[j]
    };
    agents[j].hospProb = Math.pow(agents[j].age - 44, 2) * 0.0005;
    agents[j].location.properties.agentRefID = agents[j].id;
    if (agents[j].age < 20) {
      var ns = turf.nearest(agents[j].location, schools);
      schoolPatches[ns.properties.name].assign(agents[j], schoolEncProb);
      agents[j].occupationPatch = ns.properties.name;
      agents[j].activitySchedule = [0.3, 0.625];
      agents[j].sleepSchedule = [random.real(0.79, 0.96), random.real(1.2, 1.23)];
    } else {
      var nw = turf.nearest(agents[j].location, workplaces);
      wpPatches[nw.properties.name].assign(agents[j], workEncProb);
      agents[j].occupationPatch = nw.properties.name;
      agents[j].activitySchedule = [0.38, 0.75];
      agents[j].sleepSchedule = [random.real(0.84, 0.96), random.real(1.2, 1.23)];
    }
    var h = turf.nearest(agents[j].location, neighborhoods);
    nhPatches[h.properties.name].assign(agents[j], neighborhoodEncProb);
    agents[j].homePatch = h.properties.name;
  }
  return agents;
}
