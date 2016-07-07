/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

  var pluses = /\+/g;
  
  function raw(s) {
    return s;
  }
  
  function decoded(s) {
    return decodeURIComponent(s.replace(pluses, ' '));
  }
  
  var config = $.cookie = function (key, value, options) {
    
    // write
    if (value !== undefined) {
      options = $.extend({}, config.defaults, options);
      
      if (value === null) {
        options.expires = -1;
      }
      
      if (typeof options.expires === 'number') {
        var days = options.expires, t = options.expires = new Date();
        t.setDate(t.getDate() + days);
      }
      
      value = config.json ? JSON.stringify(value) : String(value);
      
      return (document.cookie = [
        encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
        options.path    ? '; path=' + options.path : '',
        options.domain  ? '; domain=' + options.domain : '',
        options.secure  ? '; secure' : ''
      ].join(''));
    }
    
    // read
    var decode = config.raw ? raw : decoded;
    var cookies = document.cookie.split('; ');
    for (var i = 0, l = cookies.length; i < l; i++) {
      var parts = cookies[i].split('=');
      if (decode(parts.shift()) === key) {
        var cookie = decode(parts.join('='));
        return config.json ? JSON.parse(cookie) : cookie;
      }
    }
    
    return null;
  };
  
  config.defaults = {};
  
  $.removeCookie = function (key, options) {
    if ($.cookie(key) !== null) {
      $.cookie(key, null, options);
      return true;
    }
    return false;
  };

})(jQuery, document);

/*!
 * Data Saver
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 */

var DataSaver = {
  
  // the name of the cookie to store the data in
  cookieName: "patternlab",
  
  /**
  * Add a given value to the cookie
  * @param  {String}       the name of the key
  * @param  {String}       the value
  */
  addValue: function (name,val) {
    var cookieVal = $.cookie(this.cookieName);
    cookieVal = ((cookieVal === null) || (cookieVal === "")) ? name+"~"+val : cookieVal+"|"+name+"~"+val;
    $.cookie(this.cookieName,cookieVal);
  },
  
  /**
  * Update a value found in the cookie. If the key doesn't exist add the value
  * @param  {String}       the name of the key
  * @param  {String}       the value
  */
  updateValue: function (name,val) {
    if (this.findValue(name)) {
      var updateCookieVals = "";
      var cookieVals = $.cookie(this.cookieName).split("|");
      for (var i = 0; i < cookieVals.length; i++) {
        var fieldVals = cookieVals[i].split("~");
        if (fieldVals[0] == name) {
          fieldVals[1] = val;
        }
        updateCookieVals += (i > 0) ? "|"+fieldVals[0]+"~"+fieldVals[1] : fieldVals[0]+"~"+fieldVals[1];
      }
      $.cookie(this.cookieName,updateCookieVals);
    } else {
      this.addValue(name,val);
    }
  },
  
  /**
  * Remove the given key
  * @param  {String}       the name of the key
  */
  removeValue: function (name) {
    var updateCookieVals = "";
    var cookieVals = $.cookie(this.cookieName).split("|");
    var k = 0;
    for (var i = 0; i < cookieVals.length; i++) {
      var fieldVals = cookieVals[i].split("~");
      if (fieldVals[0] != name) {
        updateCookieVals += (k === 0) ? fieldVals[0]+"~"+fieldVals[1] : "|"+fieldVals[0]+"~"+fieldVals[1];
        k++;
      }
    }
    $.cookie(this.cookieName,updateCookieVals);
  },
  
  /**
  * Find the value using the given key
  * @param  {String}       the name of the key
  *
  * @return {String}       the value of the key or false if the value isn't found
  */
  findValue: function (name) {
    if ($.cookie(this.cookieName)) {
      var cookieVals = $.cookie(this.cookieName).split("|");
      for (var i = 0; i < cookieVals.length; i++) {
        var fieldVals = cookieVals[i].split("~");
        if (fieldVals[0] == name) {
          return fieldVals[1];
        }
      }
    }
    return false;
  }
  
};

/*!
 * Simple Layout Rendering for Pattern Lab
 *
 * Copyright (c) 2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 */

try {
  
  /* load pattern nav */
  var template         = document.getElementById("pl-pattern-nav-template");
  var templateCompiled = Hogan.compile(template.innerHTML);
  var templateRendered = templateCompiled.render(navItems);
  document.getElementById("pl-pattern-nav-target").innerHTML = templateRendered;
  
  /* load ish controls */
  var template         = document.getElementById("pl-ish-controls-template");
  var templateCompiled = Hogan.compile(template.innerHTML);
  var templateRendered = templateCompiled.render(ishControls);
  document.getElementById("sg-controls").innerHTML = templateRendered;
  
} catch(e) {
  
  var message = "<h1>Nothing Here Yet</h1><p>Please generate your site before trying to view it.</p>";
  document.getElementById("pl-pattern-nav-target").innerHTML = message;
  
}

/*!
 * URL Handler
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Helps handle the initial iFrame source. Parses a string to see if it matches
 * an expected pattern in Pattern Lab. Supports Pattern Labs fuzzy pattern partial
 * matching style.
 *
 */

