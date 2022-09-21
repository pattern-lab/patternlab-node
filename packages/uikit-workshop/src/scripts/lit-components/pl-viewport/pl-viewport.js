/* eslint-disable no-unused-vars, no-param-reassign */
import { ifDefined } from 'lit-html/directives/if-defined';
import { store } from '../../store.js'; // connect to redux
import { updateCurrentPattern, updateCurrentUrl } from '../../actions/app.js'; // redux actions
import { updateViewportPx, updateViewportEm } from '../../actions/app.js'; // redux actions needed
import {
  minViewportWidth,
  maxViewportWidth,
  urlHandler,
  patternName,
  iframeMsgDataExtraction,
} from '../../utils';

import { html } from 'lit-html';
import { BaseLitComponent } from '../../components/base-component.js';

import iframeLoaderStyles from '../../../sass/pattern-lab--iframe-loader.scss?external';
import styles from './pl-viewport.scss?external';
import { customElement } from 'lit-element';

let trackingPageChange = false;

@customElement('pl-iframe')
class IFrame extends BaseLitComponent {
  constructor() {
    super();
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageLoad = this.handlePageLoad.bind(this);
    this.receiveIframeMessage = this.receiveIframeMessage.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleIframe404 = this.handleIframe404.bind(this);
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    iframeLoaderStyles.use();
    styles.use();

    this.defaultPattern =
      window.config && window.config.defaultPattern
        ? window.config.defaultPattern
        : 'all';

    this.defaultIframeUrl = urlHandler.getFileName(this.defaultPattern);

    if (trackingPageChange === false) {
      trackingPageChange = true;
      document.addEventListener('patternPartial', this.handlePageLoad);
      window.addEventListener('popstate', this.handlePageChange);
    }

    const state = store.getState();
    this.themeMode = state.app.themeMode || 'dark';
    this.isViewallPage = state.app.isViewallPage || false;
    this.currentPattern = state.app.currentPattern || '';
    this.layoutMode = state.app.layoutMode;

    if (state.app.viewportPx) {
      this.sizeiframe(state.app.viewportPx, false);
    }

    window.addEventListener('message', this.receiveIframeMessage, false);
    window.addEventListener('resize', this.handleResize);
    this.handleOrientationChange();

    // the simple HTML to render in the iFrame when encountering broken links
    this.iframe404Fallback = `
      <div
        class="pl-c-loader-wrapper pl-c-body--theme-${this.themeMode}"
      >
        <div class="pl-c-loader">
          <div class="pl-c-loader__content">
            <div class="pl-c-loader__message">
              <h1>Oh snap, a 404!</h1>
              <p>You might want to double-check to see if the page you're looking for has moved or if your URL is correct.</p>
              <p>Alternatively, <a href="/${this.defaultIframeUrl}">click here</a> to head back to the default Pattern Lab page!</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this._hasInitiallyRendered = false;
    this.fullMode = true;
    this.viewportResizeHandleWidth = 22; //Width of the viewport drag-to-resize handle
    this.bodySize =
      window.config.ishFontSize !== undefined
        ? parseInt(window.config.ishFontSize, 10)
        : parseInt(
            window
              .getComputedStyle(document.body, null)
              .getPropertyValue('font-size'),
            10
          ); //Body size of the document

    //set up the default for the
    this.baseIframePath =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname.replace('index.html', '');
    this.defaultIframePath = this.baseIframePath + '?p=components-overview';
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    iframeLoaderStyles.unuse();
    styles.unuse();
  }

  /**
   * returns the current patternName after removing any numbers / dashes
   * Workaround to PL Node not always having clean viewall / pattern links
   */
  sanitizePatternName(plName) {
    if (urlHandler.getFileName(plName)) {
      return plName;
    } else if (
      !document.querySelector(`[data-patternpartial="${plName}"]`) &&
      plName
    ) {
      return plName.replace(/[-][0-9][0-9]/g, '');
    } else {
      return plName;
    }
  }

  // returns the current patternName based on the `p=` query string OR the default pattern that's set globall (as a fallback)
  getPatternParam() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const patternParam = urlParams.get('p');

    if (patternParam === null) {
      return this.defaultPattern;
    } else {
      return this.sanitizePatternName(patternParam);
    }
  }

  // adds / updates the page's query string
  handlePageLoad(e) {
    const currentPattern = this.getPatternParam();

    if (currentPattern) {
      document.title = 'Pattern Lab - ' + currentPattern;

      const addressReplacement =
        window.location.protocol === 'file:'
          ? null
          : window.location.protocol +
            '//' +
            window.location.host +
            (window.config.noIndexHtmlremoval
              ? window.location.pathname
              : window.location.pathname.replace('index.html', '')) +
            '?p=' +
            currentPattern;

      if (this.dontWipeBrowserHistory === true) {
        window.history.replaceState(
          {
            currentPattern: currentPattern,
          },
          null,
          addressReplacement
        );
        this.dontWipeBrowserHistory = false;
      } else {
        window.history.pushState(
          {
            currentPattern: currentPattern,
          },
          null,
          addressReplacement
        );
      }
    }
  }

  // navigate to the new PL page (based on the query string) when the page's pop state changes
  handlePageChange(e) {
    if (e?.state?.currentPattern) {
      this.navigateTo(e.state.currentPattern);
    } else {
      this.navigateTo(this.getPatternParam());
    }
  }

  //Resize the viewport
  //'size' is the target size of the viewport
  //'animate' is a boolean for switching the CSS animation on or off. 'animate' is true by default, but can be set to false for things like nudging and dragging
  sizeiframe(size, animate) {
    let theSize;
    const self = this;

    // @todo: refactor to better handle the iframe async rendering
    if (this.iframe) {
      if (animate === true) {
        this.iframeContainer.classList.add('is-animating');
        this.iframe.classList.add('is-animating');
      }

      if (size < maxViewportWidth) {
        theSize = size;
      } else {
        //If the entered size is larger than the max allowed viewport size, cap value at max vp size
        theSize = maxViewportWidth;
      }

      if (size < minViewportWidth) {
        //If the entered size is less than the minimum allowed viewport size, cap value at min vp size
        theSize = minViewportWidth;
      }

      if (theSize > this.clientWidth) {
        theSize = this.clientWidth;
      }

      // resize viewport wrapper to desired size + size of drag resize handler
      // this.iframeContainer.style.width = theSize + this.viewportResizeHandleWidth + 'px';
      this.iframeContainer.style.width = theSize + 'px';
      // this.iframe.style.width = theSize + 'px'; // resize viewport to desired size

      // auto-remove transition classes if not the animate param isn't set to true
      setTimeout(function () {
        if (animate === true) {
          self.iframeContainer.classList.remove('is-animating');
          self.iframe.classList.remove('is-animating');
        }
      }, 800);

      const targetOrigin =
        window.location.protocol === 'file:'
          ? '*'
          : window.location.protocol + '//' + window.location.host;

      const obj = JSON.stringify({
        event: 'patternLab.resize',
        resize: 'true',
      });

      // only tell the iframe to resize when it's ready
      if (this._hasInitiallyRendered) {
        this.iframe.contentWindow.postMessage(obj, targetOrigin);
      }

      this.updateSizeReading(theSize); // update the displayed values in the toolbar
    }
  }

  handleOrientationChange() {
    // Listen for resize changes
    const self = this;
    if (window.orientation !== undefined) {
      this.origOrientation = window.orientation;
      window.addEventListener(
        'orientationchange',
        function () {
          if (window.orientation !== this.origOrientation) {
            const newWidth = window.innerWidth;
            self.iframeContainer.style.width = newWidth;
            self.iframe.style.width = newWidth;
            self.updateSizeReading(newWidth);
            this.origOrientation = window.orientation;
          }
        },
        false
      );
    }
  }

  handleResize() {
    this.updateSizeReading(this.iframeContainer.clientWidth);
  }

  // Update Pixel and Em inputs
  // 'size' is the input number
  // 'unit' is the type of unit: either px or em. Default is px.
  // Accepted values are 'px' and 'em'
  // 'target' is what inputs to update. Defaults to both
  updateSizeReading(size, unit, target) {
    if (size === 0) {
      return;
    }
    let emSize, pxSize;

    if (unit === 'em') {
      // if size value is in em units
      emSize = size;
      pxSize = Math.floor(size * this.bodySize);
    } else {
      // if value is px or absent
      pxSize = size;
      emSize = size / this.bodySize;
    }

    if (target === 'updatePxInput') {
      store.dispatch(updateViewportPx(pxSize));
    } else if (target === 'updateEmInput') {
      store.dispatch(updateViewportEm(emSize.toFixed(2)));
    } else {
      store.dispatch(updateViewportPx(pxSize));
      store.dispatch(updateViewportEm(emSize.toFixed(2)));
    }
  }

  _stateChanged(state) {
    if (this._hasInitiallyRendered) {
      if (state.app.viewportPx) {
        this.sizeiframe(state.app.viewportPx, false);
      } else {
        this.sizeiframe(this.iframe.clientWidth, false);
      }
    }

    // Update size when layout is changed
    if (this.layoutMode !== state.app.layoutMode) {
      this.layoutMode = state.app.layoutMode;
      if (this.iframeContainer) {
        this.updateSizeReading(this.iframeContainer.clientWidth);
      }
    }
  }

  navigateTo(pattern = patternName) {
    const plName = this.sanitizePatternName(pattern);
    const plPath = urlHandler.getFileName(plName);

    if (plPath) {
      this.iFramePath =
        plPath !== ''
          ? this.baseIframePath + plPath + '?' + Date.now()
          : this.defaultIframePath;
      this.dontWipeBrowserHistory = true;

      document
        .querySelector('.pl-js-iframe')
        .contentWindow.location.replace(this.iFramePath);
    }
  }

  firstUpdated() {
    this.iframe = this.querySelector('.pl-js-iframe');
    this.iframeContainer = this.querySelector('.pl-js-vp-iframe-container');
    this.iframeCover = this.querySelector('.pl-js-viewport-cover');
    this.updateSizeReading(this.iframeContainer.clientWidth);

    // watch for URL changes to try and catch any 404s within PL's iFrame
    //
    // technique loosely based off of https://stackoverflow.com/a/47675884
    const unloadIframeHandler = () => {
      // Timeout needed since the URL changes immediately after the `unload` event is dispatched.
      setTimeout(() => {
        this.handleIframe404();
      }, 0);
    };

    const attachIframeUnload = () => {
      // Remove the unloadIframeHandler in case it was already attached to avoid firing twice
      if (this.iframe.contentWindow) {
        this.iframe.contentWindow.removeEventListener(
          'unload',
          unloadIframeHandler
        );
        this.iframe.contentWindow.addEventListener(
          'unload',
          unloadIframeHandler
        );
      }
    };

    this.iframe.addEventListener('load', attachIframeUnload);
    attachIframeUnload();
  }

  // logic that trying to handle 404s in the PL iframe
  handleIframe404() {
    setTimeout(() => {
      if (
        this.iframe?.contentWindow?.document?.body?.textContent.includes(
          'Cannot GET'
        ) ||
        this.iframe?.contentWindow?.document?.title.includes('Error')
      ) {
        /**
         * Replace the iFrame's inner contents vs literally use a srcdoc.
         * Workaround to avoiding an infinite loop (if using srcdoc) which breaks the ability to
         * hit the back button if you hit a 404
         */
        this.iframe.contentWindow.document.body.innerHTML =
          this.iframe404Fallback;
      }
    }, 100);
  }

  render() {
    const url = urlHandler.getFileName(this.getPatternParam());

    const initialWidth =
      !window.config.defaultInitialViewportWidth &&
      store.getState().app.viewportPx &&
      store.getState().app.viewportPx <= this.clientWidth
        ? store.getState().app.viewportPx + 'px;'
        : '100%';

    return html`
      <div class="pl-c-viewport pl-js-viewport">
        <div class="pl-c-viewport__cover pl-js-viewport-cover" hidden></div>
        <div
          class="pl-c-viewport__iframe-wrapper pl-js-vp-iframe-container"
          style="width: ${initialWidth}"
        >
          <iframe
            class="pl-c-viewport__iframe pl-js-iframe pl-c-body--theme-${this
              .themeMode}"
            src=${ifDefined(url === '' ? undefined : url)}
            srcdoc=${ifDefined(url === '' ? this.iframe404Fallback : undefined)}
            title="Pattern details"
          ></iframe>

