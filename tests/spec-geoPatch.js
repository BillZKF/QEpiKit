describe('An geoPatch has physical dimesions',function(){
  var tract01;

  beforeEach(function(){
    trac01 = new QEpiKit.GeoPatch("Philadelphia", "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/USA/PA/Philadelphia.geo.json", 2e7);
  })

  it('should have a geoJSON centroid coordinate', function(){
    expect(trac01.name).toBe("Philadelphia");
  })

  it('should take a travelMap', function(){
    var travelMap = {
      "Chester": 100
    }
  })
})
