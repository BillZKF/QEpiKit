'use strict'
let prefModels = [];
const myHeaders = new Headers();

const cors = {
  method: 'GET',
  headers: myHeaders,
  mode: 'cors',
  cache: 'default'
};
const baseURL = `reference_data.json`;
window.fetch(`${baseURL}`, cors).then(function (res) {
  return res.json();
}).then(function (json) {
  prefModels = json.organisms;
  prefModels.forEach(model => {
    let el = document.createElement('option');
    el.innerHTML = el.name = model.name;
    document.querySelector('#select-pathogen').appendChild(el)
  })
  showPathogen({target:{value:prefModels[0].name}});
})

function showPathogen(event) {
  let pathogenName = event.target.value;
  let pathogen = prefModels.filter(model => {
    if (model.name === pathogenName) {
      return true;
    }
    return false;
  })
  pathogen = pathogen[0];
  document.querySelector('#model').innerHTML = pathogen['model'];
  document.querySelector('#N50').value = pathogen['N50'];
  document.querySelector('#opt-param').value = pathogen.optimizedParam;
}

function setOptions(model) {
  let options = {};
  let pathogenName = document.querySelector('#select-pathogen').value;
  options.step = Number(document.querySelector('#model-step').value);

  options.numberOfAgents = Number(document.querySelector('#number-agents').value);
  options.shedRange = Number(document.querySelector('#shed-range').value);
  options.infectedAtStart = Number(document.querySelector('#number-at-start').value);
  options.pathogen = prefModels.filter(model => {
    if (model.name === pathogenName) {
      return true;
    }
    return false;
  })
  options.pathogen = options.pathogen[0];
  //rename badly named params
  options.pathogen.shedRate = Number(document.querySelector('#shed-rate').value);
  options.pathogen.mutationTime = Number(document.querySelector('#mutation-time').value);
  options.pathogen.recoveryTime = Number(document.querySelector('#recovery-time').value);
  options.pathogen.N50 = Number(options.pathogen["N50"]);
  options.pathogen.bestFitModel = options.pathogen["model"];
  options.pathogen.optParam = Number(options.pathogen["optimizedParam"]);
  options.pathogen.decayRate = Number(document.querySelector('#decay-rate').value);
  init(options);
}

function setDailyWater(agent){
  agent.dailyWaterRequired = 909;
  agent.waterAvailable = jStat.normal.inv(random.real(0, 1), agent.dailyWaterRequired, agent.dailyWaterRequired * 0.5);
  agent.waterPathConcentration = 0;
}
