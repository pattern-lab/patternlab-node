/* eslint-disable no-param-reassign, no-unused-vars */
/**
 * "Modal" (aka Panel UI) for the Styleguide Layer - for both annotations and code/info
 */

import { panelsUtil } from './panels-util';
import './pl-copy-to-clipboard/pl-copy-to-clipboard';
import { iframeMsgDataExtraction } from '../utils';

export const modalStyleguide = {
  // set up some defaults
  active: [],
  targetOrigin:
    window.location.protocol === 'file:'
      ? '*'
      : window.location.protocol + '//' + window.location.host,

  /**
   * initialize the modal window
   */
  onReady() {
    // go through the panel toggles and add click event to the pattern extra toggle button
    const toggles = document.querySelectorAll('.pl-js-pattern-extra-toggle');

    for (let i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener('click', (e) => {
        const patternPartial = toggles[i].getAttribute('data-patternpartial');
        modalStyleguide.toggle(patternPartial);
      });
    }
  },

  /**
   * toggle the modal window open and closed based on clicking the pip
   * @param  {String}       the patternPartial that identifies what needs to be toggled
   */
  toggle(patternPartial) {
    if (
      modalStyleguide.active[patternPartial] === undefined ||
      !modalStyleguide.active[patternPartial]
    ) {
      const el = document.getElementById('pl-pattern-data-' + patternPartial);
      modalStyleguide.collectAndSend(el, true, false);
    } else {
      modalStyleguide.highlightsHide();
      modalStyleguide.close(patternPartial);
    }
  },

  /**
   * open the modal window for a view-all entry
   * @param  {String}       the patternPartial that identifies what needs to be opened
   * @param  {String}       the content that should be inserted
   */
  open(patternPartial, content) {
    // make sure templateRendered is modified to be an HTML element
    let div = document.createElement('div');
    div.innerHTML = content;
    content = document
      .createElement('div')
      .appendChild(div)
      .querySelector('div');

    // add click events
    content = panelsUtil.addClickEvents(content, patternPartial);

    // make sure the modal viewer and other options are off just in case
    // modalStyleguide.close(patternPartial);

    // note it's turned on in the viewer
    modalStyleguide.active[patternPartial] = true;

    // make sure there's no content
    div = document.getElementById('pl-pattern-extra-' + patternPartial);
    if (div && div.childNodes) {
      if (div.childNodes.length > 0) {
        div.removeChild(div.childNodes[0]);
      }
    }

    // add the content
    document
      .getElementById('pl-pattern-extra-' + patternPartial)
      .appendChild(content);

    // show the modal
    const toggle = document.getElementById(
      'pl-pattern-extra-toggle-' + patternPartial
    );
    if (toggle) {
      toggle.classList.add('pl-is-active');
    }

    document
      .getElementById('pl-pattern-extra-' + patternPartial)
      .classList.add('pl-is-active');
  },

  /**
   * close the modal window for a view-all entry
   * @param  {String}       the patternPartial that identifies what needs to be closed
   */
  close(patternPartial) {
    // note that the modal viewer is no longer active
    modalStyleguide.active[patternPartial] = false;

    // hide the modal, look at info-panel.js
    const toggle = document.getElementById(
      'pl-pattern-extra-toggle-' + patternPartial
    );
    if (toggle) {
      toggle.classList.remove('pl-is-active');
    }

    if (document.getElementById('pl-pattern-extra-' + patternPartial)) {
      document
        .getElementById('pl-pattern-extra-' + patternPartial)
        .classList.remove('pl-is-active');
    }
  },

  /**
   * get the data that needs to be send to the viewer for rendering
   * @param  {Element}      the identifier for the element that needs to be collected
   * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
   * @param  {Boolean}      if the text in the dropdown should be switched
   */
  collectAndSend(el, iframePassback, switchText) {
    /**
     * Verify <script> tag has JSON data available (not just whitespace) - helps prevents JS errors from
     * getting thrown when certain script tags aren't rendered with partial.patternData content.
     */
    if (/\S/.test(el.innerHTML)) {
      const patternData = JSON.parse(el.innerHTML);
      if (patternData.patternName !== undefined) {
        const patternMarkupEl = document.querySelector(
          '#' + patternData.patternPartial + ' > .pl-js-pattern-example'
        );
        patternData.patternMarkup =
          patternMarkupEl !== null
            ? patternMarkupEl.innerHTML
            : document.querySelector('body').innerHTML;
        modalStyleguide.patternQueryInfo(
          patternData,
          iframePassback,
          switchText
        );
      }
    } else {
      // @todo: how are we handling conditional logging for debugging based on the dev environment?
      // console.log('This <script> tag\'s JSON is empty for some reason...');
    }
  },

  /**
   * hide the annotation highlights
   */
  highlightsHide(patternPartial) {
    const patternPartialSelector =
      patternPartial !== undefined ? '#' + patternPartial + ' > ' : '';
    let elsToHide = document.querySelectorAll(
      patternPartialSelector + '.pl-has-annotation'
    );
    for (let i = 0; i < elsToHide.length; i++) {
      elsToHide[i].classList.remove('pl-has-annotation');
    }
    elsToHide = document.querySelectorAll(
      patternPartialSelector + '.pl-c-annotation-tip'
    );
    for (let i = 0; i < elsToHide.length; i++) {
      elsToHide[i].hidden = true;
    }
  },

  /**
   * return the pattern info to the top level
   * @param  {Object}       the content that will be sent to the viewer for rendering
   * @param  {Boolean}      if the refresh is of a view-all view and the content should be sent back
   * @param  {Boolean}      if the text in the dropdown should be switched
   */
  patternQueryInfo(patternData, iframePassback, switchText) {
    // send a message to the pattern
    try {
      const obj = JSON.stringify({
        event: 'patternLab.patternQueryInfo',
        patternData,
        iframePassback,
        switchText,
      });
      window.parent.postMessage(obj, modalStyleguide.targetOrigin);
    } catch (e) {
      // @todo: how do we want to handle exceptions here?
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

    // see if it got a path to replace
    if (data.event !== undefined && data.event === 'patternLab.patternQuery') {
      // find all elements related to pattern info
      const els = document.querySelectorAll('.pl-js-pattern-data');
      const iframePassback = els.length > 1;

      // send each up to the parent to be read and compiled into panels
      for (let i = 0; i < els.length; i++) {
        modalStyleguide.collectAndSend(els[i], iframePassback, data.switchText);
      }
    } else if (
      data.event !== undefined &&
      data.event === 'patternLab.patternModalInsert'
    ) {
      // insert the previously rendered content being passed from the iframe
      modalStyleguide.open(data.patternPartial, data.modalContent);
    } else if (
      data.event !== undefined &&
      data.event === 'patternLab.annotationsHighlightShow'
    ) {
      let elsToHighlight, item, span;

      // go over the supplied annotations
      for (let i = 0; i < data.annotations.length; i++) {
        item = data.annotations[i];
        elsToHighlight = document.querySelectorAll(item.el);

        if (elsToHighlight.length > 0) {
          for (let j = 0; j < elsToHighlight.length; j++) {
            elsToHighlight[j].classList.add('pl-has-annotation');

            span = document.createElement('span');
            span.innerHTML = item.displayNumber;
            span.classList.add('pl-c-annotation-tip');

            if (
              window
                .getComputedStyle(elsToHighlight[j], null)
                .getPropertyValue('max-height') === '0px'
            ) {
              span.hidden = true;
            }

            const annotationTip = document.querySelector(
              item.el + ' > span.pl-c-annotation-tip'
            );
            if (annotationTip === null) {
              elsToHighlight[j].insertBefore(
                span,
                elsToHighlight[j].firstChild
              );
            } else {
              annotationTip.hidden = false;
            }

            elsToHighlight[j].onclick = (function (el) {
              return function (event) {
                event.preventDefault();
                event.stopPropagation();
                const obj = JSON.stringify({
                  event: 'patternLab.annotationNumberClicked',
                  displayNumber: el.displayNumber,
                });
                window.parent.postMessage(obj, modalStyleguide.targetOrigin);
              };
            })(item);
          }
        }
      }
    } else if (
      data.event !== undefined &&
      data.event === 'patternLab.annotationsHighlightHide'
    ) {
      modalStyleguide.highlightsHide();
    } else if (
      data.event !== undefined &&
      data.event === 'patternLab.patternModalClose'
    ) {
      const keys = [];
      for (const k in modalStyleguide.active) {
        if (k) {
          keys.push(k);
        }
      }
      for (let i = 0; i < keys.length; i++) {
        const patternPartial = keys[i];
        if (modalStyleguide.active[patternPartial]) {
          modalStyleguide.close(patternPartial);
        }
      }
    }
  },
};

// when the document is ready make sure the modal is ready
modalStyleguide.onReady();
window.addEventListener('message', modalStyleguide.receiveIframeMessage, false);
