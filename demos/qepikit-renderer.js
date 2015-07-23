var QEpiKit = (function(Q, d3) {
  Q.renderer = {
    compModelDiagrams: function(model, el) {
      var height = 280,
        width = 480,
        margin = 60,
        container = document.createElement("div");
      container.id = model.name + "-diagrams";
      this.info = document.createElement("span");
      this.info.id = model.name + "-info-box";
      this.info.className = "info-box";
      container.appendChild(this.info);
      document.getElementById(el).appendChild(container);


      this.model = model;
      this.svgPopTime = d3.select(container).append("svg").attr("height", height).attr("width", width).append("g");
      this.svgComSize = d3.select(container).append("svg").attr("height", height).attr("width", width).append("g");
      var x = d3.scale.linear()
        .domain([0, this.model.runDuration])
        .range([margin, width - margin]);

      var y = d3.scale.linear()
        .domain([this.model.totalPop, 0])
        .range([margin, height - margin]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

      this.curveDatas = [];
      this.circles = [];
      this.sizes = [];

      for (var c = 0; c < this.model.compartments.length; c++) {
        this.curveDatas[c] = [];
        this.circles[c] = this.svgPopTime.append("circle")
          .attr('cx', function() {
            return 0;
          })
          .attr('r', 7)
          .attr('class', this.model.compartments[c].name);

        this.sizes[c] = this.svgComSize.append("g")
          .attr('transform', "translate(" + (c + 1) * ((width - (margin * 2)) / this.model.compartments.length) + ", " + height / 2 + ") scale(" + (model.compartments[c].pop + 0.1) + ")");

        this.sizes[c].append("circle")
          .attr('r', 100)
          .attr('class', this.model.compartments[c].name);

        this.sizes[c].append("text")
          .attr("dy", "0.5em")
          .attr("text-anchor", "middle")
          .style("stroke", "black")
          .style("fill-opacity", 1)
          .style("z-index", 10)
          .text(this.model.compartments[c].name);
      }
      this.svgPopTime.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height - margin) + ")")
        .call(xAxis);

      this.svgPopTime.append("g")
        .attr("class", "axis")
        .attr("transform", "translate( " + margin + ",0)")
        .call(yAxis);

      this.update = function() {
        if (this.model.time <= this.model.runDuration) {
          var show = this.model.time % 60,
            inf = [],
            txt,
            cLen = this.model.compartments.length;
          this.svgPopTime.selectAll("path").remove();
          this.svgPopTime.selectAll("g").remove();

          curveFunc = d3.svg.line()
            .x(function(d) {
              return x(d.x);
            })
            .y(function(d) {
              return y(d.y);
            });


          for (var c = 0; c < cLen; c++) {
            this.circles[c].attr('transform', 'translate(' + x(this.model.time) + ',' + y(this.model.compartments[c].pop) + ')');

            this.curveDatas[c].push({
              x: this.model.time,
              y: this.model.compartments[c].pop
            });

            this.svgPopTime.append('path')
              .datum(this.curveDatas[c])
              .attr('class', 'line ' + this.model.compartments[c].name)
              .attr('d', curveFunc);

            this.sizes[c]
              .attr('transform', "translate(" + (c + 1) * ((width - (margin * 2)) / this.model.compartments.length) + ", " + height / 2 + ") scale(" + (this.model.compartments[c].pop + 0.1) + ")");


            inf[c] = "<p>" + this.model.compartments[c].name + " : " + Math.round(this.model.compartments[c].pop * 7900000) + "</p>";
          }

          if (show === 0) {
            txt = inf.join("");
            this.info.innerHTML = "<p>Time: " + this.model.time + "</p>";
            this.info.innerHTML += txt;
            this.info.innerHTML += "<p>total: " + Math.round(model.totalPop * 7900000) + "</p>";
            this.info.innerHTML += "<p>BRN: " + Math.round(model.basicReproductiveNumber) + "</p>";
          }

          this.svgPopTime.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (height - margin) + ")")
            .call(xAxis);

          this.svgPopTime.append("g")
            .attr("class", "axis")
            .attr("transform", "translate( " + margin + ",0)")
            .call(yAxis);
        }
      };
      return this;
    },

    bTreeDiagrams: function(btree, el) {
      this.btree = btree;
      var svg, tree, diagonal, diagram, container,
        margin = {
          top: 20,
          right: 120,
          bottom: 20,
          left: 120
        },
        width = 1024 - margin.right - margin.left,
        height = 640 - margin.top - margin.bottom,
        i = 0;
      tree = d3.layout.tree()
        .size([height, width]);
      diagonal = d3.svg.diagonal()
        .projection(function(d) {
          return [d.y, d.x];
        });

      container = document.createElement("div");
      container.id = this.btree.name + "-tree-diagrams";
      this.info = document.createElement("span");
      this.info.id = this.btree.name + "-info-box";
      container.appendChild(this.info);
      document.getElementById(el).innerHTML = "";
      document.getElementById(el).appendChild(container);
      this.container = container;


      svg = d3.select(container).append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom);

      this.svgGroup = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var nodes = tree.nodes(this.btree),
        links = tree.links(nodes);

      // Normalize for fixed-depth.
      nodes.forEach(function(d) {
        d.y = d.depth * 180;
      });

      // Declare the nodes…
      var node = this.svgGroup.selectAll("g.node")
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
          return d.type + " : " + d.name;
        })
        .style("fill-opacity", 1);

      // Declare the links…
      var link = this.svgGroup.selectAll("path.link")
        .data(links, function(d) {
          return d.target.id;
        });

      // Enter the links.
      link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", diagonal);

      return this;
    },
    contactAgeMat: function(WIW, el) {
      var margin = 50,
        dH = 400 - margin - margin,
        dW = 400 - margin - margin,
        container = document.createElement("div");
      container.id = WIW[0].by + "contact-mat";
      this.info = document.createElement("span");
      this.info.id = WIW[0].by + "-info-box";
      container.appendChild(this.info);
      document.getElementById(el).appendChild(container);
      this.container = container;
      this.contactSVG = d3.select(container).append("svg")
        .attr("width", dH + margin + margin)
        .attr("height", dH + margin + margin)
        .append("g")
        .attr("transform", "translate(" + margin + ", " + margin + ")");
      this.heatData = WIW;
      var xExt = d3.extent(this.heatData, function(d) {
        return d.byAge;
      });
      var yExt = d3.extent(this.heatData, function(d) {
        return d.infectedAge;
      });

      var cExt = d3.extent(this.heatData, function(d) {
        return d.result;
      });

      var x = d3.scale.linear().domain(xExt).range([0, dW]);
      var y = d3.scale.linear().domain(yExt).range([dH, 0]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

      this.contactSVG.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + dH + ")")
        .call(xAxis);

      this.contactSVG.append("g")
        .attr("class", "axis")
        .call(yAxis);

      var byCount = {};
      var maxBy = this.heatData.map(function(d) {
        if (byCount.hasOwnProperty(d.by)) {
          byCount[d.by] += 1;
        } else {
          byCount[d.by] = 1;
        }
      });
      this.contactSVG.selectAll("circle").data(this.heatData).enter()
        .append("circle")
        .attr("cx", function(d) {
          return x(d.byAge);
        })
        .attr("cy", function(d) {
          return y(d.infectedAge);
        })
        .attr("r", 5)
        .style("fill-opacity", function(d){return d.result/cExt[1];})
        .attr("class", function(d) {
          return "point " + d.id;
        });
    },
    infectionNetwork: function(agents, WIW, el) {
      var margin = 50,
        dH = 400 - margin - margin,
        dW = 400 - margin - margin,
        container = document.createElement("div");
      container.id = WIW[0].by + "contact-net";
      this.info = document.createElement("span");
      this.info.id = WIW[0].by + "net-info-box";
      container.appendChild(this.info);
      document.getElementById(el).innerHTML = "";
      document.getElementById(el).appendChild(container);
      this.container = container;
      this.contactSVG = d3.select(container).append("svg")
        .attr("width", dW + margin + margin)
        .attr("height", dH + margin + margin)
        .append("g")
        .attr("transform", "translate(" + margin + ", " + margin + ")");


      this.force = d3.layout.force()
        .charge(-100)
        .linkDistance(dW / 2)
        .size([dW, dH]);

        this.links = {};
        WIW.map(function(d) {
          d.source = d.by - 1;
          d.target = d.infected - 1;
        });

      this.force.nodes(agents).links(WIW);
      var resultExtent = d3.extent(WIW, function(d) {
        return d.result;
      });
      link = this.contactSVG.selectAll(".link")
        .data(WIW)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke", function(d) {
          return "rgb(" + Math.round(d.result / resultExtent[1] * 255) + "," + (200 - Math.round(d.result / resultExtent[1] * 200)) + ",0)";
        })
        .style("stroke-width", function(d) {
          return d.result / 1000;
        });

      node = this.contactSVG.selectAll(".node")
        .data(agents)
        .enter().append("circle")
        .attr("class", function(d) {
          return "node " + d.currentMode;
        })
        .attr("r", 5)
        .call(this.force.drag);

      node.append("title")
        .text(function(d) {
          return d.id;
        });

      this.force.on("tick", function() {
        link.attr("x1", function(d) {
            return d.source.x;
          })
          .attr("y1", function(d) {
            return d.source.y;
          })
          .attr("x2", function(d) {
            return d.target.x;
          })
          .attr("y2", function(d) {
            return d.target.y;
          });

        node.attr("cx", function(d) {
            return d.x;
          })
          .attr("cy", function(d) {
            return d.y;
          });
      });

      this.force.start();
      this.update = function(agents,WIW){
        this.force.stop();
        this.contactSVG.selectAll("*").remove();
        WIW.map(function(d) {
          d.source = d.by - 1;
          d.target = d.infected - 1;
        });

        var resultExtent = d3.extent(WIW, function(d) {
          return d.result;
        });
        link = this.contactSVG.selectAll(".link")
          .data(WIW)
          .enter().append("line")
          .attr("class", "link")
          .style("stroke", function(d) {
            return "rgb(" + Math.round(d.result / resultExtent[1] * 255) + "," + (200 - Math.round(d.result / resultExtent[1] * 200)) + ",0)";
          })
          .style("stroke-width", function(d) {
            return d.result / 1000;
          });

        node = this.contactSVG.selectAll(".node")
          .data(agents)
          .enter().append("circle")
          .attr("class", function(d) {
            return "node " + d.currentMode;
          })
          .attr("r", 5)
          .call(this.force.drag);


        this.force.nodes(agents).links(WIW);
        this.force.start();

      };
    }
  };
  return Q;
}(QEpiKit || {}, d3));
