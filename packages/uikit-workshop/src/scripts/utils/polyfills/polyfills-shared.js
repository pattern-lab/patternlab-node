import 'element-closest';
import 'es6-promise/auto';
import 'core-js/modules/es6.string.includes';
import 'core-js/modules/es7.array.includes';
import 'core-js/modules/es6.array.from';
import 'core-js/modules/es6.object.assign';
import './symbol-polyfill';
import '@webcomponents/template/template.js';

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
