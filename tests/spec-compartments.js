var seasonalFlu, S, E, I, R, vitals, sfParams;
describe('Compartment modeling is an equation based technique', function(){
  beforeEach(function(){
    var step = 1;
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

    seasonalFlu = new QEpiKit.CompartmentModel("seasonal-flu", step, [S, E, I, R], sfParams);
    seasonalFlu.runDuration = 730;
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


  });

  it('should be able to create new compartments', function(){
    var F = new QEpiKit.Compartment("funerals", 0.0000001);
    expect(F.name).toBe('funerals');
  });

  it('should be able to run models', function(){
    seasonalFlu.run(1,30,5);
    expect(seasonalFlu.compartments[1].pop).toBeLessThan(0.999998);
  });
});
