let options, agents = [], step,
  actions,
  states,
  conditions,
  transitions,
  SEIRModel, PeopleMovementModel, mosqMovementModel,
  mosqModel, S, E, I, R, vitals, environment, mosqPathParams, mainPatch,
  pathogen = {recoveryTime: 6, mutationTime: 12};
let r = 100; //radius of cloud
let seed = 0x12345768;
let random = new Random(Random.engines.mt19937().seedWithArray([seed, 0x90abcdef]));
let bounds = [400, 300]; // for margin
let boundaries = {
  'people': {top:bounds[1], left:10, bottom:10, right:bounds[0]},
  'mosquitoes': {top:bounds[1] - 100, left:10, bottom:10, right:bounds[0] - 100},
}


function init(options){
  let numAgents = options.numberOfAgents;
  let infectedAtStart = options.infectedAtStart;
  step = options.step;
  raycaster.far = options.shedRange;
  step = options.step;

  pathogen = options.pathogen;
  pathogen.vectorBorne = true;
  pathogen.decayRate = options.decayRate;



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
      type: 'spatial',
      age: Math.round(random.real(0, 1) * 100) + 3,
      pathogenLoad: 0,
      states: {
        illness: 'succeptible'
      },
      prevX: 0,
      prevY: 0,
      needsBathroom: 0,
      timeInfectious: 0,
      timeRecovered: 0,
      mesh: mesh,
      waterAvailable: 100,
      waterPathConcentration: 0,
      dailyWaterRequired: 3000,
      boundaryGroup: 'people'
    };
    agents[i].physContact = -0.0135 * (Math.pow(agents[i].age - 43, 2)) + 8;
    agents[i].movePerDay = 350 - Math.abs(43 - agents[i].age) / 43 * 350 + 500;
    agents[i].mesh.qId = i;
    agents[i].mesh.type = 'agent';
    agents[i].mesh.position.x = random.real(boundaries.people.left + 1, boundaries.people.right);
    agents[i].mesh.position.y = random.real(boundaries.people.bottom + 1, boundaries.people.top);
    scene.add(agents[i].mesh);
  }

  S = new QEpiKit.Compartment("succeptible", 1 - infectedAtStart);
  E = new QEpiKit.Compartment("exposed", infectedAtStart * 0.5);
  I = new QEpiKit.Compartment("infectious", infectedAtStart * 0.5);
  R = new QEpiKit.Compartment("removed", 0);
  mosqPathParams = {
    transmissionRate: 0.16,
    latentTime: 1 / 3,
    recoveryRate: 1 / pathogen.recoveryTime,
    resuccept: 1 / pathogen.mutationTime
  };

  basicReproductiveNumber = mosqPathParams.transmissionRate / mosqPathParams.recoveryRate;

  vitals = {
    births: function(total) {
      return total * 0.000002;
    },
    deaths: function(total) {
      return -total * 0.000001;
    }
  };

  S.operation = function(step) {
    return (R.pop * mosqPathParams.resuccept * step) -(mosqPathParams.transmissionRate * S.pop * (I.pop + E.pop) * step) + (step * vitals.births(mosqModel.totalPop) + vitals.deaths(mosqModel.totalPop));
  };

  E.operation = function(step) {
    return (mosqPathParams.transmissionRate * S.pop * (I.pop + E.pop) * step) - (E.pop * mosqPathParams.latentTime * step);
  };

  I.operation = function(step) {
    return (E.pop * mosqPathParams.latentTime * step) - (I.pop * mosqPathParams.recoveryRate * step);
  };

  R.operation = function(step) {
    return (I.pop * mosqPathParams.recoveryRate * step) - (R.pop * mosqPathParams.resuccept * step);
  };

  mainPatch = new QEpiKit.Patch('main-patch', [S, E, I, R]);
  mainPatch.id = 500000;
  mainPatch.mesh = new THREE.Mesh(new THREE.CylinderGeometry( r, r, 2, 16), new THREE.MeshBasicMaterial({
    color: 0xcc00cc,
    transparent: true,
    opacity: 0.4
  }))
  mainPatch.mesh.rotation.x = Math.PI / 180 * 90;
  mainPatch.movePerDay = 300;
  mainPatch.shedOnBite = pathogen.shedRate;
  mainPatch.prevX = 0;
  mainPatch.prevY = 0;
  scene.add(mainPatch.mesh);
  mainPatch.mesh.position.x = random.real(boundaries.mosquitoes.left,boundaries.mosquitoes.right);
  mainPatch.mesh.position.y = random.real(boundaries.mosquitoes.bottom,boundaries.mosquitoes.top);
  mosqModel = new QEpiKit.CompartmentModel("infected-mosquitoes", [mainPatch]);
  mosqMovementModel = {
    name: 'mosqMovementModel',
    data : [mainPatch],
    update: function(agent, step){
      agent.mesh.material.color.g = S.pop;
      agent.mesh.material.color.r = I.pop;
      agent.mesh.material.color.b = R.pop;
      QActions.moveWithin(step, agent, boundaries.mosquitoes);
    }
  }
  SEIRModel = new QEpiKit.StateMachine('sir-model', states, transitions, conditions, agents);

  PeopleMovementModel = {
    name:'personMovement',
    data: agents,
    update: function(agent, step){
      QActions.moveWithin(step, agent, boundaries.people);
      if(pathogen.vectorBorne){
        let dist = agent.mesh.position.distanceTo(mainPatch.mesh.position);
        if(dist < r){
          agent.pathogenLoad += I.pop / dist * mainPatch.shedOnBite * step;
        }
      }
    }
  };
  environment = new QEpiKit.Environment([], [], [], 'random', function() {
    return random.real(0, 1);
  });
  environment.add(mosqModel);
  environment.add(mosqMovementModel);

  environment.add(SEIRModel);
  environment.add(PeopleMovementModel);
  environment.init();
  console.log(environment);
  render();
}
