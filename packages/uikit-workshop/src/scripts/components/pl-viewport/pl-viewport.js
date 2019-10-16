/* eslint-disable no-unused-vars, no-param-reassign */
import { define, props } from 'skatejs';
import { h } from 'preact';
import URLSearchParams from '@ungap/url-search-params'; // URLSearchParams poly for older browsers
import render from 'preact-render-to-string';

import { store } from '../../store.js'; // connect to redux
import { updateCurrentPattern, updateCurrentUrl } from '../../actions/app.js'; // redux actions
import { updateViewportPx, updateViewportEm } from '../../actions/app.js'; // redux actions needed
import { minViewportWidth, maxViewportWidth } from '../../utils';
import { BaseComponent } from '../base-component.js';
import { urlHandler, patternName } from '../../utils';

import styles from '../../../sass/pattern-lab--iframe-loader.scss';

let trackingPageChange = false;

@define
class IFrame extends BaseComponent {
  static is = 'pl-iframe';

  constructor(self) {
    self = super(self);
    self.useShadow = false;
    self.usingBrowserNav = true;
    self._hasInitiallyRendered = false;
    self.fullMode = true;
    self.viewportResizeHandleWidth = 14; //Width of the viewport drag-to-resize handle
    self.bodySize =
      window.config.ishFontSize !== undefined
        ? parseInt(window.config.ishFontSize, 10)
        : parseInt(
            window
              .getComputedStyle(document.body, null)
              .getPropertyValue('font-size'),
            10
          ); //Body size of the document
    self.handlePageChange = self.handlePageChange.bind(self);
    self.handlePageLoad = self.handlePageLoad.bind(self);
    // self.receiveIframeMessage = self.receiveIframeMessage.bind(self);
    self.handleResize = self.handleResize.bind(self);
    self.handleMouseDown = self.handleMouseDown.bind(self);
    self.handleIframeLoaded = self.handleIframeLoaded.bind(self);
    //set up the default for the
    self.baseIframePath =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname.replace('index.html', '');
    self.defaultIframePath = self.baseIframePath + '?p=components-overview';
    return self;
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

  connected() {
    const self = this;

    if (trackingPageChange === false) {
      trackingPageChange = true;
      document.addEventListener('patternPartial', self.handlePageLoad);
      window.addEventListener('popstate', self.handlePageChange);
    }

    const state = store.getState();
    this.themeMode = state.app.themeMode || 'dark';
    this.isViewallPage = state.app.isViewallPage || false;
    this.currentPattern = state.app.currentPattern || '';

    if (state.app.viewportPx) {
      this.sizeiframe(state.app.viewportPx, false);
    }

    // window.addEventListener('message', this.receiveIframeMessage, false);
    window.addEventListener('resize', this.handleResize);
    this.handleOrientationChange();
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
        this.iframeContainer.classList.add('vp-animate');
        this.iframe.classList.add('vp-animate');
      }

      if (size > maxViewportWidth) {
        //If the entered size is larger than the max allowed viewport size, cap value at max vp size
        theSize = maxViewportWidth;
      } else if (size < minViewportWidth) {
        //If the entered size is less than the minimum allowed viewport size, cap value at min vp size
        theSize = minViewportWidth;
      } else {
        theSize = size;
      }

      // resize viewport wrapper to desired size + size of drag resize handler
      // this.iframeContainer.style.width = theSize + this.viewportResizeHandleWidth + 'px';
      this.iframeContainer.style.width =
        theSize - this.viewportResizeHandleWidth + 'px';
      // this.iframe.style.width = theSize + 'px'; // resize viewport to desired size

      // auto-remove transition classes if not the animate param isn't set to true
      setTimeout(function() {
        if (animate === true) {
          self.iframeContainer.classList.remove('vp-animate');
          self.iframe.classList.remove('vp-animate');
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
    this.updateSizeReading(this.iframe.clientWidth);
  }

  // Update Pixel and Em inputs
  // 'size' is the input number
  // 'unit' is the type of unit: either px or em. Default is px.
  // Accepted values are 'px' and 'em'
  // 'target' is what inputs to update. Defaults to both
  updateSizeReading(size, unit, target) {
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

  rendered() {
    super.rendered && super.rendered();
    this.iframe = this.querySelector('.pl-js-iframe');
    this.iframeContainer = this.querySelector('.pl-js-vp-iframe-container');
    this.iframeCover = this.querySelector('.pl-js-viewport-cover');
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

    const IframeInner = () => {
      return (
        <div className={`pl-c-body--theme-${this.themeMode}`}>
          <style>{styles[0][1]}</style>
          <div className={'pl-c-loader'}>
            <div className={'pl-c-loader__content'}>
              <div className={'pl-c-loader__message'}>Loading Pattern Lab</div>
              <div className={'pl-c-loader__spinner'}>
                <svg className={'pl-c-loader-svg'} viewBox={'0 0 268 255'}>
                  <circle
                    className={'pl-c-loader-svg__outer-circle'}
                    cx={'134.2'}
                    cy={'127.6'}
                    r={'115.1'}
                  />
                  <circle
                    className={'pl-c-loader-svg__inner-circle'}
                    cx={'134.2'}
                    cy={'127.6'}
                    r={'66.3'}
                  />
                  <path
                    className={'pl-c-loader-svg__electron'}
                    d={
                      'M253,56.3c0,15.6-12.6,28.2-28.2,28.2s-28.2-12.6-28.2-28.2s12.6-28.2,28.2-28.2C240.3,28.1,253,40.7,253,56.3z'
                    }
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const initialWidth =
      store.getState().app.viewportPx &&
      store.getState().app.viewportPx <= this.clientWidth
        ? store.getState().app.viewportPx + 'px;'
        : '100%';

    return (
      <div class="pl-c-viewport pl-js-viewport">
        <div class="pl-c-viewport__cover pl-js-viewport-cover" />
        <div
          class="pl-c-viewport__iframe-wrapper pl-js-vp-iframe-container"
          style={`width: ${initialWidth}`}
        >
          <iframe
            className={`pl-c-viewport__iframe pl-js-iframe pl-c-body--theme-${this.themeMode}`}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            // srcdoc={render(<IframeInner />)}
            src={url}
          />
          {
            <div class="pl-c-viewport__resizer pl-js-resize-container">
              <div
                class="pl-c-viewport__resizer-handle pl-js-resize-handle"
                onMouseDown={e => this.handleMouseDown(e)}
              >
                <svg
                  viewBox="0 0 20 20"
                  preserveAspectRatio="xMidYMid"
                  focusable="false"
                  style="width: 30px; fill: currentColor; position: absolute; top: 50%; transform: translate3d(0, -50%, 0); z-index: 100;"
                >
                  <title>Drag to resize Pattern Lab</title>
                  <path d="M6 0h2v20H6zM13 0h2v20h-2z" />
                </svg>
              </div>
            </div>
          }
        </div>
      </div>
    );
  }

  handleMouseDown(event) {
    // capture default data
    const self = this;
    self.querySelector('.pl-js-resize-handle').classList.add('is-resizing');
    const origClientX = event.clientX;
    const origViewportWidth = this.iframe.clientWidth;

    this.fullMode = false;

    // show the cover
    this.iframeCover.style.display = 'block';

    function handleIframeCoverResize(e) {
      const viewportWidth = origViewportWidth + 2 * (e.clientX - origClientX);
      if (viewportWidth > minViewportWidth) {
        self.sizeiframe(viewportWidth, false);
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

  // receiveIframeMessage(event) {
  //   const self = this;

  //   // does the origin sending the message match the current host? if not dev/null the request
  //   if (
  //     window.location.protocol !== 'file:' &&
  //     event.origin !== window.location.protocol + '//' + window.location.host
  //   ) {
  //     return;
  //   }

  //   let data = {};
  //   try {
  //     data =
  //       typeof event.data !== 'string' ? event.data : JSON.parse(event.data);
  //   } catch (e) {
  //     // @todo: how do we want to handle exceptions here?
  //   }

  //   if (data.event !== undefined && data.event === 'patternLab.pageLoad') {
  //     try {
  //       // add a slight delay to make sure the URL params have had a chance to update first before updating the current url
  //       // if(self.usingBrowserNav === true){
  //       //   self.handleUpdatingCurrentPattern(event.data.details.patternData.patternPartial, true);
  //       // }

  //       // check and share the initial iframe width once ready
  //     } catch(error){
  //       console.log(error);
  //     }
  //   }
  // }
}

export { IFrame };
