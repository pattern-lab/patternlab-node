import './polyfills-shared';

let polyfills = [];

// Detect Shadow Dom Support
if (
  !(
    'attachShadow' in Element.prototype && 'getRootNode' in Element.prototype
  ) ||
  (window.ShadyDOM && window.ShadyDOM.force)
) {
  polyfills.push('sd');
}

if (!window.customElements || window.customElements.forcePolyfill) {
  polyfills.push('ce');
}

// NOTE: any browser that does not have template or ES6 features
// must load the full suite (called `lite` for legacy reasons) of polyfills.
if (
  !('content' in document.createElement('template')) ||
  !window.Promise ||
  !Array.from ||
  // Edge has broken fragment cloning which means you cannot clone template.content
  !(document.createDocumentFragment().cloneNode() instanceof DocumentFragment)
) {
  polyfills = ['lite'];
}

export const loadPolyfills = new Promise(resolve => {
  // Based on https://github.com/webcomponents/webcomponentsjs/blob/master/entrypoints/webcomponents-hi-sd-ce-pf-index.js
  // Used in: IE 11
  if (polyfills.includes('lite')) {
    Promise.all([import('document-register-element')]).then(() => {
      resolve();
    });
  } else if (polyfills.includes('sd') && polyfills.includes('ce')) {
    // Based on https://github.com/webcomponents/webcomponentsjs/blob/master/entrypoints/webcomponents-sd-ce-index.js
    // Used in: Safari 9, Firefox, Edge
    Promise.all([
      import('@webcomponents/shadydom/src/shadydom.js'),
      import('document-register-element'),
    ]).then(() => {
      resolve();
    });
  } else if (polyfills.includes('sd')) {
    // Based on https://github.com/webcomponents/webcomponentsjs/blob/master/entrypoints/webcomponents-hi-sd-index.js
    // Used in: Firefox with CustomElements enabled
    Promise.all([import('@webcomponents/shadydom/src/shadydom.js')]).then(
      () => {
        resolve();
      }
    );
  } else if (polyfills.includes('ce')) {
    // Based on https://github.com/webcomponents/webcomponentsjs/blob/master/entrypoints/webcomponents-hi-ce-index.js
    // Used in: Safari 10, Firefox once SD is shipped
    Promise.all([
      import('@webcomponents/shadydom/src/shadydom.js'),
      import('document-register-element'),
    ]).then(() => {
      resolve();
    });
  } else {
    // Used in Modern browsers supporting ES6.
    // Required since we're transpiling ES6 classes down to ES2015 through Babel
    import('@webcomponents/custom-elements/src/native-shim.js').then(() => {
      resolve();
    });
  }
});
