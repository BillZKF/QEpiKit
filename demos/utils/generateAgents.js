function generatePop(numAgents, options, type, boundaries, currentAgentId) {
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
            type: type
        };
        //movement params
        pop[a].movePerDay = jStat.normal.inv(Math.random(), 2500 * 24, 1000); // m/day
        pop[a].prevX = 0;
        pop[a].prevY = 0;
        pop[a].movedTotal = 0;

        if (pop[a].type === 'continuous') {

            pop[a].mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 1), new THREE.MeshBasicMaterial({
                color: 0x00ff00
            }));
            pop[a].mesh.qId = pop[a].id;
            pop[a].mesh.type = 'agent';

            pop[a].position = {x:0,y:0,z:0};

            pop[a].position.x = random.real(boundaries.left, boundaries.right);
            pop[a].position.y = random.real(boundaries.bottom, boundaries.top);

            pop[a].mesh.position.x = pop[a].position.x;
            pop[a].mesh.position.y = pop[a].position.y;

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
        currentAgentId++;
    }
    for (var r = 0; r < infectedAtStart; r++) {
        pop[r].states.illness = 'infectious';
        pop[r].pathogenLoad = 8e4;
    }
    return [pop, locs];
}