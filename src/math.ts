module QEpiKit{
  export function rk45(f, y, step, options){
    //TODO
    k1 = f(option.inputs, step).dx;
    k2 = f(k1, step).dx + k1 * step/ 2
  }
}

vel = function(inputs, step){
  inputs.dx = inputs.x + inputs.v * step;
  return inputs;
}
