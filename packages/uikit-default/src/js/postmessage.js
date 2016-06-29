/*!
 * Basic postMessage Support
 *
 * Copyright (c) 2013-2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Handles the postMessage stuff in the pattern, view-all, and style guide templates.
 *
 */

// alert the iframe parent that the pattern has loaded assuming this view was loaded in an iframe
if (self != top) {
  
  // handle the options that could be sent to the parent window
  //   - all get path
  //   - pattern & view all get a pattern partial, styleguide gets all
  //   - pattern shares lineage
  var path = window.location.toString();
  var parts = path.split("?");
  var options = { "event": "patternLab.pageLoad", "path": parts[0] };
  
  patternData = document.getElementById('sg-pattern-data-footer').innerHTML;
  patternData = JSON.parse(patternData);
  options.patternpartial = (patternData.patternPartial !== undefined) ? patternData.patternPartial : "all";
  if (patternData.lineage !== "") {
    options.lineage = patternData.lineage;
  }
  
  var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host;
  parent.postMessage(options, targetOrigin);
  
  // find all links and add an onclick handler for replacing the iframe address so the history works
  var aTags = document.getElementsByTagName('a');
  for (var i = 0; i < aTags.length; i++) {
    aTags[i].onclick = function(e) {
      var href   = this.getAttribute("href");
      var target = this.getAttribute("target");
      if ((target !== undefined) && ((target == "_parent") || (target == "_blank"))) {
        // just do normal stuff
      } else if (href && href !== "#") {
        e.preventDefault();
        window.location.replace(href);
      } else {
        e.preventDefault();
        return false;
      }
    };
  }
  
}

// watch the iframe source so that it can be sent back to everyone else.
function receiveIframeMessage(event) {
  
  // does the origin sending the message match the current host? if not dev/null the request
  if ((window.location.protocol != "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
    return;
  }
  
  var path;
  var data = {};
  try {
    data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
  } catch(e) {}
  
  if ((data.event !== undefined) && (data.event == "patternLab.updatePath")) {
    
    if (patternData.patternPartial !== undefined) {
      
      // handle patterns and the view all page
      var re = /(patterns|snapshots)\/(.*)$/;
      path = window.location.protocol+"//"+window.location.host+window.location.pathname.replace(re,'')+data.path+'?'+Date.now();
      window.location.replace(path);
      
    } else {
      
      // handle the style guide
      path = window.location.protocol+"//"+window.location.host+window.location.pathname.replace("styleguide\/html\/styleguide.html","")+data.path+'?'+Date.now();
      window.location.replace(path);
      
    }
    
  } else if ((data.event !== undefined) && (data.event == "patternLab.reload")) {
    
    // reload the location if there was a message to do so
    window.location.reload();
    
  }
  
}
window.addEventListener("message", receiveIframeMessage, false);
