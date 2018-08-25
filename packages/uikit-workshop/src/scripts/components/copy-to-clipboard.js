import Clipboard from 'clipboard';

// Copy to clipboard functionality
const clipboard = new Clipboard('.pl-js-code-copy-btn');
clipboard.on('success', function(e) {
  const copyButton = document.querySelectorAll('.pl-js-code-copy-btn');
  for (let i = 0; i < copyButton.length; i++) {
    copyButton[i].innerText = 'Copy';
  }
  e.trigger.textContent = 'Copied';
});
