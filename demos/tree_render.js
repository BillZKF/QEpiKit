var zoomListener;
var zoom = function(svgGroup) {
  console.log(svgGroup);
  svgGroup[0][0].attributes.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};
var render = function(treeStart, container, childPropName) {
  document.getElementById(container).innerHTML = "";
  var diagram, tree;
  var margin = {
      top: 20,
      right: 120,
      bottom: 20,
      left: 120
    },
    width = 1024 - margin.right - margin.left,
    height = 640 - margin.top - margin.bottom;
  try {
    tree = d3.layout.tree()
      .size([height, width]);
  } catch (error) {
    throw "requires d3 library";
  }

  var i = 0;

  var diagonal = d3.svg.diagonal()
    .projection(function(d) {
      return [d.y, d.x];
    });

  svg = d3.select("#" + container).append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom);

  svgGroup = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var nodes = tree.nodes(treeStart),
    links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * 180;
  });

  // Declare the nodes…
  var node = svgGroup.selectAll("g.node")
    .data(nodes, function(d) {
      return d.id || (d.id = ++i);
    });

  // Enter the nodes.
  var nodeEnter = node.enter().append("g")
    .attr("class", function(d) {
      return d.type;
    })
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  nodeEnter.append("circle")
    .attr("r", 10);


  nodeEnter.append("text")
    .attr("x", function(d) {
      return d.children || d._children ? -13 : 13;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) {
      return d.children || d._children ? "end" : "start";
    })
    .text(function(d) {
      return d.type + " : " + d[childPropName];
    })
    .style("fill-opacity", 1);

  // Declare the links…
  var link = svgGroup.selectAll("path.link")
    .data(links, function(d) {
      return d.target.id;
    });

  // Enter the links.
  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", diagonal);
  return svgGroup;
};

/*
for(node )
var act = String(action)
act.replace(/[\r\n]/g,"");
var start = act.search("{") + 2;
this.actionText = act.substr(start, act.length-1);
*/

function pan(domNode, direction) {
  var speed = panSpeed;
  if (panTimer) {
    clearTimeout(panTimer);
    translateCoords = d3.transform(svgGroup.attr("transform"));
    if (direction == 'left' || direction == 'right') {
      translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
      translateY = translateCoords.translate[1];
    } else if (direction == 'up' || direction == 'down') {
      translateX = translateCoords.translate[0];
      translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
    }
    scaleX = translateCoords.scale[0];
    scaleY = translateCoords.scale[1];
    scale = zoomListener.scale();
    svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
    d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
    zoomListener.scale(zoomListener.scale());
    zoomListener.translate([translateX, translateY]);
    panTimer = setTimeout(function() {
      pan(domNode, speed, direction);
    }, 50);
  }
}
