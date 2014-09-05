/*jslint indent: 4*/
/*global window*/
/**
 * Polyfill for Element.matches
 **/
function addPolyfill(ElementPrototype) {
    'use strict';

    if (ElementPrototype.matches !== undefined) {
        return;
    }

    ElementPrototype.matches = ElementPrototype.matchesSelector ||
        ElementPrototype.mozMatchesSelector ||
        ElementPrototype.msMatchesSelector ||
        ElementPrototype.oMatchesSelector ||
        ElementPrototype.webkitMatchesSelector ||
        function (selector) {
            var node    = this,
                nodes   = (node.parentNode || node.document).querySelectorAll(selector),
                i       = -1;

            while (nodes[i] && nodes[i] !== node) {
                ++i;
            }

            return !!nodes[i];
        };
}

if (module && module.exports) {
    module.exports = addPolyfill;
} else {
    addPolyfill(window.Element.prototype);
}