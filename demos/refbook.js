'use strict'
let prefModels = [];
const myHeaders = new Headers();

const cors = {
  method: 'GET',
  headers: myHeaders,
  mode: 'cors',
  cache: 'default'
};
const baseURL = `http://104.131.48.182:3000/`;
window.fetch(`${baseURL}api/dataset/56e6fea96612902d330ae763`, cors).then(function (res) {
  return res.json();
}).then(function (json) {
  prefModels = json.entries;
  prefModels.forEach(model => {
    let el = document.createElement('option');
    el.innerHTML = el.name = model["Agent"];
    document.querySelector('#select-pathogen').appendChild(el)
  })
  showPathogen({target:{value:prefModels[0]["Agent"]}});
})

function showPathogen(event) {
  let pathogenName = event.target.value;
  let pathogen = prefModels.filter(model => {
    if (model["Agent"] === pathogenName) {
      return true;
    }
    return false;
  })
  pathogen = pathogen[0];
  document.querySelector('#model').innerHTML = pathogen['Best fit model'];
  document.querySelector('#N50').value = pathogen['N50/LD50/ID50'];
  document.querySelector('#opt-param').value = pathogen["Optimized parameter"];
}

function setOptions(model) {
  let options = {}
  let pathogenName = document.querySelector('#select-pathogen').value;
  options.step = Number(document.querySelector('#model-step').value);

  options.numberOfAgents = Number(document.querySelector('#number-agents').value);
  options.shedRange = Number(document.querySelector('#shed-range').value);
  options.infectedAtStart = Number(document.querySelector('#number-at-start').value);
  options.pathogen = prefModels.filter(model => {
    if (model["Agent"] === pathogenName) {
      return true;
    }
    return false;
  })
  options.pathogen = options.pathogen[0];
  //rename badly named params
  options.pathogen.shedRate = Number(document.querySelector('#shed-rate').value);
  options.pathogen.mutationTime = Number(document.querySelector('#mutation-time').value);
  options.pathogen.recoveryTime = Number(document.querySelector('#recovery-time').value);;
  options.pathogen.N50 = Number(options.pathogen["N50/LD50/ID50"]);
  options.pathogen.bestFitModel = options.pathogen["Best fit model"];
  options.pathogen.optParam = Number(options.pathogen["Optimized parameter"]);

  init(options);
}

function setDailyWater(agent){
  agent.dailyWaterRequired = 909;
  agent.waterAvailable = jStat.normal.inv(random.real(0, 1), agent.dailyWaterRequired, agent.dailyWaterRequired * 0.5);
  agent.waterPathConcentration = 0;
}
