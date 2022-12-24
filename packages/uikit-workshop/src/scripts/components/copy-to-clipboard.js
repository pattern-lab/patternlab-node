/**
 * Copy to clipboard functionality for code snippet examples
 */

import Clipboard from 'clipboard';

const clipboard = new Clipboard('.pl-js-code-copy-btn');
clipboard.on('success', function (e) {
  const copyButton = document.querySelectorAll('.pl-js-code-copy-btn');
  for (let i = 0; i < copyButton.length; i++) {
    copyButton[i].querySelector('.pl-c-code-copy-btn__icon-text').innerText =
      'Copy';
  }
  e.trigger.classList.add('is-copied');
  e.trigger.querySelector('.pl-c-code-copy-btn__icon-text').textContent =
    'Copied';

  setTimeout(() => {
    e.trigger.classList.remove('is-copied');
    e.trigger.querySelector('.pl-c-code-copy-btn__icon-text').textContent =
      'Copy';
    e.clearSelection();
    e.trigger.blur();
  }, 2000);
});
