/*!
 * Basic postMessage Support
 *
 * Copyright (c) 2013-2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Handles the postMessage stuff in the pattern, view-all, and style guide templates.
 *
 */

if (window.self !== window.top) {
  // find all links and add an onclick handler for replacing the iframe address so the history works
  const aTags = document.getElementsByTagName('a');
  for (let i = 0; i < aTags.length; i++) {
    aTags[i].onclick = function (e) {
      const href = this.getAttribute('href');
      const target = this.getAttribute('target');
      if (
        target !== undefined &&
        (target === '_parent' || target === '_blank')
      ) {
        // just do normal stuff
      } else if (href && href !== '#') {
        e.preventDefault();
        window.location.replace(href);
      } else {
        e.preventDefault();
        return false;
      }

      return true;
    };
  }
}

// watch the iframe source so that it can be sent back to everyone else.
function receiveIframeMessage(event) {
  // does the origin sending the message match the current host? if not dev/null the request
  if (
    window.location.protocol !== 'file:' &&
    event.origin !== window.location.protocol + '//' + window.location.host
  ) {
    return;
  }

  let path;
  let data = {};
  try {
    data = typeof event.data !== 'string' ? event.data : JSON.parse(event.data);
  } catch (e) {
    // @todo: how do we want to handle exceptions like these?
  }

  if (data.event !== undefined && data.event === 'patternLab.updatePath') {
    if (window.patternData.patternPartial !== undefined) {
      // handle patterns and the view all page
      const re = /(patterns|snapshots)\/(.*)$/;
      path =
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname.replace(re, '') +
        data.path +
        '?' +
        Date.now();
      window.location.replace(path);
    } else {
      // handle the style guide
      path =
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname.replace(
          'styleguide/html/styleguide.html',
          ''
        ) +
        data.path +
        '?' +
        Date.now();
      window.location.replace(path);
    }
  } else if (data.event !== undefined && data.event === 'patternLab.reload') {
    // reload the location if there was a message to do so
    window.location.reload();
  }
}
window.addEventListener('message', receiveIframeMessage, false);
