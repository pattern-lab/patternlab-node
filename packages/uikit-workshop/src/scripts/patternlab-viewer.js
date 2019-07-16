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

import(
  /* webpackChunkName: "pl-viewport-sizes" */
  /* webpackMode: "lazy" */
  /* webpackPrefetch: true */
  './components/pl-viewport-size-list/pl-viewport-size-list'
);

import(
  /* webpackChunkName: "pl-search" */
  /* webpackMode: "eager" */
  /* webpackPrefetch: true */
  './components/pl-search/pl-search'
);

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
