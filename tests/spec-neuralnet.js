"use strict()";
var dataset = [];
var labels = [];
var forBrain = [];
let x = [];
let y = [];
let ox = [];
let oy = [];
let count = 0;
for (let i = 0; i < 1000; i++) {
    let kg = (150 - 60) * Math.random() + 60;
    let m = (2.0 - 1.5) * Math.random() + 1.5

    dataset[i] = [(kg - 60) / (150 - 60), (m - 1.5) / (2.0 - 1.5)];
    labels[i] = kg / Math.pow(m, 2) >= 26 ? [1] : [0];
    forBrain.push({input:{kg:dataset[i][0],m:dataset[i][1]},output:{obese:labels[i]}});
    if (labels[i] == 0) {
      x.push(dataset[i][0]);
      y.push(dataset[i][1]);
        count++;
    } else {
      ox.push(dataset[i][0]);
      oy.push(dataset[i][1]);
    }
}
//Plotly.plot('plot', [{x:x,y:y, mode:'markers', type:'scatter'},{x:ox,y:oy, mode:'markers', type:'scatter'}])
//net.train(forBrain);
var network = new mljs.Network(dataset, labels, [5,5,2], '#nn','tanh');
var update = function(){
  network.learn(80000, dataset, labels, 80000);
}
