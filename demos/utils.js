QUtils = {
  //place objects within a boundary
  arrangeEvenWithin(array, footprint, margin, boundaries){
    let full = footprint + margin;
    let perRow = (boundaries.right - boundaries.left) / full;
    for(let i = 0; i < array.length; i++){
      let row = Math.ceil((i + 1) / perRow);
      let col = i % perRow;
      array[i].mesh.position.x = col * full + boundaries.left;
      array[i].mesh.position.y = row * full + boundaries.bottom;
    }
  }
};
