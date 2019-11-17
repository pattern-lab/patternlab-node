import 'regenerator-runtime/runtime';
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
import '@pattern-lab/uikit-polyfills/platform/custom-event';
import '@pattern-lab/uikit-polyfills/platform/symbol';
import './patternlab-pattern.modern';
