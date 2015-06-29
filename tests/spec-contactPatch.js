describe("A Contact Patch", function(){
  var School, Work, person1, person2;

  it("should have a constructor taking two arguments, name and capacity", function(){
    School = new QKit.ContactPatch("school", 1000);
    expect(School.capacity).toEqual(1000);
  });

  it("should create a new patch with an incremented id", function(){
    Work = new QKit.ContactPatch("work", 2);
    expect(Work.id).toEqual(2);
  });

  it("assign method should accept new agent if not full, and return patch id", function(){
    person1 = {id:1, age:50, time: 0, sick: false};
    person2 = {id:2, age:60, time: 0, sick: true};

    Work.assign(person1);
    expect(Work.pop).toEqual(1);

    person2.work = Work.assign(person2);
    expect(person2.work).toEqual(2);

    Work.assign({id:3, age:40});
    expect(Work.pop).toEqual(2);

  });

  it("should store contact pair values", function(){
    expect(Work.members[person1.id][person2.id]).toBeDefined();
  });

  it("should check for encounters in the patch", function(){
    var isWell = {key:"sick", value:false, check:QKit.Utils.equalTo, data:null};
    Work.encounters(person2, isWell, function(a, t){
      return true;
    },"sick");

    expect(QKit.ContactPatch.WIWArray.length).toBeGreaterThan(0);
    expect(QKit.ContactPatch.WIWArray[0].name).toBe("work");
  });
});
