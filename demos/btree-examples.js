if (typeof(Worker) !== "undefined") {
  var end, time, start,
    heatData, w, wb;

  var init = function() {
    //render(WBHTree.root, "weight-diagram", "name");
    //d3.select("#weight-diagram").call(zoomListener);
  };

  var getFile = function(tree, popProps, el) {
    var csv, encodedUri, link;
    csv = formatCSV(tree.history, popProps);
    encodedUri = QEpiKit.Utils.createCSVURI(csv);
    link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bt_data.csv");
    link.setAttribute("target", "_blank");
    link.setAttribute("class", "btn btn-default");
    link.innerHTML = "Download CSV file";
    document.getElementById(el).appendChild(link);
  };

  formatCSV = function(data, popProps) {
    var results = [];
    for (var i = 0; i < data.length; i++) {
      for (var d in data[i]) {
        results.push([]);
        var index = results.length - 1;
        for (var prop in data[i][d]) {
          results[index].push(data[i][d][prop]);
        }
      }
    }
    results.unshift(popProps);
    return results;
  };

  startMeaslesEx = function() {
    w = new Worker("bt-infectious-tests.js");
    start = new Date().getTime();
    w.onmessage = function(e) {
      var json;
      end = new Date().getTime();
      time = end - start;
      try {
        json = JSON.parse(e.data);
      } catch (err) {
        //do nothing
      }
      if (json) {
        if (json.hasOwnProperty("name") && json.name === "start-disease") {
          MBHTree = json;
          mSVG = new QEpiKit.renderer.bTreeDiagrams(MBHTree, "measles-diagram");
          d3.select(mSVG.container).call(d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", mZoom));
        }



        if (json.hasOwnProperty("name") && json.name === "start-pop-gen") {
          PGTree = json;
          pgSVG = new QEpiKit.renderer.bTreeDiagrams(PGTree, "measles-pop-gen");
          d3.select(pgSVG.container).call(d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", pgZoom));
        }
        //render();
      }
      if (e.data[0].hasOwnProperty("byAge")) {
        var margin = 50,
          dH = 800 - margin - margin,
          dW = 800 - margin - margin;
        var contactSVG = d3.select("#measles-contact").append("svg")
          .attr("width", dH + margin + margin)
          .attr("height", dH + margin + margin)
          .append("g")
          .attr("transform", "translate(" + margin + ", " + margin + ")");
        heatData = e.data;
        xExt = d3.extent(heatData, function(d) {
          return d.byAge;
        });
        yExt = d3.extent(heatData, function(d) {
          return d.infectedAge;
        });

        x = d3.scale.linear().domain(xExt).range([0, dW]);
        y = d3.scale.linear().domain(yExt).range([dH, 0]);

        xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

        yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

        contactSVG.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + dH + ")")
          .call(xAxis);

        contactSVG.append("g")
          .attr("class", "axis")
          .call(yAxis);

        byCount = {};
        var maxBy = heatData.map(function(d) {
          if (byCount.hasOwnProperty(d.by)) {
            byCount[d.by] += 1;
          } else {
            byCount[d.by] = 1;
          }
        });
        contactSVG.selectAll("circle").data(heatData).enter()
          .append("circle")
          .attr("cx", function(d) {
            return x(d.byAge);
          })
          .attr("cy", function(d) {
            return y(d.infectedAge);
          })
          .attr("r", 5)
          .attr("class", function(d) {
            return "point " + d.type;
          });
      }
    };
  };

  startWeightEx = function() {
    wb = new Worker("bh-weight-gain-ex.js");
  };

  pgZoom = function() {
    pgSVG.svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  };

  mZoom = function() {
    mSVG.svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  };

} else {
  // Sorry! No Web Worker support..
  var warning = document.createElement("div");
  warning.innerHTML = "It looks like your browser doesn't support the Web Worker API. Newer versions (2014 ->) of Chrome, Safari, and Firefox do. Try with one of those.";
  document.body.innerHTML = warning;
}
