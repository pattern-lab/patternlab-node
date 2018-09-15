import { loadPolyfills } from './utils/polyfills';

loadPolyfills.then(res => {
  import(/* webpackMode: 'eager', webpackChunkName: 'pl-layout' */ './components/pl-layout/pl-layout').then(
    () => {
      // this ensures that the old-school way the styleguide JS binds to the page isn't thrown off by the <pl-layout> component rendering -- temp workaround till the logic in styleguide.js gets broken down and refactored.
      import(/* webpackMode: 'eager', webpackChunkName: 'pl-styleguide' */ './components/styleguide');
    }
  );
  import(/* webpackMode: 'eager', webpackChunkName: 'pl-toggle-theme' */ './components/pl-toggle-theme/pl-toggle-theme');
  import(/* webpackMode: 'eager', webpackChunkName: 'pl-toggle-layout' */ './components/pl-toggle-layout/pl-toggle-layout');
});

import './components/typeahead';
import './components/modal-viewer';
import './components/panels';
import './components/panels-viewer';
import './components/pattern-finder';
import './components/plugin-loader';

//// Add hook to auto re-render the root component.
if (typeof module.hot === 'object') {
  module.hot.accept(err => {
    if (err) {
      console.error('Cannot apply HMR update.', err);
    }
  });
}
