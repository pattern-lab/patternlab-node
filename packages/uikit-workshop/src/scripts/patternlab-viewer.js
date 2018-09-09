import './components/typeahead';
import './components/layout';
import './components/modal-viewer';
import './components/panels';
import './components/panels-viewer';
import './components/pattern-finder';
import './components/plugin-loader';
import './components/styleguide';

//// Add hook to auto re-render the root component.
if (typeof module.hot === 'object') {
  module.hot.accept(err => {
    if (err) {
      console.error('Cannot apply HMR update.', err);
    }
  });
}
