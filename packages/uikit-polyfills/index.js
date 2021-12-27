import 'regenerator-runtime/runtime';
import 'custom-event-polyfill';
import 'get-own-property-symbols';
import '@webcomponents/webcomponentsjs/webcomponents-bundle';

import 'element-closest';
// A matches polyfill is already included in the previous closest polyfill – as long as that one is still included, we won't need the next one
// import 'element-matches';
import 'core-js/modules/es.string.includes';
import 'core-js/modules/es.string.trim-end';
import 'core-js/modules/es.string.trim-start';
import 'core-js/modules/es.string.code-point-at';
import 'core-js/modules/es.string.starts-with';
import 'core-js/modules/es.number.is-nan';
import 'core-js/modules/es.array.find';
import 'core-js/modules/es.array.includes';
import 'core-js/modules/es.array.from';
import 'core-js/modules/es.array.for-each';
import 'core-js/modules/es.object.assign';
import 'core-js/modules/es.promise';
import 'core-js/es6/symbol';
import 'core-js/web/dom-collections';
import 'core-js/web/url-search-params';
