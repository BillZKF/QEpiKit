QUtils = {
    currentAgentId: 0,
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
    generatePop: function(numAgents, options, type, boundariesGroup) {

        var pop = [];
        var locs = {
            type: 'FeatureCollection',
            features: []
        };
        options = options || [];
        type = type || 'spatial';
        boundariesGroup = boundariesGroup || 'people';
        for (var a = 0; a < numAgents; a++) {
            pop[a] = {
                id: QUtils.currentAgentId,
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
                pop[a].mesh.qId = pop[a].id;
                pop[a].mesh.type = 'agent';

                pop[a].mesh.position.x = random.real(boundaries[boundariesGroup].left, boundaries[boundariesGroup].right);
                pop[a].mesh.position.y = random.real(boundaries[boundariesGroup].bottom, boundaries[boundariesGroup].top);

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
            QUtils.currentAgentId++;
        }
        return [pop, locs];
    },

    generateCliques: function(agents, options) {
        let numCliques = options.num,
        min = options.min,
        max = options.max,
        unique = options.unique,
        cliqueType = options.type,
        relTypes = options.relTypes
        likelihood = options.likelihood,
        color = options.color;
        let c = 0;
        let cliques = [];
        let notUsed = agents.map((a) => {
            return a.id
        });
        while (c < numCliques) {
            let nodes = [];
            let edges = [];
            let size = random.integer(min, max);
            let i = 0;
            while (i < size) {
                if (unique) {
                    if (notUsed.length > 0) {
                        let member = random.integer(0, notUsed.length - 1);
                        nodes.push({
                            id: notUsed[member]
                        });
                        notUsed.splice(member, 1);
                    }
                } else {
                    nodes.push(agents[random.integer(0, agents.length - 1)]);
                }
                i++;
            }
            nodes.forEach(function(node, k) {
                let j = k + 1;
                while (j < nodes.length) {
                  let draw = random.real(0, 1);
                    if (likelihood >= draw) {
                      edges.push(QUtils.createRelation(node, nodes[j], cliqueType + c, relTypes[random.integer(0, relTypes.length - 1)], color));
                    }
                    j++;
                }
            })
            cliques = cliques.concat(edges);
            c++;
        }

        return cliques;
    },

    generateGraph: function(agents, options) {
        let cliques = QUtils.generateCliques(agents, options);
        return cliques;
    },

    createRelation: function(a, b, clique, relType, color) {
        return {
            group: 'edges',
            data: {
                id: a.id + '-' + b.id,
                source: a.id,
                target: b.id,
                rel: relType,
                color:color,
                clique: clique
            }
        };
    }
};
