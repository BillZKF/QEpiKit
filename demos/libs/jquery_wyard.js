(function ($) {

  var methods = {
    init: function (options) {
      var $this = $(this);
      d3con = d3.select(this.selector)
        .append("svg:svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight);
      wyard = {};
      wyard.count = 0;
      wyard.rels = [];
    },

    ////
    //addEntity adds a table with the column labels and attributes to the diagram. Each table row is "relatable" by default.
    //    @param {object} options {entityId:"string",columns:[{label:"string"}],rows:[values]
    //    @param {function} callback Use a callback for custom table creation.
    ////
    addEntity: function (options, callback) {
      wyard.count++;
      var $this = $(this),
      entityID = options.entityId || "wyard" + wyard.count;
      headings = "",
      x = Math.floor(Math.random() * ($(window).width() / 2)),
      body = "";
      switch (options.type) {
        case "io":
          body += $("#diagram").wyard("mapOutputs", options);
          body += $("#diagram").wyard("mapInputs", options);
          $this.append("<div id='" + entityID + "' class='wyard-entity' style='left:" + x + "px; top:128px;'>" + options.header + headings + body + "</div>");
          break;
        case "vertConnects":
          body += $("#diagram").wyard("vertConnects", options);
          $this.append("<div id='" + entityID + "' class='wyard-entity' style='left:" + x + "px;'>" + body + "</div>");
          break;
        default:
          break;
      }
      $("#" + entityID).draggable();
      $("#" + entityID + " .relatable").on('click', function () {
        $(this).wyard('setSource');
      });
      return $("#" + entityID);
    },

    mapOutputs: function (options, callback) {
      var outputBody = "<table class='wyard-outputs'>";
      var i = 0;
      var oLabels = options.outputs.labels;
      for (i = 0; i < oLabels.length; i++) {
        outputBody += "<tr id='" + options.entityId + "_orowLabel" + i + "'>";
        outputBody += "<td>" + oLabels[i] + "</td>";
        outputBody += "<td class='relatable wyard-type' id='o" + options.entityId + oLabels[i] + "'>" + options.outputs.types[i] + "</td>";
        outputBody += "</tr>";
      }
      outputBody += "</table>"
      return outputBody;
    },

    mapInputs: function (options, callback) {
      var inputBody = "<table class='wyard-inputs'>";
      if (typeof (options.inputs) !== "undefined") {
        var iLabels = options.inputs.labels;
        for (var i = 0; i < iLabels.length; i++) {
          inputBody += "<tr  id='" + options.entityId + "_irowLabel" + i + "'>";
          inputBody += "<td class='relatable wyard-type' id='i" + options.entityId + iLabels[i] + "'>" + options.inputs.types[i] + "</td>";
          inputBody += "<td>" + iLabels[i] + "</td>";
          inputBody += "</tr>";
        }
        inputBody += "</table>";
      }
      return inputBody;
    },

    vertConnects: function (options, callback) {
      var eBody = "<div class='relatable wyard-top-conn' id='" + options.entityId + "_i'>[]</div>";
      eBody += "<div>" + options.header + "</div>";
      if (typeof (options.outputs) !== "undefined") {
        eBody += "<div class='relatable wyard-bottom-conn' id='" + options.entityId + "_o'>[]</div>";
      }
      return eBody;
    },

    ////
    //removeEntity removes a given entity table from the diagram
    ////
    removeEntity: function (options) {
      var $this = $(this);
      $this.remove();
    },

    ////
    //setSource assigns element as the relationship source i.e. first node in array.
    ////
    setSource: function (options) {
      var $this = $(this),
        data = {
          src_id: $this.attr("id")
        };

      $this.addClass('rel-source');

      $('.relatable').off('click');
      $('.relatable').on('click', function () {
        $(this).wyard('setDest', data);
      });
    },

    ////
    //setDest assigns element as the relationship destination i.e. second node in array.
    ////
    setDest: function (options) {
      var $this = $(this),
        data = {
          src_id: options.src_id,
          dest_id: $this.attr("id")
        };

      $this.addClass('rel-dest');

      $("#diagram").wyard('addRelation', data);

      $('.relatable').off('click');
      $('.relatable').on('click', function () {
        $(this).wyard('setSource');
      });
    },


    ////
    //addRelation push new relationship to relation array
    ////
    addRelation: function (options) {
      if (wyard.rels) {
        wyard.rels.push([options.src_id, options.dest_id]);
        $("#" + options.src_id).removeClass('rel-src');
        $("#" + options.src_id).addClass('wyard-relation');
        $("#" + options.dest_id).removeClass('dest-src');
        $("#" + options.dest_id).addClass('wyard-relation');
      }
    },

    drawRelations: function (options) {
      var options = options || {};
      var linkType = options.linkType || "poly";
      var connectType = options.connectType;
      var $this = $(this),
        allRels = wyard.rels.length,
        offset = 9,
        i = 0,
        link,
        src_pos, src_width, src_height, dest_pos, dest_width, leftmost, leftmost_top, rightmost, rightmost_top;
      //clear all existing relationships
      d3con.selectAll("line").remove();
      for (i = 0; i < allRels; i++) {
        src_pos = $("#" + wyard.rels[i][0]).offset(),
        src_width = $("#" + wyard.rels[i][0]).width(),
        dest_pos = $("#" + wyard.rels[i][1]).offset(),
        dest_width = $("#" + wyard.rels[i][1]).width();
        if (connectType === "vert") {
          
          src_height = $("#" + wyard.rels[i][0]).height();
          link = d3con.append("svg:line")
            .attr("x1", src_pos.left + (src_width / 2))
            .attr("y1", src_pos.top - (2 * src_height))
            .attr("x2", dest_pos.left + (dest_width / 2))
            .attr("y2", dest_pos.top - src_height)
            .style("stroke", "rgb(6,120,155)");   
        } else {
          leftmost = Math.min(src_pos.left, dest_pos.left);

          if (leftmost === src_pos.left) {
            leftmost = leftmost + src_width;
            leftmost_top = src_pos.top + offset;
            rightmost = dest_pos.left;
            rightmost_top = dest_pos.top + offset;
          } else {
            leftmost = leftmost + dest_width;
            leftmost_top = dest_pos.top + offset;
            rightmost = src_pos.left;
            rightmost_top = src_pos.top + offset;
          }
          if (linkType === "arc") {
            link = d3.con.append("svg:path");
            //TODO finish curves
          } else {
            link = d3con.append("svg:line")
              .attr("x1", leftmost)
              .attr("y1", leftmost_top)
              .attr("x2", rightmost)
              .attr("y2", rightmost_top)
              .style("stroke", "rgb(6,120,155)");
          }
        }
      };
    },

    removeRelation: function (options) {

    }
  }

  $.fn.wyard = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist within wyard');
    }
  }
})(jQuery);