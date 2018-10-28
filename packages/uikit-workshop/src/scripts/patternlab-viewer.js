import { loadPolyfills } from './utils/polyfills';

loadPolyfills.then(res => {
  import(/* webpackMode: 'lazy', webpackChunkName: 'pl-layout' */ './components/pl-layout/pl-layout').then(
    () => {
      // this ensures that the old-school way the styleguide JS binds to the page isn't thrown off by the <pl-layout> component rendering -- temp workaround till the logic in styleguide.js gets broken down and refactored.
      import(/* webpackMode: 'lazy', webpackChunkName: 'pl-styleguide' */ './components/styleguide');
      import(/* webpackMode: 'lazy', webpackChunkName: 'pl-drawer' */ './components/pl-drawer/pl-drawer');
      import(/* webpackMode: 'lazy', webpackChunkName: 'pl-modal-viewer' */ './components/modal-viewer');
    }
  );
  import(/* webpackMode: 'lazy', webpackChunkName: 'pl-search' */ './components/pl-search/pl-search');
  import(/* webpackMode: 'lazy', webpackChunkName: 'pl-toggle-info' */ './components/pl-toggle-info/pl-toggle-info');
  import(/* webpackMode: 'lazy', webpackChunkName: 'pl-toggle-layout' */ './components/pl-toggle-layout/pl-toggle-layout');
  import(/* webpackMode: 'lazy', webpackChunkName: 'pl-toggle-theme' */ './components/pl-toggle-theme/pl-toggle-theme');
});

import './components/panels';
import './components/panels-viewer';
import './components/plugin-loader';

//// Add hook to auto re-render the root component.
if (typeof module.hot === 'object') {
  module.hot.accept(err => {
    if (err) {
      console.error('Cannot apply HMR update.', err);
    }
  });
}
