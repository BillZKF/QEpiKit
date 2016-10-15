//visualization objects
/* jshint esversion: 6*/
let scene = new THREE.Scene();
let raycaster = new THREE.Raycaster();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
let renderer = new THREE.WebGLRenderer({
  alpha: true
});

//timeline objects
let svg, x, y, xAxis, yAxis, line;
let duration = 21;
let infectious = 0;
let lastInfectious = 0;
let infoOverTime = [];
let margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
  },
  width = 480 - margin.left - margin.right,
  height = 250 - margin.top - margin.bottom;

function prepRender(){
  //live update
  camera.position.z = Math.max(bounds[0],bounds[1]) * 0.5;
  camera.position.x = bounds[0] * 0.5;
  camera.position.y = bounds[1] * 0.5;
  camera.rotation.x = 8 * Math.PI / 180;
  document.querySelector('#ex-1').appendChild(renderer.domElement);
  renderer.setSize(screen.width, screen.height);
  renderer.setClearColor(0xffffff, 0);

  //timeline setup (lazy global scope)
  svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x = d3.scaleLinear()
    .range([0, width]);

  y = d3.scaleLinear()
    .range([height, 0]);

  line = d3.line()
    .x(function(d) {
      return x(d.time);
    })
    .y(function(d) {
      return y(d.infectious);
    });

  xAxis = d3.axisBottom(x);

  yAxis = d3.axisLeft(y);
}

function render() {
  if (environment.time <= duration) {
    infectious = 0;
    requestAnimationFrame(render);
    environment.update(step);
    environment.time += step;
    renderer.render(scene, camera);
    document.querySelector('#status').innerHTML = `<div>Time: ${Math.round(environment.time * 100) / 100}</div>
    <div>Infectious: ${infectious}</div>`;
    infoOverTime.push({
      time: environment.time,
      infectious: infectious
    });
    if(infectious != lastInfectious){
      drawTimeline(infoOverTime);
    }
    lastInfectious = infectious;
  } else {
    let iCount = environment.agents.reduce(function(prev, current) {
      if (current.states.illness == 'infectious') {
        return prev + 1;
      }
      return prev;
    }, 0);
    seed++;
    //setOptions(options)
  }
}

function drawTimeline(data) {
  let maxInfect = d3.max(data, function(d) {
    return d.infectious;
  });
  d3.select("g").selectAll("*").remove();
  x.domain([0, duration]);
  y.domain([0, maxInfect * 1.25]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("# of Infected");

  svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);
}
prepRender();
