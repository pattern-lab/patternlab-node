import { targetOrigin } from '../../utils';

function sendPatternLabKeyEvent(e, name) {
  try {
    window.parent.postMessage(
      JSON.stringify({
        event: `patternLab.${name}`,
        key: e.key,
        code: e.code,
      }),
      targetOrigin
    );
  } catch (error) {
    // @todo: how do we want to handle exceptions here?
  }
}

document.addEventListener('keydown', (e) => {
  sendPatternLabKeyEvent(e, 'iframeKeyDownEvent');
});

document.addEventListener('keyup', (e) => {
  sendPatternLabKeyEvent(e, 'iframeKeyUpEvent');
});
