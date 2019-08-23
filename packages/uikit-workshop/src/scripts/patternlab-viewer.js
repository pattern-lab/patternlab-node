import './utils/polyfills';
import './components/pl-nav/pl-nav';
import './components/pl-logo/pl-logo';
import './components/pl-layout/pl-layout';
import './components/pl-controls/pl-controls';
import './components/pl-drawer/pl-drawer';
import './components/pl-header/pl-header';
import './components/pl-viewport/pl-viewport';
import './components/pl-toggle-info/pl-toggle-info';
import './components/pl-toggle-layout/pl-toggle-layout';
import './components/pl-toggle-theme/pl-toggle-theme';
import './components/pl-tools-menu/pl-tools-menu';
import './components/pl-search/pl-search';

loadPolyfills.then(() => {
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-layout' */ './components/pl-layout/pl-layout'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-controls' */ './components/pl-controls/pl-controls'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-drawer' */ './components/pl-drawer/pl-drawer'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-header' */ './components/pl-header/pl-header'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-iframe' */ './components/pl-viewport/pl-viewport'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-nav' */ './components/pl-nav/pl-nav'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-search' */ './components/pl-search/pl-search'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-toggle-info' */ './components/pl-toggle-info/pl-toggle-info'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-toggle-layout' */ './components/pl-toggle-layout/pl-toggle-layout'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-toggle-theme' */ './components/pl-toggle-theme/pl-toggle-theme'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-tools-menu' */ './components/pl-tools-menu/pl-tools-menu'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-styleguide' */ './components/styleguide'
  );
  import(
    /* webpackMode: 'lazy', webpackChunkName: 'pl-modal-viewer' */ './components/modal-viewer'
  );
});

import(
  /* webpackChunkName: "pl-modal-viewer" */
  /* webpackMode: "lazy" */
  /* webpackPrefetch: true */
  './components/modal-viewer'
);

// Add hook to auto re-render the root component.
if (typeof module.hot === 'object') {
  module.hot.accept(err => {
    if (err) {
      console.error('Cannot apply HMR update.', err);
    }
  });
}
