import 'regenerator-runtime/runtime';
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
import '@pattern-lab/uikit-polyfills/platform/custom-event';
import '@pattern-lab/uikit-polyfills/platform/symbol';
import './components/modal-styleguide';
import './components/pl-search/pl-search.iframe-helper';
import './components/pl-nav/pl-nav.iframe-helper';
import './utils/share-inner-iframe-data';
