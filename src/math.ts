module QEpiKit{
  function rk4OdeInt(f, y, step, options){
    var halfStep = prep(options.params, step);
    k2 = step * f(options.params, y);
    k3 = step * f(halfStep, y);
    function prep(params, step){
      for(var p in params){
        params[p] = params[p] + step / 2.0
      }
    }
  }

}
