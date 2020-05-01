/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/*
 * Polyfills loaded: HTML Imports, Custom Elements, platform polyfills, template
 * Used in: IE 11
 */

import 'regenerator-runtime/runtime';
import '@webcomponents/template/template.js';
import 'core-js/modules/es.array.find';

import 'element-closest';
import 'core-js/modules/es.string.includes';
import 'core-js/modules/es.array.includes';
// import 'core-js/modules/es.array.from';
// import 'core-js/modules/es.object.assign';

import './platform/remove-polyfill.js';
import './platform/es6-misc';
import './platform/custom-event';
import './platform/promise';
import './platform/symbol';
import './platform/flag-parser';
// import '@webcomponents/custom-elements/src/custom-elements.js';

import '@webcomponents/custom-elements/src/custom-elements.js';

// import 'document-register-element';
// by default, the second argument is 'auto'
// but it could be also 'force'
// which ignores feature detection and force
// the polyfill version of CustomElements
// installCE(global, 'auto');

import '@webcomponents/url/url.js';
import './platform/baseuri';
import './platform/unresolved';

import 'core-js/modules/es.array.for-each';

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

// import 'core-js/modules/es.string.trim-end';
// import 'core-js/modules/es.string.trim-start';
// import 'core-js/modules/es.string.code-point-at';
// import 'core-js/modules/es.number.is-nan';
