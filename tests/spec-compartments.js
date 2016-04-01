var seasonalFlu, S, E, I, R, vitals, sfParams, environment, virginiaPatch;
describe('Compartment modeling is an equation based technique', function(){
  beforeEach(function(){
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

    basicReproductiveNumber = sfParams.transmissionRate / sfParams.recoveryRate;

    virginiaPatch = new QEpiKit.Patch('virginia', [S, E, I, R]);
    seasonalFlu = new QEpiKit.CompartmentModel("seasonal-flu", [virginiaPatch]);
    vitals = {
      births: function(total) {
        return total * 0.000002;
      },
      deaths: function(total) {
        return -total * 0.000001;
      }
    };

    S.operation = function(step) {
      return (R.pop * sfParams.resuccept * step) -(sfParams.transmissionRate * S.pop * (I.pop + E.pop) * step) + (step * vitals.births(seasonalFlu.totalPop) + vitals.deaths(seasonalFlu.totalPop));
    };

    E.operation = function(step) {
      return (sfParams.transmissionRate * S.pop * (I.pop + E.pop) * step) - (E.pop * sfParams.latentTime * step);
    };

    I.operation = function(step) {
      return (E.pop * sfParams.latentTime * step) - (I.pop * sfParams.recoveryRate * step);
    };

    R.operation = function(step) {
      return (I.pop * sfParams.recoveryRate * step) - (R.pop * sfParams.resuccept * step);
    };

    environment = new QEpiKit.Environment();
    environment.add(seasonalFlu);
  });

  it('should be able to create new compartments', function(){
    var F = new QEpiKit.Compartment("funerals", 0.0000001);
    expect(F.name).toBe('funerals');
  });

  it('should be able to run models', function(){
    environment.run(1,120,1);
    expect(S.pop * 100000).toBeLessThan(0.999998 * 1000000);
  });
});
