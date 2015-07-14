var ac, modes, flowSet, flowMap, jumpSet, jumpMap, schedule, eventsQueue;
modes = ["ON", "OFF"];
flowSet = {
  x: {
    min: 0,
    max: 100
  }
};
flowMap = {
  x: {
    "ON": function(x) {
      return 65 - x;
    },
    "OFF": function(x) {
      return 85 - x;
    }
  }
};
jumpMap = {
  "x": {
    "ON": {
      "OFF": function(x) {
        return x;
      }
    },
    "OFF": {
      "ON": function(x) {
        return x;
      }
    }
  }
};
jumpSet = {
  "ON": {
    key: "x",
    value: 74,
    check: QEpiKit.Utils.gtEq
  },
  "OFF": {
    key: "x",
    value: 71,
    check: QEpiKit.Utils.ltEq
  }
};
ac = {
  x: 85,
  currentMode: "OFF",
  modes: modes,
  flowSet: flowSet,
  flowMap: flowMap,
  jumpSet: jumpSet,
  jumpMap: jumpMap
};
scheduler = {
  time: 0,
  step: 1 / 2160
};

var height = 100,
width = 512;
acSVG = d3.select("#ac-diagram").append("svg").attr("height", height).attr("width", width).append("g");
var x = d3.scale.linear().domain([69,86]).range([0,512]);
var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

acSVG.append("g")
  .attr("class", "axis")
  .attr("transform", "translate( 0,75)")
  .call(xAxis);

acUnit = acSVG.append("g");

circle = acUnit.append("circle")
.attr("r", 30)
.attr("class", ac.currentMode)
.style("stroke-width",5);

text = acUnit.append("text")
.attr("dy", "1em")
.attr("text-anchor", "middle")
.attr("dy", 3)
.style("stroke", "#444")
.style("fill-opacity", 1)
.text("AC " + ac.currentMode);
haAC = function(){
    //acSVG.selectAll("*").remove();

    for (var mode in ac.jumpSet) {
      var edge = ac.jumpSet[mode];
      var edgeState = edge.check(ac[edge.key], edge.value);
      if (edgeState === QEpiKit.Utils.SUCCESS && mode != ac.currentMode) {
        ac.x = ac.jumpMap[edge.key][ac.currentMode][mode](ac[edge.key]);
        ac.currentMode = mode;
      }
    }
    ac.x += ac.flowMap.x[ac.currentMode](ac.x) * scheduler.step;
    acUnit.attr("transform","translate("+ x(ac.x) +",35)");
    circle.attr("class", ac.currentMode);
    text.text("AC " + ac.currentMode);
    scheduler.time += scheduler.step;
    requestAnimationFrame(haAC);
};
haAC();
