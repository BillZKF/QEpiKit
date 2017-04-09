'use strict'
let trainingData;
const myHeaders = new Headers();

const cors = { method: 'GET',
               headers: myHeaders,
               mode: 'cors',
               cache: 'default'};

window.fetch('http://localhost/api/dataset/?title=Titanic%20Training', cors)
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    //dataClean
    json.entries.forEach(d => {
      json.properties.forEach(p => {
        if(p.type === 'number'){
          d[p.name] = Number(d[p.name]);
        }
        if(p.type === 'boolean'){
          d[p.name] = Number(d[p.name]);
        }
      })
    })
    trainingData = json.entries.filter((d) => {
      //if(typeof d.Age > 0 && )
    });

    let KMean = new kMean(trainingData.entries, ['Age, Fare'], 4);
    let result = KMean.run();
    console.log(result);
  });
