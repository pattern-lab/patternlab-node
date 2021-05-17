// Tiny helper script to listen for keyboard combos and to communicate back to the main Search component (via the Pattern Lab iframe)
import Mousetrap from 'mousetrap';
import { targetOrigin } from '../../utils';

document.addEventListener('click', function () {
  try {
    const obj = JSON.stringify({
      event: 'patternLab.pageClick',
    });
    window.parent.postMessage(obj, targetOrigin);
  } catch (error) {
    // @todo: how do we want to handle exceptions here?
  }
});

Mousetrap.bind('esc', function (e) {
  try {
    const obj = JSON.stringify({
      event: 'patternLab.keyPress',
      key: e.key,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
    });
    window.parent.postMessage(obj, targetOrigin);
  } catch (error) {
    // @todo: how do we want to handle exceptions here?
  }

  return false;
});
