(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[2],{

/***/ "./node_modules/@webcomponents/custom-elements/src/native-shim.js":
/*!************************************************************************!*\
  !*** ./node_modules/@webcomponents/custom-elements/src/native-shim.js ***!
  \************************************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

eval("/**\n * @license\n * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.\n * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt\n * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt\n * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt\n * Code distributed by Google as part of the polymer project is also\n * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt\n */\n\n/**\n * This shim allows elements written in, or compiled to, ES5 to work on native\n * implementations of Custom Elements v1. It sets new.target to the value of\n * this.constructor so that the native HTMLElement constructor can access the\n * current under-construction element's definition.\n */\n(function () {\n  if ( // No Reflect, no classes, no need for shim because native custom elements\n  // require ES2015 classes or Reflect.\n  window.Reflect === undefined || window.customElements === undefined || // The webcomponentsjs custom elements polyfill doesn't require\n  // ES2015-compatible construction (`super()` or `Reflect.construct`).\n  window.customElements.hasOwnProperty('polyfillWrapFlushCallback')) {\n    return;\n  }\n\n  var BuiltInHTMLElement = HTMLElement;\n\n  window.HTMLElement = function HTMLElement() {\n    return Reflect.construct(BuiltInHTMLElement, [], this.constructor);\n  };\n\n  HTMLElement.prototype = BuiltInHTMLElement.prototype;\n  HTMLElement.prototype.constructor = HTMLElement;\n  Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);\n})();\n\n//# sourceURL=webpack:///./node_modules/@webcomponents/custom-elements/src/native-shim.js?");

/***/ })

}]);