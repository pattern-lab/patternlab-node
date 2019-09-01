/* eslint-disable no-extend-native */
// import polyfill for Symbol and Object.getOwnPropertySymbols
import 'get-own-property-symbols/build/get-own-property-symbols.max.js';

// Fix issue in toString patch when compiled into strict mode via closure
// https://github.com/es-shims/get-own-property-symbols/issues/16
const toString = Object.prototype.toString;
Object.prototype.toString = function() {
  if (this === undefined) {
    return '[object Undefined]';
  } else if (this === null) {
    return '[object Null]';
  } else {
    return toString.call(this);
  }
};

// overwrite Object.keys to filter out symbols
Object.keys = function(obj) {
  return Object.getOwnPropertyNames(obj).filter(name => {
    const prop = Object.getOwnPropertyDescriptor(obj, name);
    return prop && prop.enumerable;
  });
};

// implement iterators for IE 11
const iterator = window.Symbol.iterator;

if (!String.prototype[iterator] || !String.prototype.codePointAt) {
  /** @this {String} */
  String.prototype[iterator] = function*() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  };
}

if (!Set.prototype[iterator]) {
  /** @this {Set} */
  Set.prototype[iterator] = function*() {
    const temp = [];
    this.forEach(value => {
      temp.push(value);
    });
    for (let i = 0; i < temp.length; i++) {
      yield temp[i];
    }
  };
}

if (!Map.prototype[iterator]) {
  /** @this {Map} */
  Map.prototype[iterator] = function*() {
    const entries = [];
    this.forEach((value, key) => {
      entries.push([key, value]);
    });
    for (let i = 0; i < entries.length; i++) {
      yield entries[i];
    }
  };
}
