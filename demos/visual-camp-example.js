'use strict()';
//for simple example, just do global scope entities
let options;
let environment;
let step = 0.01;
let agents = [];
let facilities = [];
let actions, states, conditions, transitions, SIRModel;
let seed = 0x12345678;
let random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
let distUnits = "miles";

//visualization objects
let scene = new THREE.Scene();
let raycaster = new THREE.Raycaster();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({
  alpha: true
});

//timeline objects

let duration = 21;
let infectious = 0;
let infoOverTime = [];
let margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
  },
  width = 480 - margin.left - margin.right,
  height = 250 - margin.top - margin.bottom;
let svg, x, y, xAxis, yAxis;


function init(opts) {
  options = opts;
  let bounds = [500, 400];
  let boundaries = {
    "tents": {
      left: 10,
      right: bounds[0] - 10,
      top: 150,
      bottom: 100
    },
    "waterPumps": {
      left: 10,
      right: 500,
      top: 400,
      bottom: 200
    },
    "bathrooms": {
      left: bounds[0] * 0.5 - 15,
      right: bounds[0] - 10,
      top: bounds[1] - 1,
      bottom: 200
    }
  };
  let numAgents = options.numberOfAgents;
  let numPumps = Math.ceil(options.numberOfAgents / 50);
  let infectedAtStart = options.infectedAtStart;
  raycaster.far = options.shedRange;
  step = options.step;

  let pathogen = options.pathogen;
  pathogen.decayRate = 200;
  pathogen['beta-Poisson'] = function(dose) {
    let response = 1 - Math.pow((1 + (dose / pathogen.N50) * (Math.pow(2, (1 / pathogen.optParam)) - 1)), (-pathogen.optParam));
    return response;
  }
  pathogen['exponential'] = function(dose) {
    let response = 1 - Math.exp(-pathogen.optParam * dose);
    return response;
  }

  var numTents = Math.ceil(numAgents / 5);
  var tents = [];
  var tentsPerRow = (boundaries.tents.right - boundaries.tents.left) / 10;
  for (var t = 0; t < numTents; t++) {
    tents[t] = {
      id: t,
      label: "tents",
      working: true,
      capacity: 5,
      type: 'unisex',
      units: "persons",
      pathConc: 0,
      status: 0
    }
    tents[t].mesh = new THREE.Mesh(new THREE.CubeGeometry(5, 5, 1), new THREE.MeshBasicMaterial({
      color: 0x22ccdd
    }));
    let row = Math.ceil((t + 1) / tentsPerRow);
    let col = t % tentsPerRow;
    tents[t].mesh.position.x = col * 10 + boundaries.tents.left;
    tents[t].mesh.position.y = row * 10 + boundaries.tents.bottom;
    scene.add(tents[t].mesh);
  }

  for (let i = 0; i < numAgents; i++) {
    let mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 1), new THREE.MeshBasicMaterial({
      color: 0x00ff00
    }));
    agents[i] = {
      id: i,
      type: 'agent',
      waterPump: null,
      bathroom: null,
      age: Math.round(random.real(0, 1) * 100) + 3,
      pathogenLoad: 0,
      states: {
        illness: 'succeptible'
      },
      prevX: 0,
      prevY: 0,
      timeInfectious: 0,
      timeRecovered: 0,
      gPerDayExcrete: 0.15,
      needsBathroom: 0,
      needsSleep: 0,
      mesh: mesh,
      objectives: [],
      pastObjectives: []
    };
    agents[i].tent = tents[Math.floor(i / 5)];
    agents[i].physContact = -0.0135 * (Math.pow(agents[i].age - 43, 2)) + 8;
    agents[i].movePerDay = 350 - Math.abs(43 - agents[i].age) / 43 * 350 + 500;
    setDailyWater(agents[i]); //sets the daily requirement and consumption rate.
    agents[i].mesh.qId = i;
    agents[i].mesh.type = 'agent';
    agents[i].mesh.position.x = random.real(0, 1) * bounds[0];
    agents[i].mesh.position.y = random.real(0, 1) * bounds[1];
    scene.add(agents[i].mesh);
  }

  var waterPumps = [];
  for (var wp = 0; wp < numPumps; wp++) {
    waterPumps[wp] = {
      id: wp
    };
    waterPumps[wp].mesh = new THREE.Mesh(new THREE.CubeGeometry(4, 4, 0.5), new THREE.MeshBasicMaterial({
      color: 0x00aacc
    }));
    waterPumps[wp].mesh.type = 'pump';
    waterPumps[wp].mesh.position.x = boundaries.waterPumps.right * random.real(0, 1) + boundaries.waterPumps.left;
    waterPumps[wp].mesh.position.y = boundaries.waterPumps.top * random.real(0, 1) + boundaries.waterPumps.bottom;
    waterPumps[wp].pathConc = 0;
    scene.add(waterPumps[wp].mesh);
  }

  var bathrooms = [];
  for (var b = 0; b < Math.ceil(agents.length / 50); b++) {
    bathrooms[b] = {
      id: b,
      label: "ventilated improved pit latrine",
      working: true,
      capacity: 1,
      type: 'unisex',
      units: "m3",
      pathConc: 0,
      status: 0
    }
    bathrooms[b].mesh = new THREE.Mesh(new THREE.CubeGeometry(7, 7, 0.5), new THREE.MeshBasicMaterial({
      color: 0x4444ff
    }));
    let row = Math.ceil((b + 1) / 2);
    let col = b % 2;

    bathrooms[b].mesh.position.x = col * 15 + boundaries.bathrooms.left;
    bathrooms[b].mesh.position.y = row * 15 + boundaries.bathrooms.bottom;
    scene.add(bathrooms[b].mesh);
  }

  for (var r = 0; r < infectedAtStart; r++) {
    var rIndex = Math.floor(waterPumps.length * random.real(0, 1));
    waterPumps[rIndex].pathConc = pathogen.shedRate;
  }

  cBored = {
    name: 'bored',
    x: function(subject, optionParams) {
      return 0.5;
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
      QActions.move(step, person);
      QActions.drink(step, person);
      person.needsSleep += step * 2;
    }
  };

  cNeedBathroom = {
    name: 'needBathroom',
    x: function(subject, optionParams) {
      return subject.needsBathroom;
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
      if (person.bathroom === null) {
        QActions.findClosest(step, person, bathrooms, 'bathroom');
      }
      if (person.mesh.position.distanceTo(person.bathroom.mesh.position) > 1) {
        QActions.moveTo(step, person, person.bathroom);
      } else {
        QActions.excrete(step, person, person.bathroom);
        person.bathroom = null;
      }
    }
  };

  cNeedWater = {
    name: 'needWater',
    x: function(subject, optionParams) {
      return 1 - subject.waterAvailable / this.extents[1];
    },
    extents: [0, 10000],
    f: QEpiKit.linear,
    m: 1,
    b: 0,
    k: 0
  };

  oWater = {
    name: 'getWater',
    considerations: [cNeedWater],
    action: function(step, person) {
      if (person.waterPump === null) {
        QActions.findClosest(step, person, waterPumps, 'waterPump');
      }
      if (person.mesh.position.distanceTo(person.waterPump.mesh.position) > 1) {
        QActions.moveTo(step, person, person.waterPump);
      } else {
        QActions.getWater(step, person, person.waterPump);
        person.waterPump = null;
      }
    }
  };

  cNeedSleep = {
    name: 'needSleep',
    x: function(subject, optionParams) {
      return subject.needsSleep;
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

  Sys = new QEpiKit.USys('camp', [oBathroom, oWater, oIdle, oSleep], agents);

  //at each step, based on the agent's current state, do one of these.
  states = {
    'succeptible': function(step, agent) {
      agent.mesh.material.color.set(0x00ff00);
      agent.timeRecovered = 0;
      agent.timeInfectious = 0;
      if (agent.pathogenLoad > 0) {
        agent.responseProb = pathogen[pathogen.bestFitModel](agent.pathogenLoad);
        agent.pathogenLoad -= pathogen.decayRate * Math.log(agent.pathogenLoad) * step;
      } else {
        agent.responseProb = 0;
        agent.pathogenLoad = 0;
      }
    },
    'infectious': function(step, agent) {
      infectious++;
      agent.mesh.material.color.set(0xff0000);
      agent.timeInfectious += jStat.normal.inv(random.real(0, 1), 1 * step, step);
    },
    'removed': function(step, agent) {
      agent.mesh.material.color.set(0x0000ff);
      if (agent.pathogenLoad > 2) {
        agent.pathogenLoad -= pathogen.decayRate * Math.log(agent.pathogenLoad) * step;
      } else {
        agent.pathogenLoad = 0;
      }
      agent.timeRecovered += 1 * step;
    }
  };

  //at each step, check if any of these conditions are met.
  conditions = {
    'infection': {
      key: 'responseProb',
      value: function() {
        var draw = random.real(0, 1);
        return draw;
      },
      check: QEpiKit.Utils.gt
    },
    'recovery': {
      key: 'timeInfectious',
      value: pathogen.recoveryTime,
      check: QEpiKit.Utils.gt
    },
    'resucceptible': {
      key: 'timeRecovered',
      value: pathogen.mutationTime,
      check: QEpiKit.Utils.gt
    }
  };

  //transitions specify what happens if a condition is met.
  transitions = [{
    name: 'infection',
    from: 'succeptible',
    to: 'infectious'
  }, {
    name: 'recovery',
    from: 'infectious',
    to: 'removed'
  }, {
    name: 'resucceptible',
    from: 'removed',
    to: 'succeptible'
  }];

  SIRModel = new QEpiKit.StateMachine('sir-model', states, transitions, conditions, agents);

  //the environmental class can takes resources, facilities, and events as its first three arguements. Here we have none. We've also set the agent activation to 'random'.
  environment = new QEpiKit.Environment([], [], [], 'random', function() {
    return random.real(0, 1);
  });
  environment.add(SIRModel);
  environment.add(Sys);

  environment.run(step, step * 2, 0);
  //live

  camera.position.z = bounds[0] * 0.4;
  camera.position.x = bounds[0] * 0.5;
  camera.position.y = bounds[1] * 0.5;
  camera.rotation.x = 8 * Math.PI / 180;
  document.querySelector('#ex-1').appendChild(renderer.domElement);
  renderer.setSize(screen.width, screen.height);
  renderer.setClearColor(0xffffff, 0)

  //timeline setup (lazy global scope)
  svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x = d3.scale.linear()
    .range([0, width]);

  y = d3.scale.linear()
    .range([height, 0]);

  line = d3.svg.line()
    .x(function(d) {
      return x(d.time);
    })
    .y(function(d) {
      return y(d.infectious);
    });

  xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
  console.log(environment);
  render();
}

function render() {
  if (environment.time <= duration) {
    infectious = 0;
    requestAnimationFrame(render);
    environment.update(step);
    environment.time += step;
    renderer.render(scene, camera);
    document.querySelector('#status').innerHTML = `<div>Time: ${Math.round(environment.time * 100) / 100}</div>
    <div>Infectious: ${infectious}</div>`;
    infoOverTime.push({
      time: environment.time,
      infectious: infectious
    });
    drawTimeline(infoOverTime);
  } else {
    let iCount = environment.agents.reduce(function(prev, current) {
      if (current.states.illness == 'infectious') {
        return prev + 1;
      }
      return prev;
    }, 0);
    seed++;
    //setOptions(options)
  }
}



function drawTimeline(data) {
  let maxInfect = d3.max(data, function(d) {
    return d.infectious
  });
  d3.select("g").selectAll("*").remove();
  x.domain([0, duration]);
  y.domain([0, maxInfect * 1.25]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("# of Infected");

  svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);
}
