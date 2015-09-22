var QEpiKit = (function(Q, d3) {
  Q.renderer = {
    resourceLineChart: function(resources, until, el, datatype) {
      var timeInt = until / (resources.length - 1),
        max = 0,
        min = 1e20,
        height = 480,
        width = window.innerWidth * 0.75,
        margin = 80,
        start = new Date().getTime(),
        container = document.createElement("div");
      container.id = "resource-diagrams";
      this.info = document.createElement("span");
      this.info.id = "resource-info-box";
      this.info.className = "info-box";
      container.appendChild(this.info);
      document.getElementById(el).innerHTML = "";
      document.getElementById(el).appendChild(container);
      this.svgResTime = d3.select(container).append("svg").attr("height", height).attr("width", width).append("g");


      this.curveDatas = [];
      for (var res in resources[0]) {
        if (resources[0][res].hasOwnProperty(datatype)) {
          this.curveDatas[res] = [];
          for (var t = 0; t < resources.length; t++) {

            var time = new Date();
            time = time.addDays(t * timeInt);
            if (resources[t][res][datatype] > max) {
              max = resources[t][res][datatype];
            }

            if (resources[t][res][datatype] < min) {
              min = resources[t][res][datatype];
            }
            this.curveDatas[res].push({
              x: time,
              y: resources[t][res][datatype]
            });
          }
        }
      }

      var dateFormat = d3.time.format("%x");

      var end = new Date();
      end = end.addDays(until);

      var x = d3.time.scale()
        .domain([start, end])
        .range([margin, width - margin]);

      var y = d3.scale.log()
        .domain([max, min])
        .range([margin, height - margin]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(dateFormat);

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

      var curveFunc = d3.svg.line()
        .x(function(d) {
          return x(d.x);
        })
        .y(function(d) {
          return y(d.y);
        });

      for (var i in this.curveDatas) {
        this.svgResTime.append('path')
          .datum(this.curveDatas[i])
          .attr('class', 'line')
          .style('stroke', '#' + Math.floor(Math.random() * 16777215).toString(16))
          .style('stroke-width', 3)
          .attr('d', curveFunc)
          .append("svg:title")
          .text(resources[0][i].label);
      }


      this.svgResTime.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height - margin) + ")")
        .call(xAxis);

      this.svgResTime.append("g")
        .attr("class", "axis")
        .attr("transform", "translate( " + margin + ",0)")
        .call(yAxis);

      d3.selectAll(".tick > text")
        .style("font-size", 6);

      return this;
    },
    facilitiesLineChart: function(history, until, el, type) {
      var timeInt = until / (history.length - 1),
        max = 0,
        min = 1e20,
        height = 480,
        width = window.innerWidth * 0.75,
        margin = 80,
        start = new Date().getTime(),
        container = document.createElement("div");
      container.id = "resource-diagrams";
      this.info = document.createElement("span");
      this.info.id = "resource-info-box";
      this.info.className = "info-box";
      container.appendChild(this.info);
      document.getElementById(el).innerHTML = "";
      document.getElementById(el).appendChild(container);
      this.svgResTime = d3.select(container).append("svg").attr("height", height).attr("width", width).append("g");


      this.curveDatas = [];

      for (var i = 0; i < history[0].facilities[type].length; i++) {
        this.curveDatas[i] = [];
        for (var t = 0; t < history.length; t++) {
          var fac = history[t].facilities[type][i];
          var time = new Date();
          time = time.addDays(t * timeInt);
          if (fac.capacity > max) {
            max = fac.capacity;
          }
          this.curveDatas[i].push({
            x: time,
            y: fac.status
          });
        }
      }

      var dateFormat = d3.time.format("%x");

      var end = new Date();
      end = end.addDays(until);

      var x = d3.time.scale()
        .domain([start, end])
        .range([margin, width - margin]);

      var y = d3.scale.linear()
        .domain([max, 0])
        .range([margin, height - margin]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(dateFormat);

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

      var curveFunc = d3.svg.line()
        .x(function(d) {
          return x(d.x);
        })
        .y(function(d) {
          return y(d.y);
        });

      for (var j = 0; j < this.curveDatas.length; j++) {
        this.svgResTime.append('path')
          .datum(this.curveDatas[j])
          .attr('class', 'line')
          .style('stroke', '#' + Math.floor(Math.random() * 16777215).toString(16))
          .style('stroke-width', 3)
          .attr('d', curveFunc)
          .append("svg:title")
          .text(history[0].facilities[type][j].label + ": " + history[0].facilities[type][j].type);
      }


      this.svgResTime.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height - margin) + ")")
        .call(xAxis);

      this.svgResTime.append("g")
        .attr("class", "axis")
        .attr("transform", "translate( " + margin + ",0)")
        .call(yAxis);

      d3.selectAll(".tick > text")
        .style("font-size", 10);

      return this;
    },
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
        dH = 600 - margin - margin,
        dW = 600 - margin - margin,
        range = document.createElement("input"),
        container = document.createElement("div"),
        currentTime = document.createElement("label");

      this.heatData = WIW;
      var xExt = d3.extent(this.heatData, function(d) {
        return d.byAge;
      });
      var yExt = d3.extent(this.heatData, function(d) {
        return d.infectedAge;
      });
      var tExt = d3.extent(this.heatData, function(d) {
        return d.time;
      });
      var cExt = d3.extent(this.heatData, function(d) {
        return d.result;
      });
      container.id = WIW[0].by + "contact-mat";
      this.info = document.createElement("span");
      this.info.id = WIW[0].by + "-info-box";
      range.id = 'time-input-range';
      range.type = "range";
      range.min = 0;
      range.max = tExt[1] * 24;
      range.value = tExt[1] * 24;
      range.style.width = "600px";
      range.style.display = "block";
      range.step = 1;
      range.onchange = function(event) {
        var r = event.target;
        for (var i = 0; i <= Math.round(r.max); i++) {
          var elList;
          if (i != Math.round(r.value)) {
            elList = document.querySelectorAll('.time-' + i);
            for (var e = 0; e < elList.length; e++) {
              elList[e].style.visibility = 'hidden';
            }
          } else {
            elList = document.querySelectorAll('.time-' + i);
            for (var ee = 0; ee < elList.length; ee++) {
              elList[ee].style.visibility = 'visible';
            }
          }
          document.querySelector('#contact-mat-current').innerHTML = "Time (days / hrs) = " + Math.floor(r.value / 24) + " / " + Math.round(r.value % 24) + ":00";
        }
      };
      currentTime.id = 'contact-mat-current';
      currentTime.innerHTML = 'Time (hrs) = ' + range.max;
      currentTime.for = 'time-input-range';
      this.info.appendChild(range);
      this.info.insertBefore(currentTime, range);
      container.appendChild(this.info);
      document.getElementById(el).appendChild(container);
      this.container = container;
      this.contactSVG = d3.select(container).append("svg")
        .attr("width", dH + margin + margin)
        .attr("height", dH + margin + margin)
        .append("g")
        .attr("transform", "translate(" + margin + ", " + margin + ")");


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
        .attr("class", function(d) {
          return d.name + " time-" + Math.round(d.time * 24);
        })
        .style("fill-opacity", function(d) {
          return d.result / cExt[1];
        });
    },
    trendLines: function(el, lines, perEncounter) {
      var margin = 50,
        dH = 600 - margin - margin,
        dW = 840 - margin - margin,
        container = document.createElement("div");
      this.container = container;
      document.getElementById(el).innerHTML = '';
      document.getElementById(el).appendChild(this.container);
      this.trendSVG = d3.select(this.container).append("svg")
        .attr("width", dW + margin + margin)
        .attr("height", dH + margin + margin)
        .append("g")
        .attr("transform", "translate(" + margin + ", " + margin + ")");

      this.curveDatas = {};
      var last = -10,
        max = -1000;

      for (var line in lines) {

          this.curveDatas[line] = {};
          for (var patch in lines[line]) {
            this.curveDatas[line][patch] = [];
            for (var time in lines[line][patch]) {
              if (time !== 'total') {
                var t = parseInt(time);
                if(typeof t !== 'number'){

                } else if(lines[line][patch][time] * perEncounter > 0){
                  this.curveDatas[line][patch].push({
                    x: t,
                    y: lines[line][patch][time] * perEncounter,
                    label: line
                  });
                }

                if (lines[line][patch][time] * perEncounter > max) {
                  max = lines[line][patch][time] * perEncounter;
                }
                if (parseInt(time) > last){
                  last = parseInt(time);
                }
              }
            }
          }

      }



      var dateFormat = d3.time.format("%x");
      var start = new Date();
      start.setDate(start.getDate());
      var end = new Date();
      end.setDate(start.getDate() + last);

      var x = d3.scale.linear()
        .domain([0, last])
        .range([margin, dW - margin]);

      var y = d3.scale.linear()
        .domain([max, 0])
        .range([margin, dH - margin]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

      var curveFunc = d3.svg.line()
        .x(function(d) {
          return x(d.x);
        })
        .y(function(d) {
          return y(d.y);
        });

      for (var lin in this.curveDatas) {
        if(Object.keys(this.curveDatas[lin]).length > 0){
          for(var pat in this.curveDatas[lin]){
            this.trendSVG.append('path')
              .datum(this.curveDatas[lin][pat])
              .attr('class', 'line')
              .style('stroke', '#faa')
              .style('stroke-width', 2)
              .style('stroke-opacity', 0.7)
              .attr('d', curveFunc)
              .append("svg:title")
              .text(pat);
          }
        }
      }


      this.trendSVG.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (dH - margin) + ")")
        .call(xAxis);

      this.trendSVG.append("g")
        .attr("class", "axis")
        .attr("transform", "translate( " + margin + ",0)")
        .call(yAxis);

      d3.selectAll(".tick > text")
        .style("font-size", 10);
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
      this.update = function(agents, WIW) {
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
