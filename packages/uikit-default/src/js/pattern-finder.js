/*!
 * Pattern Finder
 *
 * Copyright (c) 2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 *
 */

var patternFinder = {
  
  data:   [],
  active: false,
  
  init: function() {
    
    for (var patternType in patternPaths) {
      if (patternPaths.hasOwnProperty(patternType)) {
        for (var pattern in patternPaths[patternType]) {
          var obj = {};
          obj.patternPartial = patternType+"-"+pattern;
          obj.patternPath    = patternPaths[patternType][pattern];
          this.data.push(obj);
        }
      }
    }
    
    // instantiate the bloodhound suggestion engine
    var patterns = new Bloodhound({
      datumTokenizer: function(d) { return Bloodhound.tokenizers.nonword(d.patternPartial); },
      queryTokenizer: Bloodhound.tokenizers.nonword,
      limit: 10,
      local: this.data
    });
    
    // initialize the bloodhound suggestion engine
    patterns.initialize();
    
    $('#sg-find .typeahead').typeahead({ highlight: true }, {
      displayKey: 'patternPartial',
      source: patterns.ttAdapter()
    }).on('typeahead:selected', patternFinder.onSelected).on('typeahead:autocompleted', patternFinder.onAutocompleted);
    
  },
  
  passPath: function(item) {
    // update the iframe via the history api handler
    patternFinder.closeFinder();
    var obj = JSON.stringify({ "event": "patternLab.updatePath", "path": urlHandler.getFileName(item.patternPartial) });
    document.getElementById("sg-viewport").contentWindow.postMessage(obj, urlHandler.targetOrigin);
  },
  
  onSelected: function(e,item) {
    patternFinder.passPath(item);
  },
  
  onAutocompleted: function(e,item) {
    patternFinder.passPath(item);
  },
  
  toggleFinder: function() {
    if (!patternFinder.active) {
      patternFinder.openFinder();
    } else {
      patternFinder.closeFinder();
    }
  },
  
  openFinder: function() {
    patternFinder.active = true;
    $('#sg-find .typeahead').val("");
    $("#sg-find").addClass('show-overflow');
  },
  
  closeFinder: function() {
    patternFinder.active = false;
    document.activeElement.blur();
    $("#sg-find").removeClass('show-overflow');
    $('#sg-find .typeahead').val("");
  },
  
  receiveIframeMessage: function(event) {
    
    // does the origin sending the message match the current host? if not dev/null the request
    if ((window.location.protocol !== "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
      return;
    }
    
    var data = {};
    try {
      data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
    } catch(e) {}
    
    if ((data.event !== undefined) && (data.event == "patternLab.keyPress")) {
      
      if (data.keyPress == 'ctrl+shift+f') {
        patternFinder.toggleFinder();
        return false;
      }
      
    }
    
  }
  
};

patternFinder.init();

window.addEventListener("message", patternFinder.receiveIframeMessage, false);

$('#sg-find .typeahead').focus(function() {
  if (!patternFinder.active) {
    patternFinder.openFinder();
  }
});

$('#sg-find .typeahead').blur(function() {
  patternFinder.closeFinder();
});
