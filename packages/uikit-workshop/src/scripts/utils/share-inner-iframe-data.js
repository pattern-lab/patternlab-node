import { targetOrigin } from '../utils';

// alert the iframe parent that the pattern has loaded assuming this view was loaded in an iframe
if (window.self !== window.top) {
  /**
   * update the current page's drawer / code viewer
   * @todo: refactor similarly to the new code block below
   */

  // handle the options that could be sent to the parent window
  //   - all get path
  //   - pattern & view all get a pattern partial, styleguide gets all
  //   - pattern shares lineage
  const path = window.location.toString();
  const parts = path.split('?');
  const options = {
    event: 'patternLab.pageLoad',
    path: parts[0],
    details: {
      patternData: window.patternData,
    },
  };

  options.patternpartial =
    window.patternData.patternPartial !== undefined
      ? window.patternData.patternPartial
      : 'all';
  if (window.patternData.lineage !== '') {
    options.lineage = window.patternData.lineage;
  }
  window.parent.postMessage(options, targetOrigin);

  // tell the parent page which pattern has just loaded
  try {
    const event = new CustomEvent('patternPartial', {
      detail: { pattern: window.patternData.patternPartial },
    });
    window.parent.document.dispatchEvent(event);
  } catch (e) {
    // Function just doesn't work in ie11 but thats ok (Who uses IE11 anyway? I mean, we have 2020 :D)
  }
}
