describe('QComponents are the base class of many models', function(){
  it('should be able to instantiate a base QComponent', function(){
    var c = new QEpiKit.QComponent("charles");
    expect(c.id.length).toBe(36);
  });
});
