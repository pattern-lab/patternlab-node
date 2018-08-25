/*!
 * Pattern Finder
 *
 * Copyright (c) 2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 *
 */

import { urlHandler } from '../utils';
import $ from 'jquery';
import Bloodhound from 'typeahead.js/dist/bloodhound.js';

export const patternFinder = {
  data: [],
  active: false,

  init() {
    // don't init more than once.
    if (document.querySelectorAll('.pl-js-typeahead').length > 1) {
      return;
    }

    for (var patternType in window.patternPaths) {
      if (window.patternPaths.hasOwnProperty(patternType)) {
        for (var pattern in window.patternPaths[patternType]) {
          var obj = {};
          obj.patternPartial = patternType + '-' + pattern;
          obj.patternPath = window.patternPaths[patternType][pattern];
          this.data.push(obj);
        }
      }
    }

    // instantiate the bloodhound suggestion engine
    var patterns = new Bloodhound({
      datumTokenizer: function(d) {
        return Bloodhound.tokenizers.nonword(d.patternPartial);
      },
      queryTokenizer: Bloodhound.tokenizers.nonword,
      limit: 10,
      local: this.data,
    });

    // initialize the bloodhound suggestion engine
    patterns.initialize();

    $('.pl-js-typeahead')
      .typeahead(
        {
          highlight: true,
        },
        {
          displayKey: 'patternPartial',
          source: patterns.ttAdapter(),
        }
      )
      .on('typeahead:selected', patternFinder.onSelected)
      .on('typeahead:autocompleted', patternFinder.onAutocompleted);
  },

  passPath(item) {
    // update the iframe via the history api handler
    patternFinder.closeFinder();
    var obj = JSON.stringify({
      event: 'patternLab.updatePath',
      path: urlHandler.getFileName(item.patternPartial),
    });
    document
      .querySelector('.pl-js-iframe')
      .contentWindow.postMessage(obj, urlHandler.targetOrigin);
  },

  onSelected(e, item) {
    patternFinder.passPath(item);
  },

  onAutocompleted(e, item) {
    patternFinder.passPath(item);
  },

  toggleFinder() {
    if (!patternFinder.active) {
      patternFinder.openFinder();
    } else {
      patternFinder.closeFinder();
    }
  },

  openFinder() {
    patternFinder.active = true;
    $('.pl-js-typeahead').val('');
  },

  closeFinder() {
    patternFinder.active = false;
    document.activeElement.blur();
    $('.pl-js-typeahead').val('');
  },

  receiveIframeMessage(event) {
    // does the origin sending the message match the current host? if not dev/null the request
    if (
      window.location.protocol !== 'file:' &&
      event.origin !== window.location.protocol + '//' + window.location.host
    ) {
      return;
    }

    var data = {};
    try {
      data =
        typeof event.data !== 'string' ? event.data : JSON.parse(event.data);
    } catch (e) {}

    if (data.event !== undefined && data.event == 'patternLab.keyPress') {
      if (data.keyPress == 'ctrl+shift+f') {
        patternFinder.toggleFinder();
        return false;
      }
    }
  },
};

patternFinder.init();

window.addEventListener('message', patternFinder.receiveIframeMessage, false);

$('.pl-js-typeahead').focus(function() {
  if (!patternFinder.active) {
    patternFinder.openFinder();
  }
});

$('.pl-js-typeahead').blur(function() {
  patternFinder.closeFinder();
});
