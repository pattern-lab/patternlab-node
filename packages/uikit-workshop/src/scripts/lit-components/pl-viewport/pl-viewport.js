/* eslint-disable no-unused-vars, no-param-reassign */
import URLSearchParams from '@ungap/url-search-params'; // URLSearchParams poly for older browsers
import { store } from '../../store.js'; // connect to redux
import { updateCurrentPattern, updateCurrentUrl } from '../../actions/app.js'; // redux actions
import { updateViewportPx, updateViewportEm } from '../../actions/app.js'; // redux actions needed
import { minViewportWidth, maxViewportWidth } from '../../utils';
import { urlHandler, patternName } from '../../utils';

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
    this.handleIframeLoaded = this.handleIframeLoaded.bind(this);
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    iframeLoaderStyles.use();
    styles.use();

    if (trackingPageChange === false) {
      trackingPageChange = true;
      document.addEventListener('patternPartial', this.handlePageLoad);
      window.addEventListener('popstate', this.handlePageChange);
    }

    const state = store.getState();
    this.themeMode = state.app.themeMode || 'dark';
    this.isViewallPage = state.app.isViewallPage || false;
    this.currentPattern = state.app.currentPattern || '';

    if (state.app.viewportPx) {
      this.sizeiframe(state.app.viewportPx, false);
    }

    window.addEventListener('message', this.receiveIframeMessage, false);
    window.addEventListener('resize', this.handleResize);
    this.handleOrientationChange();

    this.usingBrowserNav = true;
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

  // update the currently active nav + add / update the page's query string
  handlePageLoad(e) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const patternParam = urlParams.get('p');

    const currentPattern =
      e.detail.pattern || window.config.defaultPattern || 'all';

    if (currentPattern) {
      document.title = 'Pattern Lab - ' + currentPattern;

      const addressReplacement =
        window.location.protocol === 'file:'
          ? null
          : window.location.protocol +
            '//' +
            window.location.host +
            window.location.pathname.replace('index.html', '') +
            '?p=' +
            currentPattern;

      // first time hitting a PL page -- no query string on the current page
      if (patternParam === null) {
        window.history.replaceState(
          {
            currentPattern: currentPattern,
          },
          null,
          addressReplacement
        );
      } else {
        window.history.replaceState(
          {
            currentPattern: currentPattern,
          },
          null,
          addressReplacement
        );
      }

      const currentUrl = urlHandler.getFileName(e.detail.pattern);

      // don't update state or upddate the URL for non-existent patterns
      if (currentUrl) {
        store.dispatch(updateCurrentPattern(e.detail.pattern));
        store.dispatch(updateCurrentUrl(currentUrl));
      }
    }
  }

  // navigate to the new PL page (based on the query string) when the page's pop state changes
  handlePageChange(e) {
    var queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let patternParam = urlParams.get('p');

    if (patternParam) {
      this.navigateTo(patternParam);
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
      } else if (size < minViewportWidth) {
        //If the entered size is less than the minimum allowed viewport size, cap value at min vp size
        theSize = minViewportWidth;
      } else {
        //If the entered size is larger than the max allowed viewport size, cap value at max vp size
        theSize = maxViewportWidth;
      }

      if (theSize > this.clientWidth) {
        theSize = this.clientWidth;
      }

      // resize viewport wrapper to desired size + size of drag resize handler
      // this.iframeContainer.style.width = theSize + this.viewportResizeHandleWidth + 'px';
      this.iframeContainer.style.width = theSize + 'px';
      // this.iframe.style.width = theSize + 'px'; // resize viewport to desired size

      // auto-remove transition classes if not the animate param isn't set to true
      setTimeout(function() {
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
        function() {
          if (window.orientation !== this.origOrientation) {
            let newWidth = window.innerWidth;
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
  }

  navigateTo(pattern = patternName, rewrite = false) {
    this.usingBrowserNav = false;
    const patternPath = urlHandler.getFileName(pattern);

    document.title = 'Pattern Lab - ' + pattern;

    this.iFramePath =
      patternPath !== ''
        ? this.baseIframePath + patternPath + '?' + Date.now()
        : this.defaultIframePath;

    if (rewrite === true) {
      window.history.replaceState(
        {
          pattern,
        },
        'Pattern Lab - ' + pattern,
        null
      );
      urlHandler.skipBack = false;
    }
    document
      .querySelector('.pl-js-iframe')
      .contentWindow.location.replace(this.iFramePath);
    this.handleUpdatingCurrentPattern(pattern, false);
  }

  handleUpdatingCurrentPattern(currentPattern, usingBrowserNav = true) {
    const currentUrl = urlHandler.getFileName(currentPattern);
    const previousPattern = this.currentPattern;

    if (
      window.history.state === undefined ||
      window.history.state === null ||
      window.history.state.currentPattern !== currentPattern
    ) {
      const data = {
        currentPattern,
      };

      // add to the history
      const addressReplacement =
        window.location.protocol === 'file:'
          ? null
          : window.location.protocol +
            '//' +
            window.location.host +
            window.location.pathname.replace('index.html', '') +
            '?p=' +
            currentPattern;

      if (this.currentPattern !== currentPattern) {
        if (window.history.pushState !== undefined) {
          window.history.pushState(data, null, addressReplacement);
        }

        urlHandler.pushPattern(currentPattern, currentUrl);

        this.currentPattern = currentPattern;
      }

      if (usingBrowserNav) {
        this.usingBrowserNav = true;
      }
    }

    store.dispatch(updateCurrentPattern(currentPattern));
    store.dispatch(updateCurrentUrl(currentUrl));
  }

  firstUpdated() {
    this.iframe = this.querySelector('.pl-js-iframe');
    this.iframeContainer = this.querySelector('.pl-js-vp-iframe-container');
    this.iframeCover = this.querySelector('.pl-js-viewport-cover');
    this.updateSizeReading(this.iframeContainer.clientWidth);
  }

  handleIframeLoaded() {
    const self = this;
    if (!this._hasInitiallyRendered) {
      this._hasInitiallyRendered = true;
      this.navigateTo(patternName, true);
    }
  }

  render() {
    // use either the page's query string or the patternPartial data to auto-update the URL
    var queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let patternParam = urlParams.get('p');

    if (!patternParam) {
      if (window.patternData) {
        patternParam = window.patternData.patternPartial;
      } else {
        patternParam =
          window.config && window.config.defaultPattern
            ? window.config.defaultPattern
            : 'all';
      }
    }

    const url = urlHandler.getFileName(patternParam);

    const initialWidth =
      store.getState().app.viewportPx &&
      store.getState().app.viewportPx <= this.clientWidth
        ? store.getState().app.viewportPx + 'px;'
        : '100%';

    return html`
      <div class="pl-c-viewport pl-js-viewport">
        <div class="pl-c-viewport__cover pl-js-viewport-cover"></div>
        <div
          class="pl-c-viewport__iframe-wrapper pl-js-vp-iframe-container"
          style="width: ${initialWidth}"
        >
          <iframe
            class="pl-c-viewport__iframe pl-js-iframe pl-c-body--theme-${this
              .themeMode}"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            src="${url}"
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
    this.iframeCover.style.display = 'block';

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

    document.body.addEventListener('mouseup', function() {
      self.iframeCover.removeEventListener(
        'mousemove',
        handleIframeCoverResize
      );
      self.iframeCover.style.display = 'none';
      self
        .querySelector('.pl-js-resize-handle')
        .classList.remove('is-resizing');
    });

    return false;
  }

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

    // try to auto-correct for currentPattern data that doesn't always match with url
    // workaround for certain pages (especially view all pages) not always matching up internally with the expected current pattern key
    if (data.event !== undefined && data.event === 'patternLab.pageLoad') {
      try {
        if (event.data.patternpartial) {
          let currentPattern = event.data.patternpartial;
          if (
            !document.querySelector(`[data-patternpartial="${currentPattern}"]`)
          ) {
            currentPattern = currentPattern.replace(/[-][0-9][0-9]/g, '');
          }
          const currentUrl = urlHandler.getFileName(currentPattern);

          if (currentPattern !== null) {
            document.title = 'Pattern Lab - ' + currentPattern;

            const addressReplacement =
              window.location.protocol === 'file:'
                ? null
                : window.location.protocol +
                  '//' +
                  window.location.host +
                  window.location.pathname.replace('index.html', '') +
                  '?p=' +
                  currentPattern;

            window.history.replaceState(
              {
                currentPattern: currentPattern,
              },
              null,
              addressReplacement
            );

            store.dispatch(updateCurrentPattern(currentPattern));

            // don't update state or upddate the URL for non-existent patterns
            if (currentUrl) {
              store.dispatch(updateCurrentUrl(currentUrl));
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

export { IFrame };
