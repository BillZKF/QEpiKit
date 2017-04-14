'use strict()';
class QBuilder {
  constructor(){
    this.id = QBuilder.setId();
  }

  static setId(){
    let string = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = '';
    while(id.length < 24){
      id += string[Math.floor(Math.random() * string.length)];
    }
    return id;
  }
}

class Node extends QBuilder {
  constructor(position){
    super();
    this.position = position;
  }

}

class Edge extends QBuilder {
  constructor(style){
    super();
    this.style = style;
  }

  get src(){
    return this.src;
  }

  set src(value){
    this.src = value;
  }

  get dest(){
    return this.dest;
  }

  set dest(value){
    this.dest = value;
  }

}

class Field extends QBuilder{
  constructor(){
    super();
  }

}

class Port extends QBuilder{
  constructor(){
    super();
  }

}

class ExperimentNode extends Node {
  constructor(){
    super();
  }


}
