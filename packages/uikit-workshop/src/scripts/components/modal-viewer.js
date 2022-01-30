/* eslint-disable no-unused-vars */
/**
 * "Modal" (aka Panel UI) for the Viewer Layer - for both annotations and code/info
 */

import { scrollTo } from 'scroll-js';
import { urlHandler, Dispatcher, iframeMsgDataExtraction } from '../utils';
import { panelsViewer } from './panels-viewer';
import { store } from '../store.js';
// These are the actions needed by this element.
import { updateDrawerState, isViewallPage } from '../actions/app.js';

export const modalViewer = {
  // set up some defaults
  delayCheckingModalViewer: false,
  iframeElement: document.querySelector('.pl-js-iframe'),
  iframeCustomElement: document.querySelector('pl-iframe'),
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
    window.addEventListener('message', modalViewer.receiveIframeMessage, false);
    // make sure the listener for checkpanels is set-up
    Dispatcher.addListener('insertPanels', modalViewer.insert);

    modalViewer.__storeUnsubscribe = store.subscribe(() =>
      modalViewer._stateChanged(store.getState())
    );
    modalViewer._stateChanged(store.getState());

    // check query strings to handle auto-opening behavior
    const queryStringVars = urlHandler.getRequestVars();

    // show the modal if code view is called via query string
    if (
      queryStringVars.view !== undefined &&
      (queryStringVars.view === 'code' ||
        queryStringVars.view === 'c' ||
        queryStringVars.view === 'annotations' ||
        queryStringVars.view === 'a')
    ) {
      store.dispatch(updateDrawerState(true));
    }
  },

  /**
   * toggle the modal window open and closed
   */
  toggle() {
    if (modalViewer.active) {
      store.dispatch(updateDrawerState(false));
    } else {
      store.dispatch(updateDrawerState(true));
    }
  },

  /**
   * open the modal window
   */
  open() {
    modalViewer.queryPattern();

    // Show annotations if data is available and modal is open
    if (modalViewer.patternData) {
      if (
        modalViewer.patternData.annotations &&
        modalViewer.patternData.annotations.length > 0
      ) {
        const obj = JSON.stringify({
          event: 'patternLab.annotationsHighlightShow',
          annotations: modalViewer.patternData.annotations,
        });

        if (modalViewer.iframeElement.contentWindow) {
          modalViewer.iframeElement.contentWindow.postMessage(
            obj,
            modalViewer.targetOrigin
          );
        } else {
          modalViewer.iframeElement = document.querySelector('.pl-js-iframe');

          if (modalViewer.iframeElement.contentWindow) {
            modalViewer.open();
          } else {
            console.log('modelViewer open cannot find the iframeElement...');
          }
        }
      }
    }
  },

  /**
   * close the modal window
   */
  close() {
    // tell the styleguide to close
    const obj = JSON.stringify({
      event: 'patternLab.patternModalClose',
    });

    if (modalViewer.iframeElement) {
      if (modalViewer.iframeElement.contentWindow) {
        modalViewer.iframeElement.contentWindow.postMessage(
          obj,
          modalViewer.targetOrigin
        );

        const obj2 = JSON.stringify({
          event: 'patternLab.annotationsHighlightHide',
        });
        modalViewer.iframeElement.contentWindow.postMessage(
          obj2,
          modalViewer.targetOrigin
        );
      } else {
        modalViewer.iframeElement = document.querySelector('.pl-js-iframe');

        if (modalViewer.iframeElement.contentWindow) {
          modalViewer.close();
        } else {
          console.log('modelViewer close cannot find the iframeElement...');
        }
      }
    }
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
      if (modalViewer.iframeElement.contentWindow) {
        modalViewer.iframeElement.contentWindow.postMessage(
          obj,
          modalViewer.targetOrigin
        );
      } else {
        modalViewer.iframeElement = document.querySelector('.pl-js-iframe');

        if (modalViewer.iframeElement.contentWindow) {
          modalViewer.insert(templateRendered, patternPartial, iframePassback);
        } else {
          console.log('modelViewer insert cannot find the iframeElement...');
        }
      }
    } else {
      const contentContainer = document.querySelector('.pl-js-drawer-content');

      // Clear out any existing children before appending the new panel content
      if (contentContainer.firstChild !== null) {
        while (contentContainer.firstChild !== null) {
          contentContainer.removeChild(contentContainer.firstChild);
        }
      }

      contentContainer.appendChild(templateRendered);
      modalViewer.addClickEvents(contentContainer);
    }
  },

  addClickEvents(contentContainer = document) {
    contentContainer.querySelectorAll('.pl-js-lineage-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const patternPartial = e.target.getAttribute('data-patternpartial');

        if (patternPartial && modalViewer.iframeCustomElement) {
          e.preventDefault();
          modalViewer.iframeCustomElement.navigateTo(patternPartial);
        }
      });
    });
  },

  /**
   * refresh the modal if a new pattern is loaded and the modal is active
   * @param  {Object}       the patternData sent back from the query
   * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
   * @param  {Boolean}      if the text in the dropdown should be switched
   */
  refresh(patternData, iframePassback, switchText) {
    modalViewer.patternData = patternData;

    // gather the data that will fill the modal window
    panelsViewer.gatherPanels(patternData, iframePassback, switchText);
  },

  /**
   * slides the modal window into or out of view
   * @param  {Integer}      where the modal window should be slide to
   */
  slide(pos) {
    modalViewer.toggle();
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

    const patternInfoElem = document.querySelector('.pl-js-pattern-info');
    // const scroll = new Scroll(patternInfoElem);

    // add active class to called element and scroll to it
    for (let i = 0; i < els.length; ++i) {
      if (i + 1 === pos) {
        els[i].classList.add('pl-is-active');

        scrollTo(patternInfoElem, {
          top: els[i].offsetTop - 14,
          behavior: 'smooth',
        }).then(function () {
          // console.log('finished scrolling');
        });
      }
    }
  },

  /**
   * ask the pattern for info so we can open the modal window and populate it
   * @param  {Boolean}      if the dropdown text should be changed
   */
  queryPattern(switchText) {
    // send a message to the pattern
    const obj = JSON.stringify({
      event: 'patternLab.patternQuery',
      switchText,
    });

    // only emit this when the iframe element exists.
    // @todo: refactor to better handle async UI rendering
    if (modalViewer.iframeElement) {
      if (modalViewer.iframeElement.contentWindow) {
        modalViewer.iframeElement.contentWindow.postMessage(
          obj,
          modalViewer.targetOrigin
        );
      } else {
        modalViewer.iframeElement = document.querySelector('.pl-js-iframe');

        if (modalViewer.iframeElement.contentWindow) {
          modalViewer.queryPattern(switchText);
        } else {
          console.log('queryPattern cannot find the iframeElement...');
        }
      }
    } else {
      modalViewer.iframeElement = document.querySelector('.pl-js-iframe');

      if (modalViewer.iframeElement.contentWindow) {
        modalViewer.iframeElement.contentWindow.postMessage(
          obj,
          modalViewer.targetOrigin
        );
      }
    }
  },

  /**
   * toggle the comment pop-up based on a user clicking on the pattern
   * based on the great MDN docs at https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
   *
   * @param {MessageEvent} e A message received by a target object.
   */
  receiveIframeMessage(e) {
    const data = iframeMsgDataExtraction(e);

    if (data.event !== undefined && data.event === 'patternLab.pageLoad') {
      // @todo: refactor to better handle async iframe loading
      // extra check to make sure the PL drawer will always render even if the iframe gets async loaded / rendered.
      if (modalViewer.delayCheckingModalViewer) {
        modalViewer._handleInitialModalViewerState();
      }

      if (
        data.patternpartial.indexOf('viewall-') === 0 ||
        data.patternpartial.indexOf('all') === 0
      ) {
        store.dispatch(isViewallPage(true));
      } else {
        store.dispatch(isViewallPage(false));
      }

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
      if (
        !modalViewer.panelRendered ||
        modalViewer.previouslyRenderedPattern !==
          data.patternData.patternPartial
      ) {
        // refresh the modal contents, but only when necessary (ex. when the page changes) -- prevents extra, unnecessary re-renders of content.
        modalViewer.refresh(
          data.patternData,
          data.iframePassback,
          data.switchText
        );
      }
    } else if (
      data.event !== undefined &&
      data.event === 'patternLab.annotationNumberClicked'
    ) {
      // slide to a given annoation
      modalViewer.slideToAnnotation(data.displayNumber);
    }
  },

  _handleInitialModalViewerState() {
    // try to re-locate the iframe element if this UI logic ran too early and the iframe component wasn't yet rendered
    if (!modalViewer.iframeElement) {
      modalViewer.iframeElement = document.querySelector('.pl-js-iframe');
    }

    // only try to auto-open / auto-close the drawer UI if the iframe element exists
    // @todo: refactor to better handle async UI rendering
    if (modalViewer.iframeElement) {
      modalViewer.delayCheckingModalViewer = false;
      if (modalViewer.active) {
        modalViewer.open();
      } else {
        modalViewer.close();
      }
    } else {
      modalViewer.delayCheckingModalViewer = true;
    }
  },

  _stateChanged(state) {
    if (modalViewer.active !== state.app.drawerOpened) {
      modalViewer.active = state.app.drawerOpened;
      if (modalViewer.iframeElement) {
        modalViewer._handleInitialModalViewerState();
      }
    }
  },
};

modalViewer.onReady();
