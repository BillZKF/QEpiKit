describe('Simple epidemiological utility functions', function(){
  it('prevalence should return a proportion', function(){
      var p = QEpiKit.Epi.prevalence(2567, 5607783);
      expect(p).toBeLessThan(1);
  });

  it('risk difference should return a ratio', function(){
      var t = {a:1293,b:2455,c:1707,d:3321};
      var rd = QEpiKit.Epi.riskDifference(t);
      expect(rd).toBe(0.0054851847795355235);
  });

  it('risk ratio should return a ratio', function(){
      var t = {a:1293,b:2455,c:1707,d:3321};
      var rr = QEpiKit.Epi.riskRatio(t);
      expect(rr).toBe(1.0161567129885791);
  });

  it('odds ratio should return a ratio', function(){
      var t = {a:1293,b:2455,c:1707,d:3321};
      var or = QEpiKit.Epi.oddsRatio(t);
      expect(or).toBe(1.0246661345340917);
  });
});
