describe("A Contact Patch", function(){
  var School, Work, person1, person2;

  it("should have a constructor taking two arguments, name and capacity", function(){
    School = new QEpiKit.ContactPatch("school", 1000);
    expect(School.capacity).toEqual(1000);
  });

  it("should create a new patch with an incremented id", function(){
    Work = new QEpiKit.ContactPatch("work", 2);
    expect(Work.id.length).toEqual(36);
  });

  it("assign method should accept new agent if not full, and return patch id", function(){
    person1 = {id:1, age:50, time: 0, sick: false};
    person2 = {id:2, age:60, time: 0, sick: true};

    Work.assign(person1);
    expect(Work.pop).toEqual(1);

    person2.work = Work.assign(person2);
    expect(person2.work).toEqual(Work.id);

    Work.assign({id:3, age:40});
    expect(Work.pop).toEqual(2);

  });

  it("should store contact pair values", function(){
    expect(Work.members[person1.id][person2.id]).toBeDefined();
  });

  it("should check for encounters in the patch", function(){
    var isWell = {key:"sick", value:false, check:QEpiKit.Utils.equalTo, data:null};
    Work.encounters(person2, isWell, function(a, t){
      return true;
    },"sick", true);

    expect(QEpiKit.ContactPatch.WIWArray.length).toBeGreaterThan(0);
    expect(QEpiKit.ContactPatch.WIWArray[0].name).toBe("work");
  });
});
