'use esversion: 6';
//genetic tests
let ranges = [[10, 20],[10, 20],[10, 20],[10, 20]];
let target = 38;
let testCost = function(chroma, target){
  let x1 = mljs.invNorm(chroma.genes[0].code, ranges[0][0], ranges[0][1]);
  let x2 = mljs.invNorm(chroma.genes[1].code, ranges[1][0], ranges[1][1]);
  let x3 = mljs.invNorm(chroma.genes[2].code, ranges[2][0], ranges[2][1]);
  let x4 = mljs.invNorm(chroma.genes[3].code, ranges[3][0], ranges[3][1]);
  let val = (x2 + x1 + x3 + x4) - 12;
  return Math.abs(target - val);
}
let testGenetic = new mljs.Genetic(25, ranges, target, testCost);
testGenetic.run(100, true);
let winner = testGenetic.population[0];

let readNBest = function(ga, n){
  let output = '';
  for(let i = 0; i < n; i++){
    let sum = 0;
    let score = ga.population[i].score;
    let chroma = ga.population[i].genes.reduce((prev, next, idx)=>{
      let val = mljs.invNorm(next.code, ga.ranges[idx][0], ga.ranges[idx][1]);
      sum += val;
      return prev + ' ' + val;
    },'');
    output += `<div>${chroma} - 12 = ${sum - 12} || ${score}</div>`;
  }
  document.querySelector('body').innerHTML = output;
}

readNBest(testGenetic, 25);
