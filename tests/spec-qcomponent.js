describe('QComponents are the base class of many models', function(){
  it('should be able to instantiate a base QComponent', function(){
    var c = new QEpiKit.QComponent("charles");
    expect(c.id.length).toBe(36);
  });

  it('calling the update method should advance time', function(){
    var c = new QEpiKit.QComponent("charles");
    c.update(1);
    expect(c.time).toBe(1);
  });

  it('calling the run method should advance time by step, until', function(){
    var c = new QEpiKit.QComponent("charles");
    c.run(0.5, 8, 4);
    expect(c.time).toBe(8.5);
  });


});
