import './components/pl-nav/nav';
import './components/pl-search/pl-search';
import './lit-components/pl-icon/pl-icon';
import './lit-components/pl-button/pl-button';
import './lit-components/pl-tooltip/pl-tooltip';
import './lit-components/pl-toggle-info/pl-toggle-info';
import './lit-components/pl-toggle-layout/pl-toggle-layout';
import './lit-components/pl-toggle-theme/pl-toggle-theme';
import './lit-components/pl-viewport-size/pl-viewport-size';
import './lit-components/pl-logo/pl-logo';
import './lit-components/pl-layout/pl-layout';
import './lit-components/pl-controls/pl-controls';
import './lit-components/pl-drawer/pl-drawer';
import './lit-components/pl-header/pl-header';
import './lit-components/pl-viewport/pl-viewport';
import './lit-components/pl-tools-menu/pl-tools-menu';
import './lit-components/pl-viewport-size-list/pl-viewport-size-list';

import './components/plugin-loader';

import(
  /* webpackChunkName: "pl-modal-viewer" */
  /* webpackMode: "lazy" */
  /* webpackPrefetch: true */
  './components/modal-viewer'
);

// // Add hook to auto re-render the root component.
// if (typeof module.hot === 'object') {
//   module.hot.accept(err => {
//     if (err) {
//       console.error('Cannot apply HMR update.', err);
//     }
//   });
// }
