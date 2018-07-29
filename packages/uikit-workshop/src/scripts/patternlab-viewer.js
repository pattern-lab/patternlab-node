import './components/typeahead';
import './components/layout';
import './components/modal-viewer';
import './components/panels';
import './components/panels-util';
import './components/panels-viewer';
import './components/pattern-finder';
import './components/plugin-loader';
import './components/styleguide';

// WIP: new JS components for handling UI controls to toggle theme + layout
// import './components/toggle-layout';
// import './components/toggle-theme';

//// Add hook to auto re-render the root component.
if (typeof module.hot === 'object') {
  module.hot.accept(err => {
    if (err) {
      console.error('Cannot apply HMR update.', err);
    }
  });
}
