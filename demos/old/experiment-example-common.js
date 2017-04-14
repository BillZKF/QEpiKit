var debug = document.getElementById('debug');
var maxWorkers = navigator.hardwareConcurrency || 4;
var totalWorkers = 250;
var startSeed = 0x12345678;
var seed = startSeed;
var datasets = {};
var set = 'start';
var experiment = 'start';
var logs = [];
var plots = {};

debug.innerHTML = ' / ' + maxWorkers + ' workers';

function runExperiment(options, script) {
  if (typeof Worker !== 'undefined') {
    options.runsPerWorker = Math.ceil(options.runs / maxWorkers);
    for (var i = 0; i < maxWorkers; i++) {
      createWorker(options, script);
    }
  }
}

function createWorker(options, script) {
  var worker = new Worker(script);
  worker.onmessage = function(event) {
    if (event.data[0] === 'progress') {
      if (document.querySelector('#' + event.data[1].param) !== null) {
        set = event.data[1].param;
        var newExp = true;
        datasets[set][0].x.push(event.data[1].paramValue);
        datasets[set][0].y.push(event.data[1].succeptible);
        Plotly.newPlot(set, datasets[set], layout);
      } else {
        var el = document.createElement('div');
        set = event.data[1].param;
        experiment = event.data[1].experiment;
        el.id = event.data[1].param;
        document.querySelector('#trendlines').innerHTML += "<h2>" + set + "</h2>";
        document.querySelector('#trendlines').appendChild(el);
        datasets[set] = [{
          name: event.data[1].experiment,
          mode: 'markers',
          type: 'scatter',
          x: [event.data[1].paramValue],
          y: [event.data[1].succeptible]
        }]
        Plotly.newPlot(set, datasets[set], layout);
      }
    }
    if (event.data[0] === 'complete') {
      var log = d3.csv.format(event.data[1]);
      logs = logs.concat(log);
      worker.terminate();
    }
    if (logs.length === maxWorkers) {
      var csvURI = "data:text/csv;charset=utf-8," + encodeURI(logs);
      var link = document.createElement("a");
      link.setAttribute("href", csvURI);
      link.setAttribute("download", "qepikit_experiment.csv");
      link.innerHTML = "CSV file";
      document.getElementById('status').appendChild(link);
    }
  }
  worker.postMessage([seed, options]); // start the worker.
  seed = seed + options.runsPerWorker;
}

var layout = {
  xaxis: {
    title: 'parameter value'
  },
  yaxis: {
    title: 'succeptible at finish'
  },
  margin: {
    t: 20
  },
  hovermode: 'closest'
};