          <div class="pl-c-viewport__resizer pl-js-resize-container">
            <div
              class="pl-c-viewport__resizer-handle pl-js-resize-handle"
              @mousedown="${this.handleMouseDown}"
            >
              <svg
                viewBox="0 0 20 20"
                preserveAspectRatio="xMidYMid"
                focusable="false"
                class="pl-c-viewport__resizer-handle-icon"
              >
                <title>Drag to resize Pattern Lab</title>
                <path d="M6 0h2v20H6zM13 0h2v20h-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  handleMouseDown(event) {
    // capture default data
    const self = this;
    self.querySelector('.pl-js-resize-handle').classList.add('is-resizing');
    const origClientX = event.clientX;
    const origViewportWidth = this.iframeContainer.clientWidth;

    this.fullMode = false;

    // show the cover
    this.iframeCover.hidden = false;

    function handleIframeCoverResize(e) {
      const viewportWidth = origViewportWidth + 2 * (e.clientX - origClientX);
      if (
        viewportWidth > minViewportWidth &&
        viewportWidth < maxViewportWidth
      ) {
        self.sizeiframe(viewportWidth, false);
      } else if (viewportWidth > maxViewportWidth) {
        self.sizeiframe(maxViewportWidth, false);
      } else {
        self.sizeiframe(minViewportWidth, false);
      }
    }

