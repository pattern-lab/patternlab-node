/**
 * "Modal" (aka Panel UI) for the Viewer Layer - for both annotations and code/info
 */

import $ from 'jquery';
import { urlHandler, DataSaver, Dispatcher } from '../utils';
import { panelsViewer } from './panels-viewer';

export const modalViewer = {
  // set up some defaults
  active: false,
  switchText: true,
  template: 'info',
  patternData: {},
  targetOrigin:
    window.location.protocol === 'file:'
      ? '*'
      : window.location.protocol + '//' + window.location.host,

  /**
   * initialize the modal window
   */
  onReady() {
    // make sure the listener for checkpanels is set-up
    Dispatcher.addListener('insertPanels', modalViewer.insert);

    // add the info/code panel onclick handler
    $('.pl-js-pattern-info-toggle').click(function(e) {
      modalViewer.toggle();
    });

    // make sure the close button handles the click
    $('.pl-js-modal-close-btn').on('click', function(e) {
      // hide any open annotations
      const obj = JSON.stringify({
        event: 'patternLab.annotationsHighlightHide',
      });
      document
        .querySelector('.pl-js-iframe')
        .contentWindow.postMessage(obj, modalViewer.targetOrigin);

      // hide the viewer
      modalViewer.close();
    });

    // see if the modal is already active, if so update attributes as appropriate
    if (DataSaver.findValue('modalActive') === 'true') {
      modalViewer.active = true;
      $('.pl-js-pattern-info-toggle').html('Hide Pattern Info');
    }

    // make sure the modal viewer is not viewable, it's always hidden by default. the pageLoad event determines when it actually opens
    modalViewer.hide();

    // review the query strings in case there is something the modal viewer is supposed to handle by default
    const queryStringVars = urlHandler.getRequestVars();

    // show the modal if code view is called via query string
    if (
      queryStringVars.view !== undefined &&
      (queryStringVars.view === 'code' || queryStringVars.view === 'c')
    ) {
      modalViewer.queryPattern();
    }

    // show the modal if the old annotations view is called via query string
    if (
      queryStringVars.view !== undefined &&
      (queryStringVars.view === 'annotations' || queryStringVars.view === 'a')
    ) {
      modalViewer.queryPattern();
    }
  },

  /**
   * toggle the modal window open and closed
   */
  toggle() {
    if (modalViewer.active === false) {
      modalViewer.queryPattern();
    } else {
      const obj = JSON.stringify({
        event: 'patternLab.annotationsHighlightHide',
      });
      document
        .querySelector('.pl-js-iframe')
        .contentWindow.postMessage(obj, modalViewer.targetOrigin);
      modalViewer.close();
    }
  },

  /**
   * open the modal window
   */
  open() {
    // make sure the modal viewer and other options are off just in case
    modalViewer.close();

    // note it's turned on in the viewer
    DataSaver.updateValue('modalActive', 'true');
    modalViewer.active = true;

    // show the modal
    modalViewer.show();
  },

  /**
   * close the modal window
   */
  close() {
    // note that the modal viewer is no longer active
    DataSaver.updateValue('modalActive', 'false');
    modalViewer.active = false;

    //Remove active class to modal
    $('.pl-js-modal').removeClass('pl-is-active');
    $('.pl-js-modal').removeAttr('style'); // remove inline height CSS

    // WIP: refactoring viewport panel to use CSS vars to resize
    // $('html').css('--pl-viewport-height', window.innerHeight - 32 + 'px');

    // update the wording
    $('.pl-js-pattern-info-toggle').html('Show Pattern Info');

    // tell the styleguide to close
    const obj = JSON.stringify({
      event: 'patternLab.patternModalClose',
    });
    document
      .querySelector('.pl-js-iframe')
      .contentWindow.postMessage(obj, modalViewer.targetOrigin);
  },

  /**
   * hide the modal window
   */
  hide() {
    $('.pl-js-modal').removeClass('pl-is-active');
    $('.pl-js-modal').removeAttr('style'); // remove inline height CSS
  },

  /**
   * insert the copy for the modal window. if it's meant to be sent back to the iframe, do that.
   * @param  {String}       the rendered template that should be inserted
   * @param  {String}       the patternPartial that the rendered template is related to
   * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
   * @param  {Boolean}      if the text in the dropdown should be switched
   */
  insert(templateRendered, patternPartial, iframePassback, switchText) {
    if (iframePassback) {
      // send a message to the pattern
      const obj = JSON.stringify({
        event: 'patternLab.patternModalInsert',
        patternPartial,
        modalContent: templateRendered.outerHTML,
      });
      document
        .querySelector('.pl-js-iframe')
        .contentWindow.postMessage(obj, modalViewer.targetOrigin);
    } else {
      // insert the panels and open the viewer
      $('.pl-js-modal-content').html(templateRendered);
      modalViewer.open();
    }

    // update the wording unless this is a default viewall opening
    if (switchText === true) {
      $('.pl-js-pattern-info-toggle').html('Hide Pattern Info');
    }
  },

  /**
   * refresh the modal if a new pattern is loaded and the modal is active
   * @param  {Object}       the patternData sent back from the query
   * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
   * @param  {Boolean}      if the text in the dropdown should be switched
   */
  refresh(patternData, iframePassback, switchText) {
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
  slide(pos) {
    $('.pl-js-modal').toggleClass('pl-is-active');
  },

  /**
   * slides the modal window to a particular annotation
   * @param  {Integer}      the number for the element that should be highlighted
   */
  slideToAnnotation(pos) {
    // remove active class
    const els = document.querySelectorAll('.pl-js-annotations li');
    for (let i = 0; i < els.length; ++i) {
      els[i].classList.remove('pl-is-active');
    }

    // add active class to called element and scroll to it
    for (let i = 0; i < els.length; ++i) {
      if (i + 1 === pos) {
        els[i].classList.add('pl-is-active');
        $('.pl-js-pattern-info').animate(
          {
            scrollTop: els[i].offsetTop - 10,
          },
          600
        );
      }
    }
  },

  /**
   * Show modal
   */
  show() {
    $('.pl-js-modal').addClass('pl-is-active');
  },

  /**
   * ask the pattern for info so we can open the modal window and populate it
   * @param  {Boolean}      if the dropdown text should be changed
   */
  queryPattern(switchText) {
    // note that the modal is active and set switchText
    if (switchText === undefined || switchText) {
      switchText = true;
      DataSaver.updateValue('modalActive', 'true');
      modalViewer.active = true;
    }

    // send a message to the pattern
    const obj = JSON.stringify({
      event: 'patternLab.patternQuery',
      switchText,
    });
    document
      .querySelector('.pl-js-iframe')
      .contentWindow.postMessage(obj, modalViewer.targetOrigin);
  },

  /**
   * toggle the comment pop-up based on a user clicking on the pattern
   * based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
   * @param  {Object}      event info
   */
  receiveIframeMessage(event) {
    // does the origin sending the message match the current host? if not dev/null the request
    if (
      window.location.protocol !== 'file:' &&
      event.origin !== window.location.protocol + '//' + window.location.host
    ) {
      return;
    }

    let data = {};

    try {
      data =
        typeof event.data !== 'string' ? event.data : JSON.parse(event.data);
    } catch (e) {
      // @todo: how do we want to handle exceptions here?
    }

    if (data.event !== undefined && data.event === 'patternLab.pageLoad') {
      if (
        modalViewer.active === false &&
        data.patternpartial !== undefined &&
        data.patternpartial.indexOf('viewall-') === 0 &&
        window.config.defaultShowPatternInfo !== undefined &&
        window.config.defaultShowPatternInfo
      ) {
        modalViewer.queryPattern(false);
      } else if (modalViewer.active === true) {
        modalViewer.queryPattern();
      }
    } else if (
      data.event !== undefined &&
      data.event === 'patternLab.patternQueryInfo'
    ) {
      // refresh the modal if a new pattern is loaded and the modal is active
      modalViewer.refresh(
        data.patternData,
        data.iframePassback,
        data.switchText
      );
    } else if (
      data.event !== undefined &&
      data.event === 'patternLab.annotationNumberClicked'
    ) {
      // slide to a given annoation
      modalViewer.slideToAnnotation(data.displayNumber);
    }
  },
};

// when the document is ready make sure the modal is ready
$(document).ready(function() {
  modalViewer.onReady();
});

window.addEventListener('message', modalViewer.receiveIframeMessage, false);
