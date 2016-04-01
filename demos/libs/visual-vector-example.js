let vectorPop, S, E, I, R, vitals, vecParams;

S = new QEpiKit.Compartment("succeptible", 0.999998);
E = new QEpiKit.Compartment("exposed", 0.000001);
I = new QEpiKit.Compartment("infectious", 0.000001);
R = new QEpiKit.Compartment("removed", 0);
seir = false;
sfParams = {
  transmissionRate: 0.16,
  latentTime: 1 / 3,
  recoveryRate: 1 / 7,
  resuccept: 1 / 90
};

vectorPop = new QEpiKit.CompartmentModel("seasonal-flu", step, [S, E, I, R], sfParams);
vitals = {
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
