/* eslint-disable no-restricted-globals */
/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

export {};

// Establish scope.
window.WebComponents = window.WebComponents || { flags: {} };

// loading script
const file = 'webcomponents-bundle';
const script = document.querySelector(`script[src*="${file}"]`);
const flagMatcher = /wc-(.+)/;

// Flags. Convert url arguments to flags
const flags = {};
if (!flags.noOpts) {
  // from url
  location.search
    .slice(1)
    .split('&')
    .forEach(option => {
      const parts = option.split('=');
      let match;
      if (parts[0] && (match = parts[0].match(flagMatcher))) {
        flags[match[1]] = parts[1] || true;
      }
    });
  // from script
  if (script) {
    for (let i = 0, a; (a = script.attributes[i]); i++) {
      if (a.name !== 'src') {
        flags[a.name] = a.value || true;
      }
    }
  }
  // log flags
  if (flags.log && flags.log.split) {
    const parts = flags.log.split(',');
    flags.log = {};
    parts.forEach(f => {
      flags.log[f] = true;
    });
  } else {
    flags.log = {};
  }
}

// exports
window.WebComponents.flags = flags;
const forceShady = flags.shadydom;
if (forceShady) {
  window.ShadyDOM = window.ShadyDOM || {};
  window.ShadyDOM.force = forceShady;
  const { noPatch } = flags;
  window.ShadyDOM.noPatch = noPatch === 'true' ? true : noPatch;
}

const forceCE = flags.register || flags.ce;
if (forceCE && window.customElements) {
  window.customElements.forcePolyfill = forceCE;
}
