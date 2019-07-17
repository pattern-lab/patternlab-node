/* eslint-disable no-bitwise */
/* eslint-disable no-self-compare */
/* eslint-disable no-extend-native, object-shorthand */
import 'element-closest';
import 'es6-promise/auto';
import 'core-js/modules/es.string.includes';
import 'core-js/modules/es.array.includes';
import 'core-js/modules/es.array.from';
import 'core-js/modules/es.object.assign';
import 'core-js/modules/es.array.find';
import 'core-js/modules/es.string.trim-end';
import 'core-js/modules/es.string.trim-start';
import 'core-js/modules/es.string.code-point-at';
import 'core-js/modules/es.number.is-nan';
import './symbol-polyfill';
import '@webcomponents/template/template.js';
import './custom-event-polyfill';

if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    'use strict';
    if (this == null)
      throw new TypeError("can't convert " + this + ' to object');

    var str = '' + this;
    // To convert string to integer.
    count = +count;
    // Check NaN
    if (count != count) count = 0;

    if (count < 0) throw new RangeError('repeat count must be non-negative');

    if (count == Infinity)
      throw new RangeError('repeat count must be less than infinity');

    count = Math.floor(count);
    if (str.length == 0 || count == 0) return '';

    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28)
      throw new RangeError(
        'repeat count must not overflow maximum string size'
      );

    var maxCount = str.length * count;
    count = Math.floor(Math.log(count) / Math.log(2));
    while (count) {
      str += str;
      count--;
    }
    str += str.substring(0, maxCount - str.length);
    return str;
  };
}

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    value: function(search, pos) {
      pos = !pos || pos < 0 ? 0 : +pos;
      return this.substring(pos, pos + search.length) === search;
    },
  });
}

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
