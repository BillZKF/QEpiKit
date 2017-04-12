/***
*@module QEpiKit
*/
import * as qepikit from './main';

let QEpiKit = qepikit;

for(let key in QEpiKit){
  if(key == 'version'){
    console.log(QEpiKit[key]);
  }
}
