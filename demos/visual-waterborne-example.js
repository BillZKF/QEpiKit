'use strict()';
//for simple example, just do global scope entities
let options;
let environment;
let step = 0.01;
let agents = [];
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
  let numAgents = options.numberOfAgents;
  let numPumps = Math.ceil(options.numberOfAgents / 100);
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
      objectives: [],
      pastObjectives: []
    };
    agents[i].physContact = -0.0135 * (Math.pow(agents[i].age - 43, 2)) + 8;
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
    waterPumps[wp].mesh.position.x = random.real(0, 1) * bounds[0];
    waterPumps[wp].mesh.position.y = random.real(0, 1) * bounds[1];
    waterPumps[wp].pathogenLoad = 0;
    scene.add(waterPumps[wp].mesh);
  }

  for (var r = 0; r < infectedAtStart; r++) {
    var rIndex = Math.floor(waterPumps.length * random.real(0, 1));
    waterPumps[rIndex].pathogenLoad = pathogen.shedRate;
  }

  //some actions are shared across states.
  actions = {
    checkWater: function(step, agent) {
      if (agent.waterAvailable < 1) {
        let closest = 1e15;
        waterPumps.forEach(function(pump) {
          let dist = agent.mesh.position.distanceTo(pump.mesh.position);
          if (dist < closest) {
            closest = dist;
            agent.pump = pump;
          }
        })
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
      agent.waterPathConcentration += agent.pump.pathogenLoad * (agent.waterAvailable / 1000);
    },
    move: function(step, agent) {
      var maxDistPerDay = 500; //meters
      var ageM = maxDistPerDay - (Math.abs(43 - agent.age) / 43 * maxDistPerDay) + 3e-4;
      var x = random.real(-1, 1) * ageM + (agent.prevX * 0.98);
      var y = random.real(-1, 1) * ageM + (agent.prevY * 0.98);
      agent.mesh.position.y += x * step;
      agent.mesh.position.x += y * step;
      agent.mesh.rotation.z = Math.atan2(x * step, y * step);
      agent.prevX = x;
      agent.prevY = y;

    }
  };

  //at each step, based on the agent's current state, do one of these.
  states = {
    'succeptible': function(step, agent) {
      agent.mesh.material.color.set(0x00ff00);
      agent.timeRecovered = 0;
      agent.timeInfectious = 0;
      actions.move(step, agent);
      actions.checkWater(step, agent);
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
      actions.move(step, agent);
      actions.checkWater(step, agent);
      agent.timeInfectious += jStat.normal.inv(random.real(0, 1), 1 * step, step);
    },
    'removed': function(step, agent) {
      agent.mesh.material.color.set(0x0000ff);
      actions.move(step, agent);
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

  //the environmental class can takes resources, facilities, and events as its first three arguements. Here we have none. We've also set the agent activation to 'random'.
  environment = new QEpiKit.Environment([], [], [], 'random', function() {
    return random.real(0, 1);
  });
  environment.add(SIRModel);
  environment.run(step, step * 2, 0);

  //live

  camera.position.z = bounds[0] * 0.3 ;
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
