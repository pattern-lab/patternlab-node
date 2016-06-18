/*!
 * Modal for the Viewer Layer
 * For both annotations and code/info
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * @requires url-handler.js
 *
 */

var modalViewer = {
  
  // set up some defaults
  active:        false,
  template:      'info',
  patternData:   {},
  targetOrigin:  (window.location.protocol === 'file:') ? '*' : window.location.protocol+'//'+window.location.host,
  
  /**
  * initialize the modal window
  */
  onReady: function() {
    
    // watch for resizes and hide the modal container as appropriate when the modal is already hidden
    $(window).on('resize', function() {
      if (modalViewer.active === false) {
        modalViewer.slide($('#sg-modal-container').outerHeight());
      }
    });
    
    // make sure the listener for checkpanels is set-up
    Dispatcher.addListener('insertPanels', modalViewer.insert);
    
    // add the info/code panel onclick handler
    $('#sg-t-patterninfo').click(function(e) {
      e.preventDefault();
      $('#sg-tools-toggle').removeClass('active');
      $(this).parents('ul').removeClass('active');
      modalViewer.toggle();
    });
    
    // if the iframe loads a new page query the pattern for its info if the modal is active
    $('#sg-viewport').on('load', function() {
      if (modalViewer.active) {
        modalViewer.queryPattern();
      }
    });
    
    // make sure the modal viewer is not viewable
    modalViewer.hide();
    
    // make sure the close button handles the click
    $('#sg-modal-close-btn').on('click', function(e) {
      
      e.preventDefault();
      
      // hide any open annotations
      obj = JSON.stringify({ 'event': 'patternLab.annotationsHighlightHide' });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
      
      // hide the viewer
      modalViewer.close();
      
    });
    
    // review the query strings in case there is something the modal viewer is supposed to handle by default
    var queryStringVars = urlHandler.getRequestVars();
    
    // code panel related query string info
    if ((queryStringVars.view !== undefined) && ((queryStringVars.view === 'code') || (queryStringVars.view === 'c'))) {
      panelsViewer.initCopy = ((queryStringVars.copy !== undefined) && (queryStringVars.copy === 'true')) ? true : false;
      modalViewer.template = 'info';
      modalViewer.queryPattern();
    }
    
    // annotation panel related query string info
    if ((queryStringVars.view !== undefined) && ((queryStringVars.view === 'annotations') || (queryStringVars.view === 'a'))) {
      if (queryStringVars.number !== undefined) {
        panelsViewer.initMoveTo = queryStringVars.number;
      }
      modalViewer.template = 'comments';
      modalViewer.queryPattern();
    }
    
  },
  
  /**
  * toggle the modal window open and closed
  */
  toggle: function() {
    var message;
    if (modalViewer.active === false) {
      message = "Hide Pattern Info";
      modalViewer.active = true;
      modalViewer.queryPattern();
    } else {
      message = "Show Pattern Info";
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
  
  hide: function() {
    modalViewer.slide($('#sg-modal-container').outerHeight());
  },
  
  insert: function(templateRendered, patternPartial, iframePassback) {
    
    if (iframePassback) {
      
      // send a message to the pattern
      var obj = JSON.stringify({ 'event': 'patternLab.patternModalInsert', 'patternPartial': patternPartial, 'modalContent': templateRendered.outerHTML });
      document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
      
    } else {
      
      // insert the panels
      $('#sg-modal-content').html(templateRendered);
      
      // with the content inserted open the modal
      modalViewer.open();
      
    }
    
    // update the wording
    $('#sg-t-patterninfo').html("Hide Pattern Info");
    
  },
  
  /**
  * refresh the modal if a new pattern is loaded and the modal is active
  */
  refresh: function(patternData, iframePassback) {
    
    // if this is a styleguide view close the modal
    if (iframePassback) {
      modalViewer.hide();
    }
    
    // clear any selections that might have been made
    panelsViewer.clear();
    
    // gather the data that will fill the modal window
    panelsViewer.gatherPanels(patternData, iframePassback);
    
  },
  
  /**
  * slides the modal window into or out of view
  */
  slide: function(pos) {
    pos = (pos === 0) ? 0 : -pos;
    $('#sg-modal-container').css('bottom',pos);
  },
  
  /**
  * alias for slide
  */
  show: function() {
    modalViewer.slide(0);
  },
  
  /**
  * ask the pattern for info so we can open the modal window and populate it
  */
  queryPattern: function() {
    
    // send a message to the pattern
    var obj = JSON.stringify({ 'event': 'patternLab.patternQuery' });
    document.getElementById('sg-viewport').contentWindow.postMessage(obj, modalViewer.targetOrigin);
    
  },
  
  /**
  * toggle the comment pop-up based on a user clicking on the pattern
  * based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
  * @param  {Object}      event info
  */
  receiveIframeMessage: function(event) {
    
    var els, i, displayNumberCheck;
    
    // does the origin sending the message match the current host? if not dev/null the request
    if ((window.location.protocol !== 'file:') && (event.origin !== window.location.protocol+'//'+window.location.host)) {
      return;
    }
    
    var data = {};
    try {
      data = (typeof event.data !== 'string') ? event.data : JSON.parse(event.data);
    } catch(e) {}
    
    if ((data.event !== undefined) && (data.event == 'patternLab.patternQueryInfo')) {
      
      // refresh the modal if a new pattern is loaded and the modal is active
      modalViewer.refresh(data.patternData, data.iframePassback);
      
    } else if ((data.event !== undefined) && (data.event == 'patternLab.annotationNumberClicked')) {
      
      // remove active class
      els = document.querySelectorAll('#sg-annotations > .sg-annotations-list > li');
      for (i = 0; i < els.length; ++i) {
        els[i].classList.remove('active');
      }
      
      // add active class to called element and scroll to it
      for (i = 0; i < els.length; ++i) {
        if ((i+1) == data.displayNumber) {
          els[i].classList.add('active');
          $('.sg-pattern-extra-info').animate({scrollTop: els[i].offsetTop - 10}, 600);
        }
      }
      
    }
    
  }
  
};

// when the document is ready make sure the modal is ready
$(document).ready(function() { modalViewer.onReady(); });
window.addEventListener("message", modalViewer.receiveIframeMessage, false);
