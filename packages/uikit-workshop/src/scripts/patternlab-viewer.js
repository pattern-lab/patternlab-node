import { loadPolyfills } from './utils/polyfills/polyfill-loader.js';

loadPolyfills.then(() => {
  import(
    /* webpackChunkName: "pl-components" */
    /* webpackMode: "eager" */
    './patternlab-components'
  );
});