var urlHandler = {
  
  // set-up some default vars
  skipBack: false,
  targetOrigin: (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host,
  
  /**
  * get the real file name for a given pattern name
  * @param  {String}       the shorthand partials syntax for a given pattern
  *
  * @return {String}       the real file path
  */
  getFileName: function (name) {
    
    var baseDir     = "patterns";
    var fileName    = "";
    
    if (name === undefined) {
      return fileName;
    }
    
    if (name == "all") {
      return "styleguide/html/styleguide.html";
    } else if (name == "snapshots") {
      return "snapshots/index.html";
    }
    
    var paths = (name.indexOf("viewall-") != -1) ? viewAllPaths : patternPaths;
    var nameClean = name.replace("viewall-","");
    
    // look at this as a regular pattern
    var bits        = this.getPatternInfo(nameClean, paths);
    var patternType = bits[0];
    var pattern     = bits[1];
    
    if ((paths[patternType] !== undefined) && (paths[patternType][pattern] !== undefined)) {
      
      fileName = paths[patternType][pattern];
      
    } else if (paths[patternType] !== undefined) {
      
      for (var patternMatchKey in paths[patternType]) {
        if (patternMatchKey.indexOf(pattern) != -1) {
          fileName = paths[patternType][patternMatchKey];
          break;
        }
      }
    
    }
    
    if (fileName === "") {
      return fileName;
    }
    
    var regex = /\//g;
    if ((name.indexOf("viewall-") != -1) && (fileName !== "")) {
      fileName = baseDir+"/"+fileName.replace(regex,"-")+"/index.html";
    } else if (fileName !== "") {
      fileName = baseDir+"/"+fileName.replace(regex,"-")+"/"+fileName.replace(regex,"-")+".html";
    }
    
    return fileName;
  },
  
  /**
  * break up a pattern into its parts, pattern type and pattern name
  * @param  {String}       the shorthand partials syntax for a given pattern
  * @param  {Object}       the paths to be compared
  *
  * @return {Array}        the pattern type and pattern name
  */
  getPatternInfo: function (name, paths) {
    
    var patternBits = name.split("-");
    
    var i = 1;
    var c = patternBits.length;
    
    var patternType = patternBits[0];
    while ((paths[patternType] === undefined) && (i < c)) {
      patternType += "-"+patternBits[i];
      i++;
    }
    
    var pattern = name.slice(patternType.length+1,name.length);
    
    return [patternType, pattern];
    
  },
  
  /**
  * search the request vars for a particular item
  *
  * @return {Object}       a search of the window.location.search vars
  */
  getRequestVars: function() {
    
    // the following is taken from https://developer.mozilla.org/en-US/docs/Web/API/window.location
    var oGetVars = new (function (sSearch) {
      if (sSearch.length > 1) {
        for (var aItKey, nKeyId = 0, aCouples = sSearch.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
          aItKey = aCouples[nKeyId].split("=");
          this[unescape(aItKey[0])] = aItKey.length > 1 ? unescape(aItKey[1]) : "";
        }
      }
    })(window.location.search);
    
    return oGetVars;
    
  },
  
  /**
  * push a pattern onto the current history based on a click
  * @param  {String}       the shorthand partials syntax for a given pattern
  * @param  {String}       the path given by the loaded iframe
  */
  pushPattern: function (pattern, givenPath) {
    var data         = { "pattern": pattern };
    var fileName     = urlHandler.getFileName(pattern);
    var path         = window.location.pathname;
    path             = (window.location.protocol === "file") ? path.replace("/public/index.html","public/") : path.replace(/\/index\.html/,"/");
    var expectedPath = window.location.protocol+"//"+window.location.host+path+fileName;
    if (givenPath != expectedPath) {
      // make sure to update the iframe because there was a click
      var obj = JSON.stringify({ "event": "patternLab.updatePath", "path": fileName });
      document.getElementById("sg-viewport").contentWindow.postMessage(obj, urlHandler.targetOrigin);
    } else {
      // add to the history
      var addressReplacement = (window.location.protocol == "file:") ? null : window.location.protocol+"//"+window.location.host+window.location.pathname.replace("index.html","")+"?p="+pattern;
      if (history.pushState !== undefined) {
        history.pushState(data, null, addressReplacement);
      }
      document.getElementById("title").innerHTML = "Pattern Lab - "+pattern;
      if (document.getElementById("sg-raw") !== undefined) {
        document.getElementById("sg-raw").setAttribute("href",urlHandler.getFileName(pattern));
      }
    }
  },
  
  /**
  * based on a click forward or backward modify the url and iframe source
  * @param  {Object}      event info like state and properties set in pushState()
  */
  popPattern: function (e) {
    
    var patternName;
    var state = e.state;
    
    if (state === null) {
      this.skipBack = false;
      return;
    } else if (state !== null) {
      patternName = state.pattern;
    }
    
    var iFramePath = "";
    iFramePath = this.getFileName(patternName);
    if (iFramePath === "") {
      iFramePath = "styleguide/html/styleguide.html";
    }
    
    var obj = JSON.stringify({ "event": "patternLab.updatePath", "path": iFramePath });
    document.getElementById("sg-viewport").contentWindow.postMessage( obj, urlHandler.targetOrigin);
    document.getElementById("title").innerHTML = "Pattern Lab - "+patternName;
    document.getElementById("sg-raw").setAttribute("href",urlHandler.getFileName(patternName));
    
    /*
    if (wsnConnected !== undefined) {
      wsn.send( '{"url": "'+iFramePath+'", "patternpartial": "'+patternName+'" }' );
    }
    */
    
  }
  
};

/**
* handle the onpopstate event
*/
window.onpopstate = function (event) {
  urlHandler.skipBack = true;
  urlHandler.popPattern(event);
};

/*!
 * Modal for the Viewer Layer
 * For both annotations and code/info
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 * @requires data-saver.js
 *
 */

var modalViewer = {
  
  // set up some defaults
  active:        false,
  switchText:    true,
  template:      'info',
  patternData:   {},
  targetOrigin:  (window.location.protocol === 'file:') ? '*' : window.location.protocol+'//'+window.location.host,
  
  /**
  * initialize the modal window
  */
  onReady: function() {
    
    // make sure the listener for checkpanels is set-up
    Dispatcher.addListener('insertPanels', modalViewer.insert);
    
    // watch for resizes and hide the modal container as appropriate when the modal is already hidden
    $(window).on('resize', function() {
      if (DataSaver.findValue('modalActive') === 'false') {
        modalViewer.slide($('#sg-modal-container').outerHeight());
      }
    });
    
    // add the info/code panel onclick handler
    $('#sg-t-patterninfo').click(function(e) {
      e.preventDefault();
      $('#sg-tools-toggle').removeClass('active');
      $(this).parents('ul').removeClass('active');
      modalViewer.toggle();
    });
    
    // make sure the close button handles the click
    $('#sg-modal-close-btn').on('click', function(e) {
      
      e.preventDefault();
      
      // hide any open annotations
      obj = JSON.stringify({ 'event': 'patternLab.annotationsHighlightHide' });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
      
      // hide the viewer
      modalViewer.close();
      
    });
    
    // see if the modal is already active, if so update attributes as appropriate
    if (DataSaver.findValue('modalActive') === 'true') {
      modalViewer.active = true;
      $('#sg-t-patterninfo').html("Hide Pattern Info");
    }
    
    // make sure the modal viewer is not viewable, it's alway hidden by default. the pageLoad event determines when it actually opens
    modalViewer.hide();
    
    // review the query strings in case there is something the modal viewer is supposed to handle by default
    var queryStringVars = urlHandler.getRequestVars();
    
    // show the modal if code view is called via query string
    if ((queryStringVars.view !== undefined) && ((queryStringVars.view === 'code') || (queryStringVars.view === 'c'))) {
      modalViewer.queryPattern();
    }
    
    // show the modal if the old annotations view is called via query string
    if ((queryStringVars.view !== undefined) && ((queryStringVars.view === 'annotations') || (queryStringVars.view === 'a'))) {
      modalViewer.queryPattern();
    }
    
  },
  
  /**
  * toggle the modal window open and closed
  */
  toggle: function() {
    if (modalViewer.active === false) {
      modalViewer.queryPattern();
    } else {
      obj = JSON.stringify({ 'event': 'patternLab.annotationsHighlightHide' });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
      modalViewer.close();
    }
  },
  
  /**
  * open the modal window
  */
  open: function() {
    
    // make sure the modal viewer and other options are off just in case
    modalViewer.close();

    // note it's turned on in the viewer
    DataSaver.updateValue('modalActive', 'true');
    modalViewer.active = true;

    // add an active class to the button that matches this template
    $('#sg-t-'+modalViewer.template+' .sg-checkbox').addClass('active');

    //Add active class to modal
    $('#sg-modal-container').addClass('active');
    
    // show the modal
    modalViewer.show();
    
  },
  
  /**
  * close the modal window
  */
  close: function() {
    
    var obj;
    
    // not that the modal viewer is no longer active
    DataSaver.updateValue('modalActive', 'false');
    modalViewer.active = false;
    
    //Add active class to modal
    $('#sg-modal-container').removeClass('active');
    
    // remove the active class from all of the checkbox items
    $('.sg-checkbox').removeClass('active');
    
    // hide the modal
    modalViewer.hide();
    
    // update the wording
    $('#sg-t-patterninfo').html("Show Pattern Info");
    
    // tell the styleguide to close
    obj = JSON.stringify({ 'event': 'patternLab.patternModalClose' });
    document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
    
  },
  
  /**
  * hide the modal window
  */
  hide: function() {
    modalViewer.slide($('#sg-modal-container').outerHeight());
  },
  
  /**
  * insert the copy for the modal window. if it's meant to be sent back to the iframe do do
  * @param  {String}       the rendered template that should be inserted
  * @param  {String}       the patternPartial that the rendered template is related to
  * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
  * @param  {Boolean}      if the text in the dropdown should be switched
  */
  insert: function(templateRendered, patternPartial, iframePassback, switchText) {
    
    if (iframePassback) {
      
      // send a message to the pattern
      var obj = JSON.stringify({ 'event': 'patternLab.patternModalInsert', 'patternPartial': patternPartial, 'modalContent': templateRendered.outerHTML });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
      
    } else {
      
      // insert the panels and open the viewer
      $('#sg-modal-content').html(templateRendered);
      modalViewer.open();
      
    }
    
    // update the wording unless this is a default viewall opening
    if (switchText === true) {
      $('#sg-t-patterninfo').html("Hide Pattern Info");
    }
    
  },
  
  /**
  * refresh the modal if a new pattern is loaded and the modal is active
  * @param  {Object}       the patternData sent back from the query
  * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
  * @param  {Boolean}      if the text in the dropdown should be switched
  */
  refresh: function(patternData, iframePassback, switchText) {
    
    // if this is a styleguide view close the modal
    if (iframePassback) {
      modalViewer.hide();
    }
    
    // gather the data that will fill the modal window
    panelsViewer.gatherPanels(patternData, iframePassback, switchText);
    
  },
  
  /**
  * slides the modal window into or out of view
  * @param  {Integer}      where the modal window should be slide to
  */
  slide: function(pos) {
    pos = (pos === 0) ? 0 : -pos;
    $('#sg-modal-container').css('bottom',pos);
  },
  
  /**
  * slides the modal window to a particular annotation
  * @param  {Integer}      the number for the element that should be highlighted
  */
  slideToAnnotation: function(pos) {
    
    // remove active class
    els = document.querySelectorAll('#sg-annotations > .sg-annotations-list > li');
    for (i = 0; i < els.length; ++i) {
      els[i].classList.remove('active');
    }
    
    // add active class to called element and scroll to it
    for (i = 0; i < els.length; ++i) {
      if ((i+1) == pos) {
        els[i].classList.add('active');
        $('.sg-pattern-extra-info').animate({scrollTop: els[i].offsetTop - 10}, 600);
      }
    }
    
  },
  
  /**
  * alias for slide
  */
  show: function() {
    modalViewer.slide(0);
  },
  
  /**
  * ask the pattern for info so we can open the modal window and populate it
  * @param  {Boolean}      if the dropdown text should be changed
  */
  queryPattern: function(switchText) {
    
    // note that the modal is active and set switchText
    if ((switchText === undefined) || (switchText)) {
      switchText = true;
      DataSaver.updateValue('modalActive', 'true');
      modalViewer.active = true;
    }
    
    // send a message to the pattern
    var obj = JSON.stringify({ 'event': 'patternLab.patternQuery', 'switchText': switchText });
    document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
    
  },
  
  /**
  * toggle the comment pop-up based on a user clicking on the pattern
  * based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
  * @param  {Object}      event info
  */
  receiveIframeMessage: function(event) {
    
    var els, i;
    
    // does the origin sending the message match the current host? if not dev/null the request
    if ((window.location.protocol !== 'file:') && (event.origin !== window.location.protocol+'//'+window.location.host)) {
      return;
    }
    
    var data = {};
    try {
      data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
    } catch(e) {}
    
    if ((data.event !== undefined) && (data.event == "patternLab.pageLoad")) {
      
      if ((modalViewer.active === false) && (data.patternpartial !== undefined) && (data.patternpartial.indexOf('viewall-') === 0) && (config.defaultShowPatternInfo !== undefined) && (config.defaultShowPatternInfo)) {
        modalViewer.queryPattern(false);
      } else if (modalViewer.active === true) {
        modalViewer.queryPattern();
      }
      
    } else if ((data.event !== undefined) && (data.event == 'patternLab.patternQueryInfo')) {
      
      // refresh the modal if a new pattern is loaded and the modal is active
      modalViewer.refresh(data.patternData, data.iframePassback, data.switchText);
      
    } else if ((data.event !== undefined) && (data.event == 'patternLab.annotationNumberClicked')) {
      
      // slide to a given annoation
      modalViewer.slideToAnnotation(data.displayNumber);
      
    }
    
  }
  
};

// when the document is ready make sure the modal is ready
$(document).ready(function() { modalViewer.onReady(); });
window.addEventListener("message", modalViewer.receiveIframeMessage, false);

/*!
 * Panels Util
 * For both styleguide and viewer
 *
 * Copyright (c) 2013-16 Brad Frost, http://bradfrostweb.com & Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 *
 */

var panelsUtil = {
  
  /**
  * Add click events to the template that was rendered
  * @param  {String}      the rendered template for the modal
  * @param  {String}      the pattern partial for the modal
  */
  addClickEvents: function(templateRendered, patternPartial) {
    
    var els = templateRendered.querySelectorAll('#sg-'+patternPartial+'-tabs li');
    for (var i = 0; i < els.length; ++i) {
      els[i].onclick = function(e) {
        e.preventDefault();
        var patternPartial = this.getAttribute('data-patternpartial');
        var panelID = this.getAttribute('data-panelid');
        panelsUtil.show(patternPartial, panelID);
      };
    }
    
    return templateRendered;
    
  },
  
  /**
  * Show a specific modal
  * @param  {String}      the pattern partial for the modal
  * @param  {String}      the ID of the panel to be shown
  */
  show: function(patternPartial, panelID) {
    
    var els;
    
    // turn off all of the active tabs
    els = document.querySelectorAll('#sg-'+patternPartial+'-tabs li');
    for (i = 0; i < els.length; ++i) {
      els[i].classList.remove('sg-tab-title-active');
    }
    
    // hide all of the panels
    els = document.querySelectorAll('#sg-'+patternPartial+'-panels div.sg-tabs-panel');
    for (i = 0; i < els.length; ++i) {
      els[i].style.display = 'none';
    }
    
    // add active tab class
    document.getElementById('sg-'+patternPartial+'-'+panelID+'-tab').classList.add('sg-tab-title-active');
    
    // show the panel
    document.getElementById('sg-'+patternPartial+'-'+panelID+'-panel').style.display = 'flex';
    
  }
  
};

/*!
 * Default languages for Prism to match rendering capability
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 */
var PrismLanguages = {
  
  languages: [],
  
  get: function(key) {
    
    var language;
    
    for (i = 0; i < this.languages.length; ++i) {
      language = this.languages[i];
      if (language[key] !== undefined) {
        return language[key];
      }
    }
    
    return 'markup';
    
  },
  
  add: function(language) {
    
    // see if the language already exists, overwrite if it does
    for (var key in language) {
      if (language.hasOwnProperty(key)) {
        for (i = 0; i < this.languages.length; ++i) {
          if (this.languages[i][key] !== undefined) {
            this.languages[i][key] = language[key];
            return;
          }
        }
      }
    }
    
    this.languages.push(language);
    
  }
  
};

// this shouldn't get hardcoded, also need to think about including Prism's real lang libraries (e.g. handlebars & twig)
PrismLanguages.add({'twig': 'markup'});
PrismLanguages.add({'mustache': 'markup'});

/*!
 * Default Panels for Pattern Lab plus Panel related events
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * config is coming from the default viewer and is passed through from PL's config
 *
 * @requires prism-languages.js
 */

var Panels = {
  
  panels: [],
  
  count: function() {
    return this.panels.length;
  },
  
  get: function() {
    return JSON.parse(JSON.stringify(this.panels));
  },
  
  add: function(panel) {
    
    // if ID already exists in panels array ignore the add()
    for (i = 0; i < this.panels.length; ++i) {
      if (panel.id === this.panels[i].id) {
        return;
      }
    }
    
    // it wasn't found so push the tab onto the tabs
    this.panels.push(panel);
    
  }
  
};

// add the default panels
// Panels.add({ 'id': 'sg-panel-info', 'name': 'info', 'default': true, 'templateID': 'pl-panel-template-info', 'httpRequest': false, 'prismHighlight': false, 'keyCombo': '' });
Panels.add({ 'id': 'sg-panel-pattern', 'name': config.patternExtension.toUpperCase(), 'default': true, 'templateID': 'pl-panel-template-code', 'httpRequest': true, 'httpRequestReplace': '.'+config.patternExtension, 'httpRequestCompleted': false, 'prismHighlight': true, 'language': PrismLanguages.get(config.patternExtension), 'keyCombo': 'ctrl+shift+u' });
Panels.add({ 'id': 'sg-panel-html', 'name': 'HTML', 'default': false, 'templateID': 'pl-panel-template-code', 'httpRequest': true, 'httpRequestReplace': '.markup-only.html', 'httpRequestCompleted': false, 'prismHighlight': true, 'language': 'markup', 'keyCombo': 'ctrl+shift+y' });

// gather panels from plugins
Dispatcher.trigger('setupPanels');

/*!
 * Panel Builder. Supports building the panels to be included in the modal or styleguide
 *
 * Copyright (c) 2013-16 Brad Frost, http://bradfrostweb.com & Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires panels.js
 * @requires url-handler.js
 */

var panelsViewer = {

  // set up some defaults
  targetOrigin: (window.location.protocol === 'file:') ? '*' : window.location.protocol+'//'+window.location.host,
  initCopy:     false,
  initMoveTo:   0,

  /**
  * Check to see if all of the panels have been collected before rendering
  * @param  {String}      the collected panels
  * @param  {String}      the data from the pattern
  * @param  {Boolean}     if this is going to be passed back to the styleguide
  */
  checkPanels: function(panels, patternData, iframePassback, switchText) {

    // count how many panels have rendered content
    var panelContentCount = 0;
    for (var i = 0; i < panels.length; ++i) {
      if (panels[i].content !== undefined) {
        panelContentCount++;
      }
    }

    // see if the count of panels with content matches number of panels
    if (panelContentCount === Panels.count()) {
      panelsViewer.renderPanels(panels, patternData, iframePassback, switchText);
    }

  },

  /**
  * Gather the panels related to the modal
  * @param  {String}      the data from the pattern
  * @param  {Boolean}     if this is going to be passed back to the styleguide
  */
  gatherPanels: function(patternData, iframePassback, switchText) {

    Dispatcher.addListener('checkPanels', panelsViewer.checkPanels);

    // set-up defaults
    var template, templateCompiled, templateRendered, panel;

    // get the base panels
    var panels = Panels.get();

    // evaluate panels array and create content
    for (var i = 0; i < panels.length; ++i) {

      panel = panels[i];

      if ((panel.templateID !== undefined) && (panel.templateID)) {

        if ((panel.httpRequest !== undefined) && (panel.httpRequest)) {

          // need a file and then render
          var fileName = urlHandler.getFileName(patternData.patternPartial);
          var e        = new XMLHttpRequest();
          e.onload     = (function(i, panels, patternData, iframeRequest) {
            return function() {
              prismedContent    = Prism.highlight(this.responseText, Prism.languages[panels[i].language]);
              template          = document.getElementById(panels[i].templateID);
              templateCompiled  = Hogan.compile(template.innerHTML);
              templateRendered  = templateCompiled.render({ 'language': panels[i].language, 'code': prismedContent });
              panels[i].content = templateRendered;
              Dispatcher.trigger('checkPanels', [panels, patternData, iframePassback, switchText]);
            };
          })(i, panels, patternData, iframePassback);
          e.open('GET', fileName.replace(/\.html/,panel.httpRequestReplace)+'?'+(new Date()).getTime(), true);
          e.send();

        } else {

          // vanilla render of pattern data
          template          = document.getElementById(panel.templateID);
          templateCompiled  = Hogan.compile(template.innerHTML);
          templateRendered  = templateCompiled.render(patternData);
          panels[i].content = templateRendered;
          Dispatcher.trigger('checkPanels', [panels, patternData, iframePassback, switchText]);

        }

      }

    }

  },

  /**
  * Render the panels that have been collected
  * @param  {String}      the collected panels
  * @param  {String}      the data from the pattern
  * @param  {Boolean}     if this is going to be passed back to the styleguide
  */
  renderPanels: function(panels, patternData, iframePassback, switchText) {

    // set-up defaults
    var template, templateCompiled, templateRendered;
    var annotation, comment, count, div, els, item, markup, i;
    var patternPartial = patternData.patternPartial;
    patternData.panels = panels;
    
    // set a default pattern description for modal pop-up
    if (!iframePassback && (patternData.patternDesc.length === 0)) {
      patternData.patternDesc = "";
    }

    // capitilize the pattern name
    patternData.patternNameCaps = patternData.patternName.toUpperCase();

    // check for annotations in the given mark-up
    markup           = document.createElement('div');
    markup.innerHTML = patternData.patternMarkup;

    count = 1;
    patternData.annotations = [];
    delete patternData['patternMarkup'];

    for (i = 0; i < comments.comments.length; ++i) {

      item = comments.comments[i];
      els  = markup.querySelectorAll(item.el);

      if (els.length > 0) {
        annotation = { 'displayNumber': count, 'el': item.el, 'title': item.title, 'comment': item.comment };
        patternData.annotations.push(annotation);
        count++;
      }

    }

    // alert the pattern that annotations should be highlighted
    if (patternData.annotations.length > 0) {
      var obj = JSON.stringify({ 'event': 'patternLab.annotationsHighlightShow', 'annotations': patternData.annotations });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, panelsViewer.targetOrigin);
    }

    // add hasComma property to lineage
    if (patternData.lineage.length > 0) {
      for (i = 0; i < patternData.lineage.length; ++i) {
        if (i < (patternData.lineage.length - 1)) {
          patternData.lineage[i].hasComma = true;
        }
      }
    }

    // add hasComma property to lineageR
    if (patternData.lineageR.length > 0) {
      for (i = 0; i < patternData.lineageR.length; ++i) {
        if (i < (patternData.lineageR.length - 1)) {
          patternData.lineageR[i].hasComma = true;
        }
      }
    }

    // add *Exists attributes for Hogan templates
    // figure out if the description exists
    patternData.patternDescExists = ((patternData.patternDesc.length > 0) || ((patternData.patternDescAdditions !== undefined) && (patternData.patternDescAdditions.length > 0)));

    // figure out if lineage should be drawn
    patternData.lineageExists = (patternData.lineage.length !== 0);

    // figure out if reverse lineage should be drawn
    patternData.lineageRExists = (patternData.lineageR.length !== 0);

    // figure out if pattern state should be drawn
    patternData.patternStateExists = (patternData.patternState.length > 0);
    
    // figure if annotations should be drawn
    patternData.annotationExists = (patternData.annotations.length > 0);
    
    // figure if the entire desc block should be drawn
    patternData.descBlockExists = (patternData.patternDescExists || patternData.lineageExists || patternData.lineageRExists || patternData.patternStateExists || patternData.annotationExists);
    
    // set isPatternView based on if we have to pass it back to the styleguide level
    patternData.isPatternView = (iframePassback === false);

    // render all of the panels in the base panel template
    template         = document.getElementById('pl-panel-template-base');
    templateCompiled = Hogan.compile(template.innerHTML);
    templateRendered = templateCompiled.render(patternData);

    // make sure templateRendered is modified to be an HTML element
    div              = document.createElement('div');
    div.className    = 'sg-modal-content-inner';
    div.innerHTML    = templateRendered;
    templateRendered = div;

    // add click events
    templateRendered = panelsUtil.addClickEvents(templateRendered, patternPartial);

    // add onclick events to the tabs in the rendered content
    for (i = 0; i < panels.length; ++i) {

      panel = panels[i];

      // default IDs
      panelTab   = '#sg-'+patternPartial+'-'+panel.id+'-tab';
      panelBlock = '#sg-'+patternPartial+'-'+panel.id+'-panel';

      // show default options
      if ((templateRendered.querySelector(panelTab) !== null) && (panel.default)) {
        templateRendered.querySelector(panelTab).classList.add('sg-tab-title-active');
        templateRendered.querySelector(panelBlock).style.display = 'block';
      }

    }

    // find lineage links in the rendered content and add postmessage handlers in case it's in the modal
    $('#sg-code-lineage-fill a, #sg-code-lineager-fill a', templateRendered).on('click', function(e){
      e.preventDefault();
      var obj = JSON.stringify({ 'event': 'patternLab.updatePath', 'path': urlHandler.getFileName($(this).attr('data-patternpartial')) });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, panelsViewer.targetOrigin);
    });

    // gather panels from plugins
    Dispatcher.trigger('insertPanels', [templateRendered, patternPartial, iframePassback, switchText]);

  }

};

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

