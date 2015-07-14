var height = 280,
  width = 480,
  margin = 60;
var succeptible = new QEpiKit.Compartment("succeptible", 0.999999);
var infectious = new QEpiKit.Compartment("infectious", 0.000001);
var removed = new QEpiKit.Compartment("removed", 0);
var measPath = {
  transmissionRate: 0.15,
  recoveryRate: 0.1
};
var step = 1;
var sir = false;
var measles = new QEpiKit.CompartmentModel("measles", step, [succeptible, infectious, removed], measPath);
succeptible.operation = function() {
  return -measles.transmissionRate * succeptible.pop * infectious.pop * measles.step;
};
infectious.operation = function() {
  return (measles.transmissionRate * succeptible.pop * infectious.pop * measles.step) - (measles.recoveryRate * infectious.pop * measles.step);
};
removed.operation = function() {
  return measles.recoveryRate * infectious.pop * measles.step;
};
measles.runDuration = 365;
var sirDiagrams = new QEpiKit.renderer.compModelDiagrams(measles, "sir-diagrams");

function renderSIR() {
  measles.run();
  sirDiagrams.update();
}
sirDiagrams.update();


var S = new QEpiKit.Compartment("succeptible", 0.999998);
var E = new QEpiKit.Compartment("exposed", 0.000001);
var I = new QEpiKit.Compartment("infectious", 0.000001);
var R = new QEpiKit.Compartment("removed", 0);
var seir = false;
var sfParams = {
  transmissionRate: 0.16,
  latentTime: 1 / 3,
  recoveryRate: 1 / 7,
  resuccept: 1 / 90
};

var seasonalFlu = new QEpiKit.CompartmentModel("seasonal-flu", step, [S, E, I, R], sfParams);
seasonalFlu.runDuration = 730;
var vitals = {
  births: function(total) {
    return total * 0.000002;
  },
  deaths: function(total) {
    return -total * 0.000001;
  }
};

S.operation = function() {
  return (R.pop * sfParams.resuccept * seasonalFlu.step) -(sfParams.transmissionRate * S.pop * (I.pop + E.pop) * seasonalFlu.step) + (seasonalFlu.step * vitals.births(seasonalFlu.totalPop) + vitals.deaths(seasonalFlu.totalPop));
};

E.operation = function() {
  return (sfParams.transmissionRate * S.pop * (I.pop + E.pop) * seasonalFlu.step) - (E.pop * sfParams.latentTime * seasonalFlu.step);
};

I.operation = function() {
  return (E.pop * sfParams.latentTime * seasonalFlu.step) - (I.pop * sfParams.recoveryRate * seasonalFlu.step);
};

R.operation = function() {
  return (I.pop * sfParams.recoveryRate * seasonalFlu.step) - (R.pop * sfParams.resuccept * seasonalFlu.step);
};

seirsDiagrams = new QEpiKit.renderer.compModelDiagrams(seasonalFlu, "seirs-diagrams");
var renderSEIR = function(){
  seasonalFlu.run();
  seirsDiagrams.update();
};
seirsDiagrams.update();

function render(){
  if(seir){
    renderSEIR();
  }

  if(sir){
    renderSIR();
  }
  requestAnimationFrame(render);
}
render();
