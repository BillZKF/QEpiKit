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
    console.log(json);
    const rf = new RandomForest();
  });
