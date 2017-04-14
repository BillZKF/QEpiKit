var QEpiKit = (function(Q, PIXI) {
  Q.GLRenderer = {
  ScatterXY: function(xyData, options) {
    // create an new instance of a pixi stage
    var domain = [],
      pixMargins = [],
      pXmargin, pYmargin;
    this.xyData = xyData;
    this.stage = new PIXI.Container();
    this.renderer = PIXI.autoDetectRenderer(options.width, options.height, {
      backgroundColor: options.bgColor
    });
    this.scales = [options.extents.x, options.extents.y];

    domain = [];
    domain[0] = Math.abs(this.scales[0].min - this.scales[0].max);
    domain[1] = Math.abs(this.scales[1].min - this.scales[1].max);

    pixMargins = [];
    pixMargins[0] = options.marginsX || this.renderer.width * 0.05;
    pixMargins[1] = options.marginsY || this.renderer.height * 0.05;
    range = {
      x: {},
      y: {}
    };
    range.x.min = 0 + pixMargins[0];
    range.x.max = this.renderer.width - pixMargins[0];
    range.y.max = 0 + pixMargins[1];
    range.y.min = this.renderer.height - pixMargins[1];

    pW = Math.abs(range.x.min - range.x.max);
    pH = Math.abs(range.y.min - range.y.max)

    var xLabel = new PIXI.Text('X Axis');
    var yLabel = new PIXI.Text('Y Axis');
    xLabel.x = range.x.min;
    xLabel.y = range.y.min;

    yLabel.x = range.x.min - 30;
    yLabel.y = range.y.min;
    yLabel.rotation = -90 * (Math.PI / 180);
    this.stage.addChild(xLabel);
    this.stage.addChild(yLabel);
    this.container = document.body.appendChild(this.renderer.view);
    this.axes = Q.GLRenderer.XYAxes();
    scatterPlot = new PIXI.Graphics();
    this.xyData.forEach(function(point) {
      var scaled = {
        x: 0,
        y: 0
      };
      scaled.x = point.x * (pW / domain[0]) + pixMargins[0];
      scaled.y = range.y.min - (point.y * (pH / domain[1]));
      scatterPlot.beginFill(0x4488ff, 0.7).drawCircle(scaled.x, scaled.y, 2);
    })
    this.scatterPlot = scatterPlot;
    this.stage.addChild(scatterPlot);
    this.renderer.render(this.stage);
    return this;
  }
}
return Q;
})(QEpiKit || {}, PIXI);
