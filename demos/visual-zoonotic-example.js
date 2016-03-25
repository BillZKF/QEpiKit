'use strict'
//for simple example, just do global scope entities
let options;
let environment;
let step = 0.01;
let agents = [];
let livestock = [];
let water;
let pathogen;
let actions, states, conditions, transitions, SIRModel, SIRLivestockModel;
let seed = 0x12345678;
let random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));

//visualization objects
let scene = new THREE.Scene();
let raycaster = new THREE.Raycaster();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({
  alpha: true
});

//timeline objects
let svg, x, y, xAxis, yAxis, line;
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

function init(options) {
  let bounds = [300, 100]; // for margin
  let boundaries = {
    "livestock": {
      top: 50,
      bottom: 10,
      left: 10,
      right: 70
    },
    "people": {
      top: 140,
      bottom: 50,
      left: 150,
      right: 300
    }
  }
  let numLivestock = 50;
  let numAgents = options.numberOfAgents;
  let infectedAtStart = options.infectedAtStart;
  raycaster.far = options.shedRange;
  step = options.step;

  pathogen = options.pathogen;
  pathogen.decayRate = 200;
  pathogen['beta-Poisson'] = function(dose) {
    let response = 1 - Math.pow((1 + (dose / pathogen.N50) * (Math.pow(2, (1 / pathogen.optParam)) - 1)), (-pathogen.optParam));
    return response;
  }
  pathogen['exponential'] = function(dose) {
    let response = 1 - Math.exp(-pathogen.optParam * dose);
    return response;
  }

  water = {
    width: 80,
    length: 80,
    depth: 10,
    pathConc: 0
  }

  water.mesh = new THREE.Mesh(new THREE.PlaneGeometry(water.width, water.length), new THREE.MeshBasicMaterial({
    color: 0x5599ff
  })),
  water.volume = water.width * water.length * water.depth,
  water.mesh.position.x = 110;
  water.mesh.position.y = 60;
  scene.add(water.mesh);

  for (let i = 0; i < numAgents; i++) {
    let mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 1), new THREE.MeshBasicMaterial({
      color: 0x00ff00
    }));
    agents[i] = {
      id: i,
      type: 'agent',
      age: Math.round(random.real(0, 1) * 100) + 3,
      pathogenLoad: 0,
      states: {
        illness: 'succeptible'
      },
      prevX: 0,
      prevY: 0,

      timeInfectious: 0,
      timeRecovered: 0,
      mesh: mesh,
      waterAvailable: 100,
      waterPathConcentration: 0,
      dailyWaterRequired: 3000,
      boundaryGroup: 'people'
    };
    agents[i].physContact = -0.0135 * (Math.pow(agents[i].age - 43, 2)) + 8;
    agents[i].mesh.qId = i;
    agents[i].mesh.type = 'agent';
    agents[i].mesh.position.x = random.real(boundaries.people.left, boundaries.people.right);
    agents[i].mesh.position.y = random.real(boundaries.people.bottom, boundaries.people.top);
    scene.add(agents[i].mesh);
  }

  for (var j = 0; j < numLivestock; j++){
    livestock[j] = {
      id : j + numAgents,
      age : 5,
      prevX: 0,
      prevY: 0,
      mesh : new THREE.Mesh(new THREE.CubeGeometry(2, 1, 0.5), new THREE.MeshBasicMaterial({color: 0xcc44cc})),
      pathogenLoad: 0,
      timeInfectious: 0,
      timeRecovered: 0,
      waterAvailable: 100,
      waterPathConcentration: 0,
      dailyWaterRequired: 3000,
      gPerDayExcrete: 4000,
      states: {
        illness: 'succeptible'
      },
      boundaryGroup: 'livestock'
    }
    livestock[j].physContact = numLivestock;
    livestock[j].mesh.qId = j + numAgents;
    livestock[j].mesh.position.x = random.real(boundaries.livestock.left, boundaries.livestock.right);
    livestock[j].mesh.position.y = random.real(boundaries.livestock.bottom, boundaries.livestock.top);
    livestock[j].mesh.type = 'agent';
    scene.add(livestock[j].mesh);
  }

  for (var r = 0; r < infectedAtStart; r++) {
    var rIndex = Math.floor(numLivestock * random.real(0, 1));
    livestock[rIndex].states.illness = 'infectious';
    livestock[rIndex].pathogenLoad = 1e4;
  }

  //some actions are shared across states.
  actions = {
    contact: function(step, agent) {
      var contactAttempts = agent.physContact * step;
      for (var j = 0; j < contactAttempts; j++) {
        let dir = new THREE.Vector3(random.real(-1, 1), random.real(-1, 1), 0)
        raycaster.set(agent.mesh.position, dir);
        let intersects = raycaster.intersectObjects(scene.children);
        intersects.forEach(function(d) {
          if (d.object.type === 'agent') {
            let contactedAgent = environment.agents[environment._agentIndex[d.object.qId]];
            if (contactedAgent.states.illness === 'succeptible') {
              contactedAgent.pathogenLoad += jStat.normal.inv(random.real(0, 1), pathogen.shedRate * step, pathogen.shedRate * step);
              contactedAgent.lastInfectedContact = agent.id;
              contactedAgent.responseProb = pathogen[pathogen.bestFitModel](contactedAgent.pathogenLoad);
            }
          }
        });
      }
    },
    excrete: function(step, agent){
      water.pathConc += agent.gPerDayExcrete * step / (water.volume * 1000);
    },
    checkWater: function(step, agent) {
      if (agent.waterAvailable < 1) {
        actions.getWater(step, agent);
      } else {
        actions.drink(step, agent);
      }
    },
    drink: function(step, agent) {
      agent.waterAvailable -= agent.dailyWaterRequired * step;
      agent.pathogenLoad += agent.waterPathConcentration * step;
    },
    getWater: function(step, agent) {
      agent.waterAvailable += agent.dailyWaterRequired * 0.333; //needs to get water 3 times a day
      agent.waterPathConcentration += water.pathConc * (agent.waterAvailable / 1000);
    },
    moveWithin: function(step, agent) {
      var boundry = boundaries[agent.boundaryGroup];
      var maxDistPerDay = 500;
      var individualRate = maxDistPerDay - (Math.abs(43 - agent.age) / 43 * maxDistPerDay) + 3e-4;
      var dx = step * (random.real(-1, 1) * individualRate + (agent.prevX * 0.98));
      var dy = step * (random.real(-1, 1) * individualRate + (agent.prevY * 0.98));
      var nextX = agent.mesh.position.x + dx;
      var nextY = agent.mesh.position.y + dy;
      if (nextX > boundry.right) {
        dx = 0;
      }
      if (nextX < boundry.left){
        dx = 0;
      }
      if (nextY > boundry.top ) {
        dy = 0;
      }
      if (nextY < boundry.bottom){
        dy = 0;
      }
        agent.mesh.position.x += dx;
        agent.mesh.position.y += dy;
        agent.mesh.rotation.z = Math.atan2(dx, dy);
        agent.prevX = dx / step;
        agent.prevY = dy / step;
    }
  };

  //at each step, based on the agent's current state, do one of these.
  states = {
    'succeptible': function(step, agent) {
      agent.mesh.material.color.set(0x00ff00);
      agent.timeRecovered = 0;
      agent.timeInfectious = 0;
      actions.checkWater(step, agent);
      actions.moveWithin(step, agent);
      if (agent.pathogenLoad > 0) {
        agent.responseProb = pathogen[pathogen.bestFitModel](agent.pathogenLoad);
        agent.pathogenLoad -= pathogen.decayRate * Math.log(agent.pathogenLoad) * step;;
      } else {
        agent.responseProb = 0;
        agent.pathogenLoad = 0;
      }
    },
    'infectious': function(step, agent) {
      infectious++;
      agent.mesh.material.color.set(0xff0000);
      actions.moveWithin(step, agent);
      actions.checkWater(step, agent);
      actions.contact(step, agent);
      if(agent.boundaryGroup === 'livestock'){
        actions.excrete(step, agent);
      }
      agent.timeInfectious += 1 * step;
    },
    'removed': function(step, agent) {
      agent.mesh.material.color.set(0x0000ff);
      actions.moveWithin(step, agent);
      actions.checkWater(step, agent);
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
  SIRLivestockModel = new QEpiKit.StateMachine('sir-livestock-model', states, transitions, conditions, livestock);

  //the environmental class can takes resources, facilities, and events as its first three arguements. Here we have none. We've also set the agent activation to 'random'.
  environment = new QEpiKit.Environment([], [], [], 'random', function() {
    return random.real(0, 1);
  });
  environment.add(SIRModel);
  environment.add(SIRLivestockModel);
  environment.run(step, step * 2, 0);

  //live update
  camera.position.z = 120;
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
  render();
}

function render() {
  if (environment.time <= duration) {
    infectious = 0;
    requestAnimationFrame(render);
    water.mesh.material.color.r = water.pathConc / pathogen.N50;
    water.mesh.material.color.g = water.pathConc / pathogen.N50;
    water.mesh.material.color.b = 1 - water.pathConc / pathogen.N50;
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
