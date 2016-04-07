QUtils = {
  //place objects within a boundary in rows and cols
  arrangeEvenWithin(array, footprint, margin, boundaries) {
    let full = footprint + margin;
    let perRow = (boundaries.right - boundaries.left) / full;
    for (let i = 0; i < array.length; i++) {
      let row = Math.ceil((i + 1) / perRow);
      let col = i % perRow;
      array[i].mesh.position.x = col * full + boundaries.left;
      array[i].mesh.position.y = row * full + boundaries.bottom;
    }
  },

  //generate population using boilerplate params for movement, contacts, etc.
  generatePop: function(numAgents, options, type) {
    var pop = [];
    var locs = {
      type: 'FeatureCollection',
      features: []
    };
    type = type || 'spatial';
    for (var a = 0; a < numAgents; a++) {
      pop[a] = {
        id: a,
        type: type,
        sex: random.pick(['male', 'female']),
        age: random.integer(5, 85),
      };
      //movement params
      pop[a].movePerDay = jStat.normal.inv(random.real(0, 1), 2500 * 24, 1000); // m/day
      pop[a].prevX = 0;
      pop[a].prevY = 0;
      pop[a].movedTotal = 0;

      if (pop[a].type === 'spatial') {
        pop[a].mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 1), new THREE.MeshBasicMaterial({
          color: 0x00ff00
        }));
        pop[a].mesh.qId = a;
        pop[a].mesh.type = 'agent';
        pop[a].mesh.position.x = random.real(boundaries.people.left, boundaries.people.right);
        pop[a].mesh.position.y = random.real(boundaries.people.bottom, boundaries.people.top);
        scene.add(pop[a].mesh);
      }

      if (pop[a].type === 'geospatial') {
        locs.features[a] = turf.point([random.real(-75.1467, -75.1867), random.real(39.9200, 39.9900)]);
        pop[a].location = locs.features[a];
        pop[a].location.properties.agentRefID = pop[a].id;
      }

      options.forEach((d) => {
        if (typeof d.assign === 'function') {
          pop[a][d.name] = d.assign(pop[a]);
        } else {
          pop[a][d.name] = d.assign;
        }
      });
    }
    return [pop, locs];
  }
};
