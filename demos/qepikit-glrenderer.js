// You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.
var renderer = PIXI.autoDetectRenderer(1024, 768,{backgroundColor : 0xffffff});

// The renderer will create a canvas element for you that you can then insert into the DOM.
document.body.appendChild(renderer.view);
function addHexColor(c1, c2) {
  var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
  while (hexStr.length < 6) { hexStr = '0' + hexStr; } // Zero pad.
  return hexStr;
}
// You need to create a root container that will hold the scene you want to draw.
var stage = new PIXI.Container();
var bunny = new PIXI.Graphics();
bunny.pivot = {x:300,y:400};
var color = Math.floor(Math.random() * 16777215).toString(16);
// This creates a texture from a 'bunny.png' image.
for(var i =0 ; i < 5000; i++){
  color = addHexColor(color,'000001');
  bunny.beginFill('0x' + color,0.5)
  .drawCircle(Math.random() * 1024,Math.random() * 768, 8);
}

// Setup the position and scale of the bunny
bunny.position.x = 1024/2;
bunny.position.y = 768/2;

bunny.scale.x = 1;
bunny.scale.y = 1;

// Add the bunny to the scene we are building.
stage.addChild(bunny);

// kick off the animation loop (defined below)
animate();

function animate() {
    // start the timer for the next animation loop
    requestAnimationFrame(animate);

    // each frame we spin the bunny around a bit
    bunny.scale.x += 0.0005;
    bunny.scale.y += 0.0005;
    bunny.rotation += 0.0005;
    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
}
