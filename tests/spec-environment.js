describe('An environment contains resources and model components', function() {
  var env, patch1, patch2, compartments, seasonalFlu, S, E, I, R, sfParams, vitals;

  beforeEach(function() {
    env = new QEpiKit.Environment();
    patch1 = new QEpiKit.GeoPatch("Chester", "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/USA/PA/Chester.geo.json", 6.5e6);
    patch2 = new QEpiKit.GeoPatch("Philadelphia", "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/USA/PA/Philadelphia.geo.json", 2e7);
    S = new QEpiKit.Compartment("succeptible", 0.999999);
    E = new QEpiKit.Compartment("exposed", 0.0000005);
    I = new QEpiKit.Compartment("infectious", 0.0000005);
    R = new QEpiKit.Compartment("removed", 0);
    sfParams = {
      transmissionRate: 0.16,
      latentTime: 1 / 3,
      recoveryRate: 1 / 7,
      resuccept: 1 / 90
    };
    seasonalFlu = new QEpiKit.CompartmentModel("seasonal-flu", 1, [S, E, I, R], sfParams);

    vitals = {
      births: function(total) {
        return total * 0.000002;
      },
      deaths: function(total) {
        return -total * 0.000001;
      }
    };


    S.operation = function() {
      return (R.pop * sfParams.resuccept * seasonalFlu.step) - (sfParams.transmissionRate * S.pop * (I.pop + E.pop) * seasonalFlu.step) + (seasonalFlu.step * vitals.births(seasonalFlu.totalPop) + vitals.deaths(seasonalFlu.totalPop));
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

  });

  it('should start at time 0', function() {
    expect(env.time).toBe(0);
  });
});