    // add the mouse move event and capture data. also update the viewport width
    this.iframeCover.addEventListener('mousemove', handleIframeCoverResize);

    document.body.addEventListener(
      'mouseup',
      function () {
        self.iframeCover.removeEventListener(
          'mousemove',
          handleIframeCoverResize
        );
        self.iframeCover.hidden = true;
        self
          .querySelector('.pl-js-resize-handle')
          .classList.remove('is-resizing');
      },
      {
        once: true,
      }
    );

    return false;
  }

  /**
   * updates the nav after the iframed page tells the iframe it's done loading
   *
   * @param {MessageEvent} e A message received by a target object.
   */
  receiveIframeMessage(e) {
    const data = iframeMsgDataExtraction(e);

    // try to auto-correct for currentPattern data that doesn't always match with url
    // workaround for certain pages (especially view all pages) not always matching up internally with the expected current pattern key
    if (data.event !== undefined && data.event === 'patternLab.pageLoad') {
      try {
        const currentPattern =
          this.sanitizePatternName(data.patternpartial) ||
          this.getPatternParam();

        document.title = 'Pattern Lab - ' + currentPattern;

        const addressReplacement =
          window.location.protocol === 'file:'
            ? null
            : window.location.protocol +
              '//' +
              window.location.host +
              (window.config.noIndexHtmlremoval
                ? window.location.pathname
                : window.location.pathname.replace('index.html', '')) +
              '?p=' +
              currentPattern;

        window.history.replaceState(
          {
            currentPattern: currentPattern,
          },
          null,
          addressReplacement
        );

        const currentUrl = urlHandler.getFileName(currentPattern);
        if (currentUrl) {
          store.dispatch(updateCurrentUrl(currentUrl));
        }
        store.dispatch(updateCurrentPattern(currentPattern));
      } catch (error) {
        console.log(error);
      }
    }
  }
}

export { IFrame };
