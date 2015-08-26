describe('Utils class contains common methods used for a variety of purposes', function() {
  it('should be able to create a csv from a formatted array', function() {
    var data = [
      ["id", "name", "age"],
      [1, "Randy", 68],
      [2, "Laura", 65]
    ];

    var uri = QEpiKit.Utils.createCSVURI(data);
    expect(typeof(uri)).toBe('string');

  });

  it('should have multiple "matcher" methods for checking conditions', function(){
    expect(QEpiKit.Utils.notEqualTo(5,6)).toBe(QEpiKit.Utils.SUCCESS);
    expect(QEpiKit.Utils.notEqualTo(6,6)).toBe(QEpiKit.Utils.FAILED);


    var test = {"bakingSoda":0, "vinegar":1};
    expect(QEpiKit.Utils.hasProp(test.vinegar,1)).toBe(QEpiKit.Utils.SUCCESS);
    expect(QEpiKit.Utils.hasProp(test.volcano,true)).toBe(QEpiKit.Utils.FAILED);
    expect(QEpiKit.Utils.hasProp(test.volcano,false)).toBe(QEpiKit.Utils.SUCCESS);

  });

  it('should be able to produce readable matcher strings', function() {
    var m = [];
    m[0] = QEpiKit.Utils.getMatcherString(QEpiKit.Utils.equalTo);
    m[1] = QEpiKit.Utils.getMatcherString(QEpiKit.Utils.notEqualTo);
    m[2] = QEpiKit.Utils.getMatcherString(QEpiKit.Utils.gt);
    m[3] = QEpiKit.Utils.getMatcherString(QEpiKit.Utils.gtEq);
    m[4] = QEpiKit.Utils.getMatcherString(QEpiKit.Utils.lt);
    m[5] = QEpiKit.Utils.getMatcherString(QEpiKit.Utils.ltEq);
    m[6] = QEpiKit.Utils.getMatcherString(QEpiKit.Utils.hasProp);
    m[7] = QEpiKit.Utils.getMatcherString(function(){});
  
    expect(m[0]).toBe("equal to");
    t = 0;
    m.forEach(function(d){

      if(typeof(d) === 'string'){
        t++;
      } else {

      }
    });
    expect(m.length).toBe(t);
  });

  it('should take some params and set min, max, standard on base and error values', function(){
    var params = {"weightLoss":{current:null, error: 1, value: 3}, "weightGain":{current:null, error: 0.5, value:4} };
    QEpiKit.Utils.setMin(params, ["weightLoss"]);
    expect(params.weightLoss.current).toBe(2);
    QEpiKit.Utils.setMin(params);
    expect(params.weightGain.current).toBe(3.5);

    QEpiKit.Utils.setMax(params, ["weightLoss"]);
    expect(params.weightLoss.current).toBe(4);
    QEpiKit.Utils.setMax(params);
    expect(params.weightGain.current).toBe(4.5);

    QEpiKit.Utils.setStandard(params, ["weightLoss"]);
    expect(params.weightLoss.current).toBe(3);
    QEpiKit.Utils.setStandard(params);
    expect(params.weightGain.current).toBe(4);

  });
});