/**
 * @requires data-saver.js
 * @requires url-handler.js
 * @requires postmessage.js
 */

(function (w) {

  var sw = document.body.clientWidth, //Viewport Width
    sh = $(document).height(), //Viewport Height
    minViewportWidth = parseInt(config.ishMinimum), //Minimum Size for Viewport
    maxViewportWidth = parseInt(config.ishMaximum), //Maxiumum Size for Viewport
    viewportResizeHandleWidth = 14, //Width of the viewport drag-to-resize handle
    $sgViewport = $('#sg-viewport'), //Viewport element
    $sizePx = $('.sg-size-px'), //Px size input element in toolbar
    $sizeEms = $('.sg-size-em'), //Em size input element in toolbar
    $bodySize = (config.ishFontSize !== undefined) ? parseInt(config.ishFontSize) : parseInt($('body').css('font-size')), //Body size of the document,
    $headerHeight = $('.sg-header').height(),
    discoID = false,
    discoMode = false,
    fullMode = true,
    hayMode = false;



  //Update dimensions on resize
  $(w).resize(function() {
    sw = document.body.clientWidth;
    sh = $(document).height();

    setAccordionHeight();

    if(fullMode === true) {
      sizeiframe(sw, false);
    }
  });

  // Accordion dropdown
  $('.sg-acc-handle').on("click", function(e){
    e.preventDefault();

    var $this = $(this),
      $panel = $this.next('.sg-acc-panel'),
      subnav = $this.parent().parent().hasClass('sg-acc-panel');

    //Close other panels if link isn't a subnavigation item
    if (!subnav) {
      $('.sg-acc-handle').not($this).removeClass('active');
      $('.sg-acc-panel').not($panel).removeClass('active');
    }

    //Activate selected panel
    $this.toggleClass('active');
    $panel.toggleClass('active');
    setAccordionHeight();
  });

  //Accordion Height
  function setAccordionHeight() {
    var $activeAccordion = $('.sg-acc-panel.active').first(),
      accordionHeight = $activeAccordion.height(),
      availableHeight = sh-$headerHeight; //Screen height minus the height of the header

    $activeAccordion.height(availableHeight); //Set height of accordion to the available height
  }

  $('.sg-nav-toggle').on("click", function(e){
    e.preventDefault();
    $('.sg-nav-container').toggleClass('active');
  });

  // "View (containing clean, code, raw, etc options) Trigger
  $('#sg-t-toggle').on("click", function(e){
    e.preventDefault();
    $(this).parents('ul').toggleClass('active');
  });

  //Size Trigger
  $('#sg-size-toggle').on("click", function(e){
    e.preventDefault();
    $(this).parents('ul').toggleClass('active');
  });

  //Phase View Events
  $('.sg-size[data-size]').on("click", function(e){
    e.preventDefault();
    killDisco();
    killHay();
    fullMode = false;

    var val = $(this).attr('data-size');

    if (val.indexOf('px') > -1) {
      $bodySize = 1;
    }

    val = val.replace(/[^\d.-]/g,'');
    sizeiframe(Math.floor(val*$bodySize));
  });

  //Size View Events

  // handle small button
  function goSmall() {
    killDisco();
    killHay();
    fullMode = false;
    sizeiframe(getRandom(minViewportWidth,500));
  }

  $('#sg-size-s').on("click", function(e){
    e.preventDefault();
    goSmall();
  });

  jwerty.key('ctrl+shift+s', function(e) {
    goSmall();
    return false;
  });

  // handle medium button
  function goMedium() {
    killDisco();
    killHay();
    fullMode = false;
    sizeiframe(getRandom(500,800));
  }

  $('#sg-size-m').on("click", function(e){
    e.preventDefault();
    goMedium();
  });

  jwerty.key('ctrl+shift+m', function(e) {
    goLarge();
    return false;
  });

  // handle large button
  function goLarge() {
    killDisco();
    killHay();
    fullMode = false;
    sizeiframe(getRandom(800,1200));
  }

  $('#sg-size-l').on("click", function(e){
    e.preventDefault();
    goLarge();
  });

  jwerty.key('ctrl+shift+l', function(e) {
    goLarge();
    return false;
  });

  //Click Full Width Button
  $('#sg-size-full').on("click", function(e){ //Resets
    e.preventDefault();
    killDisco();
    killHay();
    fullMode = true;
    sizeiframe(sw);
  });

  //Click Random Size Button
  $('#sg-size-random').on("click", function(e){
    e.preventDefault();
    killDisco();
    killHay();
    fullMode = false;
    sizeiframe(getRandom(minViewportWidth,sw));
  });

  //Click for Disco Mode, which resizes the viewport randomly
  $('#sg-size-disco').on("click", function(e){
    e.preventDefault();
    killHay();
    fullMode = false;

    if (discoMode) {
      killDisco();

    } else {
      startDisco();
    }
  });

  /* Disco Mode */
  function disco() {
    sizeiframe(getRandom(minViewportWidth,sw));
  }

  function killDisco() {
    discoMode = false;
    clearInterval(discoID);
    discoID = false;
  }

  function startDisco() {
    discoMode = true;
    discoID = setInterval(disco, 800);
  }

  jwerty.key('ctrl+shift+d', function(e) {
    if (!discoMode) {
      startDisco();
    } else {
      killDisco();
    }
    return false;
  });

  //Stephen Hay Mode - "Start with the small screen first, then expand until it looks like shit. Time for a breakpoint!"
  $('#sg-size-hay').on("click", function(e){
    e.preventDefault();
    killDisco();
    if (hayMode) {
      killHay();
    } else {
      startHay();
    }
  });

  //Stop Hay! Mode
  function killHay() {
    var currentWidth = $sgViewport.width();
    hayMode = false;
    $sgViewport.removeClass('hay-mode');
    $('#sg-gen-container').removeClass('hay-mode');
    sizeiframe(Math.floor(currentWidth));
  }

  // start Hay! mode
  function startHay() {
    hayMode = true;
    $('#sg-gen-container').removeClass("vp-animate").width(minViewportWidth+viewportResizeHandleWidth);
    $sgViewport.removeClass("vp-animate").width(minViewportWidth);

    var timeoutID = window.setTimeout(function(){
      $('#sg-gen-container').addClass('hay-mode').width(maxViewportWidth+viewportResizeHandleWidth);
      $sgViewport.addClass('hay-mode').width(maxViewportWidth);

      setInterval(function(){ var vpSize = $sgViewport.width(); updateSizeReading(vpSize); },100);
    }, 200);
  }

  // start hay from a keyboard shortcut
  jwerty.key('ctrl+shift+h', function(e) {
    if (!hayMode) {
      startHay();
    } else {
      killHay();
    }
  });

  //Pixel input
  $sizePx.on('keydown', function(e){
    var val = Math.floor($(this).val());

    if(e.keyCode === 38) { //If the up arrow key is hit
      val++;
      sizeiframe(val,false);
    } else if(e.keyCode === 40) { //If the down arrow key is hit
      val--;
      sizeiframe(val,false);
    } else if(e.keyCode === 13) { //If the Enter key is hit
      e.preventDefault();
      sizeiframe(val); //Size Iframe to value of text box
      $(this).blur();
    }
  });

  $sizePx.on('keyup', function(){
    var val = Math.floor($(this).val());
    updateSizeReading(val,'px','updateEmInput');
  });

  //Em input
  $sizeEms.on('keydown', function(e){
    var val = parseFloat($(this).val());

    if(e.keyCode === 38) { //If the up arrow key is hit
      val++;
      sizeiframe(Math.floor(val*$bodySize),false);
    } else if(e.keyCode === 40) { //If the down arrow key is hit
      val--;
      sizeiframe(Math.floor(val*$bodySize),false);
    } else if(e.keyCode === 13) { //If the Enter key is hit
      e.preventDefault();
      sizeiframe(Math.floor(val*$bodySize)); //Size Iframe to value of text box
    }
  });

  $sizeEms.on('keyup', function(){
    var val = parseFloat($(this).val());
    updateSizeReading(val,'em','updatePxInput');
  });

  // set 0 to 320px as a default
  jwerty.key('ctrl+shift+0', function(e) {
    e.preventDefault();
    sizeiframe(320,true);
    return false;
  });

  // handle the MQ click
  var mqs = [];
  $('#sg-mq a').each(function(i) {

    mqs.push($(this).html());

    // bind the click
    $(this).on("click", function(i,k) {
      return function(e) {
        e.preventDefault();
        var val = $(k).html();
        var type = (val.indexOf("px") !== -1) ? "px" : "em";
        val = val.replace(type,"");
        var width = (type === "px") ? val*1 : val*$bodySize;
        sizeiframe(width,true);
      };
    }(i,this));

    // bind the keyboard shortcut. can't use cmd on a mac because 3 & 4 are for screenshots
    jwerty.key('ctrl+shift+'+(i+1), function (k) {
      return function(e) {
        var val = $(k).html();
        var type = (val.indexOf("px") !== -1) ? "px" : "em";
        val = val.replace(type,"");
        var width = (type === "px") ? val*1 : val*$bodySize;
        sizeiframe(width,true);
        return false;
      };
    }(this));

  });

  //Resize the viewport
  //'size' is the target size of the viewport
  //'animate' is a boolean for switching the CSS animation on or off. 'animate' is true by default, but can be set to false for things like nudging and dragging
  function sizeiframe(size,animate) {
    var theSize;

    if(size>maxViewportWidth) { //If the entered size is larger than the max allowed viewport size, cap value at max vp size
      theSize = maxViewportWidth;
    } else if(size<minViewportWidth) { //If the entered size is less than the minimum allowed viewport size, cap value at min vp size
      theSize = minViewportWidth;
    } else {
      theSize = size;
    }

    //Conditionally remove CSS animation class from viewport
    if(animate===false) {
      $('#sg-gen-container,#sg-viewport').removeClass("vp-animate"); //If aninate is set to false, remove animate class from viewport
    } else {
      $('#sg-gen-container,#sg-viewport').addClass("vp-animate");
    }

    $('#sg-gen-container').width(theSize+viewportResizeHandleWidth); //Resize viewport wrapper to desired size + size of drag resize handler
    $sgViewport.width(theSize); //Resize viewport to desired size

    var targetOrigin = (window.location.protocol === "file:") ? "*" : window.location.protocol+"//"+window.location.host;
    var obj = JSON.stringify({ "event": "patternLab.resize", "resize": "true" });
    document.getElementById('sg-viewport').contentWindow.postMessage(obj,targetOrigin);

    updateSizeReading(theSize); //Update values in toolbar
    saveSize(theSize); //Save current viewport to cookie
  }

  $("#sg-gen-container").on('transitionend webkitTransitionEnd', function(e){
    var targetOrigin = (window.location.protocol === "file:") ? "*" : window.location.protocol+"//"+window.location.host;
    var obj = JSON.stringify({ "event": "patternLab.resize", "resize": "true" });
    document.getElementById('sg-viewport').contentWindow.postMessage(obj,targetOrigin);
  });

  function saveSize(size) {
    if (!DataSaver.findValue('vpWidth')) {
      DataSaver.addValue("vpWidth",size);
    } else {
      DataSaver.updateValue("vpWidth",size);
    }
  }


  //Update Pixel and Em inputs
  //'size' is the input number
  //'unit' is the type of unit: either px or em. Default is px. Accepted values are 'px' and 'em'
  //'target' is what inputs to update. Defaults to both
  function updateSizeReading(size,unit,target) {
    var emSize, pxSize;

    if(unit==='em') { //If size value is in em units
      emSize = size;
      pxSize = Math.floor(size*$bodySize);
    } else { //If value is px or absent
      pxSize = size;
      emSize = size/$bodySize;
    }

    if (target === 'updatePxInput') {
      $sizePx.val(pxSize);
    } else if (target === 'updateEmInput') {
      $sizeEms.val(emSize.toFixed(2));
    } else {
      $sizeEms.val(emSize.toFixed(2));
      $sizePx.val(pxSize);
    }
  }

  /* Returns a random number between min and max */
  function getRandom (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  //Update The viewport size
  function updateViewportWidth(size) {
    $("#sg-viewport").width(size);
    $("#sg-gen-container").width(size*1 + 14);

    updateSizeReading(size);
  }

  $('#sg-gen-container').on('touchstart', function(event){});

  // handles widening the "viewport"
  //   1. on "mousedown" store the click location
  //   2. make a hidden div visible so that it can track mouse movements and make sure the pointer doesn't get lost in the iframe
  //   3. on "mousemove" calculate the math, save the results to a cookie, and update the viewport
  $('#sg-rightpull').mousedown(function(event) {

    // capture default data
    var origClientX = event.clientX;
    var origViewportWidth = $sgViewport.width();

    fullMode = false;

    // show the cover
    $("#sg-cover").css("display","block");

    // add the mouse move event and capture data. also update the viewport width
    $('#sg-cover').mousemove(function(event) {
      var viewportWidth;

      viewportWidth = origViewportWidth + 2*(event.clientX - origClientX);

      if (viewportWidth > minViewportWidth) {

        if (!DataSaver.findValue('vpWidth')) {
          DataSaver.addValue("vpWidth",viewportWidth);
        } else {
          DataSaver.updateValue("vpWidth",viewportWidth);
        }

        sizeiframe(viewportWidth,false);
      }
    });

    return false;

  });

  // on "mouseup" we unbind the "mousemove" event and hide the cover again
  $('body').mouseup(function() {
    $('#sg-cover').unbind('mousemove');
    $('#sg-cover').css("display","none");
  });


  // capture the viewport width that was loaded and modify it so it fits with the pull bar
  var origViewportWidth = $("#sg-viewport").width();
  $("#sg-gen-container").width(origViewportWidth);

  var testWidth = screen.width;
  if (window.orientation !== undefined) {
    testWidth = (window.orientation === 0) ? screen.width : screen.height;
  }
  if (($(window).width() == testWidth) && ('ontouchstart' in document.documentElement) && ($(window).width() <= 1024)) {
    $("#sg-rightpull-container").width(0);
  } else {
    $("#sg-viewport").width(origViewportWidth - 14);
  }
  updateSizeReading($("#sg-viewport").width());

  // get the request vars
  var oGetVars = urlHandler.getRequestVars();

  // pre-load the viewport width
  var vpWidth = 0;
  var trackViewportWidth = true; // can toggle this feature on & off

  if ((oGetVars.h !== undefined) || (oGetVars.hay !== undefined)) {
    startHay();
  } else if ((oGetVars.d !== undefined) || (oGetVars.disco !== undefined)) {
    startDisco();
  } else if ((oGetVars.w !== undefined) || (oGetVars.width !== undefined)) {
    vpWidth = (oGetVars.w !== undefined) ? oGetVars.w : oGetVars.width;
    vpWidth = (vpWidth.indexOf("em") !== -1) ? Math.floor(Math.floor(vpWidth.replace("em",""))*$bodySize) : Math.floor(vpWidth.replace("px",""));
    DataSaver.updateValue("vpWidth",vpWidth);
    updateViewportWidth(vpWidth);
  } else if (trackViewportWidth && (vpWidth = DataSaver.findValue("vpWidth"))) {
    updateViewportWidth(vpWidth);
  }

  // set up the defaults for the
  var baseIframePath = window.location.protocol+"//"+window.location.host+window.location.pathname.replace("index.html","");
  var patternName    = ((config.defaultPattern !== undefined) && (typeof config.defaultPattern === 'string') && (config.defaultPattern.trim().length > 0)) ? config.defaultPattern : 'all';
  var iFramePath     = baseIframePath+"styleguide/html/styleguide.html?"+Date.now();
  if ((oGetVars.p !== undefined) || (oGetVars.pattern !== undefined)) {
    patternName = (oGetVars.p !== undefined) ? oGetVars.p : oGetVars.pattern;
  }

  if (patternName !== "all") {
    patternPath = urlHandler.getFileName(patternName);
    iFramePath  = (patternPath !== "") ? baseIframePath+patternPath+"?"+Date.now() : iFramePath;
    document.getElementById("title").innerHTML = "Pattern Lab - "+patternName;
    history.replaceState({ "pattern": patternName }, null, null);
  }

  if (document.getElementById("sg-raw") !== undefined) {
    document.getElementById("sg-raw").setAttribute("href",urlHandler.getFileName(patternName));
  }

  urlHandler.skipBack = true;
  document.getElementById("sg-viewport").contentWindow.location.replace(iFramePath);

  //Close all dropdowns and navigation
  function closePanels() {
    $('.sg-nav-container, .sg-nav-toggle, .sg-acc-handle, .sg-acc-panel').removeClass('active');
    patternFinder.closeFinder();
  }

  // update the iframe with the source from clicked element in pull down menu. also close the menu
  // having it outside fixes an auto-close bug i ran into
  $('a[data-patternpartial]').on("click", function(e){
    e.preventDefault();
    // update the iframe via the history api handler
    var obj = JSON.stringify({ "event": "patternLab.updatePath", "path": urlHandler.getFileName($(this).attr("data-patternpartial")) });
    document.getElementById("sg-viewport").contentWindow.postMessage(obj, urlHandler.targetOrigin);
    closePanels();
  });

  // handle when someone clicks on the grey area of the viewport so it auto-closes the nav
  $('#sg-vp-wrap').click(function() {
    closePanels();
  });

  // Listen for resize changes
  if (window.orientation !== undefined) {
    var origOrientation = window.orientation;
    window.addEventListener("orientationchange", function() {
      if (window.orientation != origOrientation) {
        $("#sg-gen-container").width($(window).width());
        $("#sg-viewport").width($(window).width());
        updateSizeReading($(window).width());
        origOrientation = window.orientation;
      }
    }, false);

  }

  // watch the iframe source so that it can be sent back to everyone else.
  // based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
  function receiveIframeMessage(event) {

    // does the origin sending the message match the current host? if not dev/null the request
    if ((window.location.protocol !== "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
      return;
    }

    var data = {};
    try {
      data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
    } catch(e) {}
    
    if (data.event !== undefined) {
      
      if (data.event == "patternLab.pageLoad") {

        if (!urlHandler.skipBack) {

          if ((history.state === undefined) || (history.state === null) || (history.state.pattern !== data.patternpartial)) {
            urlHandler.pushPattern(data.patternpartial, data.path);
          }

          /*
          if (wsnConnected) {
            var iFramePath = urlHandler.getFileName(data.patternpartial);
            wsn.send( '{"url": "'+iFramePath+'", "patternpartial": "'+event.data.patternpartial+'" }' );
          }
          */
        }

        // reset the defaults
        urlHandler.skipBack = false;

      } else if (data.event == "patternLab.keyPress") {
        if (data.keyPress == 'ctrl+shift+s') {
          goSmall();
        } else if (data.keyPress == 'ctrl+shift+m') {
          goMedium();
        } else if (data.keyPress == 'ctrl+shift+l') {
          goLarge();
        } else if (data.keyPress == 'ctrl+shift+d') {
          if (!discoMode) {
            startDisco();
          } else {
            killDisco();
          }
        } else if (data.keyPress == 'ctrl+shift+h') {
          if (!hayMode) {
            startHay();
          } else {
            killHay();
          }
        } else if (data.keyPress == 'ctrl+shift+0') {
          sizeiframe(320,true);
        } else if (found == data.keyPress.match(/ctrl\+shift\+([1-9])/)) {
          var val = mqs[(found[1]-1)];
          var type = (val.indexOf("px") !== -1) ? "px" : "em";
          val = val.replace(type,"");
          var width = (type === "px") ? val*1 : val*$bodySize;
          sizeiframe(width,true);
        }
        return false;
      }
      
    }
    
  }
  window.addEventListener("message", receiveIframeMessage, false);

})(this);

/*!
 * Plugin Loader
 *
 * Copyright (c) 2015 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Takes the assets they can be loaded for plugins and adds them to the DOM
 *
 * @requires styleguide.js
 *
 */

var pluginLoader = {
  
  init: function () {
    
    var s, t, l, c, n;
    
    for (var i = 0; i < plugins.length; ++i) {
      
      var plugin = plugins[i];
      
      // load the templates
      for (var key in plugin.templates) {
        if (plugin.templates.hasOwnProperty(key)) {
          t           = document.getElementsByTagName('script');
          l           = t.length - 1;
          s           = t[l];
          n           = document.createElement('script');
          n.type      = 'text/mustache';
          n.id        = plugin.name.replace("\/","-")+"-"+key+"-template";
          n.innerHTML = plugin.templates[key];
          s.parentNode.insertBefore(n, s.nextSibling);
        }
      }
      
      // load the stylesheets
      for (var k = 0; k < plugin.stylesheets.length; ++k) {
        s       = plugin.stylesheets[k];
        t       = document.getElementsByTagName('link');
        l       = t.length - 1;
        c       = t[l];
        n       = document.createElement('link');
        n.type  = 'text/css';
        n.rel   = 'stylesheet';
        n.href  = 'patternlab-components/'+plugin.name+'/'+s;
        n.media = 'screen';
        c.parentNode.insertBefore(n, c.nextSibling);
      }
      
      // load the javascript
      // $script.path('patternlab-components/'+plugin.name+'/');
      $script(plugin.javascripts, plugin.name, eval('(function() { '+plugin.callback+' })'));
      $script.ready([plugin.name], eval('(function() { '+plugin.onready+' })'));
      
    }
    
  }
  
};

pluginLoader.init();
