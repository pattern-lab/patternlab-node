/* eslint-disable no-unused-vars */
import { h } from 'preact';
import { define, props } from 'skatejs';
import { BaseComponent } from '../../components/base-component.js';
import { store } from '../../store.js'; // connect to redux

import { Tooltip } from '../../components/pl-tooltip/pl-tooltip';
import VisuallyHidden from '@reach/visually-hidden';

import { minViewportWidth, maxViewportWidth, getRandom } from '../../utils';

import styles from './pl-viewport-size-list.scss?external';

// @todo: re-add keyboard shortcuts to these
@define
class ViewportSizes extends BaseComponent {
  static is = 'pl-viewport-sizes';

  _stateChanged(state) {
    this.triggerUpdate();
  }

  constructor(self) {
    self = super(self);
    self.resizeViewport = self.resizeViewport.bind(self);
    self.useShadow = false;
    return self;
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    styles.use();
    const state = store.getState();
    const { ishControlsHide } = window.ishControls;
    this.ishControlsHide = ishControlsHide;
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    styles.unuse();
  }

  shouldUpdate(prevProps, prevState) {
    return true;
  }

  resizeViewport(size) {
    if (this.iframe) {
      switch (size) {
        case 'small':
          this.iframe.fullMode = false;
          this.iframe.sizeiframe(
            getRandom(
              minViewportWidth,
              window.config.ishViewportRange !== undefined
                ? parseInt(window.config.ishViewportRange.s[1], 10)
                : 500
            ),
            true
          );
          break;
        case 'medium':
          this.iframe.fullMode = false;
          this.iframe.sizeiframe(
            getRandom(
              window.config.ishViewportRange !== undefined
                ? parseInt(window.config.ishViewportRange.m[0], 10)
                : 500,
              window.config.ishViewportRange !== undefined
                ? parseInt(window.config.ishViewportRange.m[1], 10)
                : 800
            ),
            true
          );
          break;
        case 'large':
          this.iframe.fullMode = false;
          this.iframe.sizeiframe(
            getRandom(
              window.config.ishViewportRange !== undefined
                ? parseInt(window.config.ishViewportRange.l[0], 10)
                : 800,
              maxViewportWidth
            ),
            true
          );
          break;
        case 'full':
          this.iframe.fullMode = true;
          this.iframe.sizeiframe(maxViewportWidth, true);
          break;
      }
    }
  }

  /**
   * Get a random number between minViewportWidth and maxViewportWidth
   */
  getRangeRandomNumber() {
    return getRandom(
      minViewportWidth,
      // Do not evaluate a number higher than the clientWidth of the Iframe
      // to prevent having max size multiple times
      maxViewportWidth > this.iframe.clientWidth
        ? this.iframe.clientWidth
        : maxViewportWidth
    );
  }

  /**
   * Start the disco mode, which means in a specific interval resize
   * the iframe random between minViewportWidth and maxViewportWidth
   */
  startDisco() {
    this.discoMode = true;
    this.discoId = setInterval(this.disco.bind(this), 1000);
  }

  /**
   * Stop the disco mode
   */
  killDisco() {
    this.discoMode = false;
    clearInterval(this.discoId);
    this.discoID = null;
  }

  /**
   * Action to resize the Iframe in disco mode
   */
  disco() {
    this.iframe.sizeiframe(this.getRangeRandomNumber(), true);
  }

  /**
   * Start the Hay! mode, which means the iframe is growing slowly
   * from minViewportWidth to maxViewportWidth
   */
  startHay() {
    this.hayMode = true;
    this.hayId = setInterval(this.hay.bind(this), 100);
  }

  /**
   * Stop the Hay! Mode
   */
  killHay() {
    this.hayMode = false;
    clearInterval(this.hayId);
    this.hayId = null;
  }

  /**
   * Action to resize the Iframe in Hay! mode
   */
  hay() {
    this.iframe.sizeiframe(store.getState().app.viewportPx + 1, true);
  }

  /**
   * Litte workaround for Firefox Bug.
   *
   * On QWERTZ keyboards the e.altKey and e.ctrlKey will
   * not be set if you click on a key that has a specific
   * secondary or third char at ALT + ...
   *
   * @param {KeyboardEvent} e the keyevent
   */
  handleKeyDownEvent(e) {
    if (e.key === 'Control') {
      this.controlIsPressed = true;
    }
    if (e.key === 'Alt') {
      this.altIsPressed = true;
    }
  }

  /**
   * https://patternlab.io/docs/advanced-keyboard-shortcuts.html
   *
   * Why use these specific key combinations?
   * Works on QUERTZ, QUERTY and AZERTY keyboard and they are no
   * reserved browser functionality key combinations.
   *
   * QUERTY https://en.wikipedia.org/wiki/QWERTY
   * QUERTZ https://en.wikipedia.org/wiki/QWERTZ
   * AZERTY https://en.wikipedia.org/wiki/AZERTY
   *
   * Chromium
   * https://support.google.com/chrome/answer/157179?hl=en
   *
   * Firefox
   * https://support.mozilla.org/en-US/kb/keyboard-shortcuts-perform-firefox-tasks-quickly
   *
   * @param {KeyboardEvent} e the keyevent

   */
  handleKeyCombination(e) {
    const ctrlKey = this.controlIsPressed;
    const altKey = this.altIsPressed;

    if (ctrlKey && altKey && (e.code === 'Digit0' || e.code === 'Numpad0')) {
      this.resizeViewport(this.sizes.ZERO);
    } else if (ctrlKey && altKey && e.code === 'KeyS') {
      this.resizeViewport(this.sizes.SMALL);
    } else if (ctrlKey && altKey && e.code === 'KeyM') {
      this.resizeViewport(this.sizes.MEDIUM);
    } else if (ctrlKey && altKey && e.code === 'KeyL') {
      this.resizeViewport(this.sizes.LARGE);
    } else if (ctrlKey && altKey && e.code === 'KeyF') {
      this.resizeViewport(this.sizes.FULL);
    } else if (ctrlKey && altKey && e.code === 'KeyR') {
      this.resizeViewport(this.sizes.RANDOM);
    } else if (ctrlKey && altKey && e.code === 'KeyD') {
      this.resizeViewport(this.sizes.DISCO);
    } else if (ctrlKey && altKey && e.code === 'KeyH') {
      this.resizeViewport(this.sizes.HAY);
    }

    if (e.key === 'Control') {
      this.controlIsPressed = false;
    }
    if (e.key === 'Alt') {
      this.altIsPressed = false;
    }
  }

  /**
   * Interpret and handle the received message input
   *
   * @param {MessageEvent} e A message received by a target object.
   */
  receiveIframeMessage(e) {
    const data = iframeMsgDataExtraction(e);

    if (data.event && data.event === 'patternLab.iframeKeyDownEvent') {
      this.handleKeyDownEvent(data);
    } else if (data.event && data.event === 'patternLab.iframeKeyUpEvent') {
      this.handleKeyCombination(data);
    }
  }

  rendered() {
    this.iframe = document.querySelector('pl-iframe');
    this.iframeElem = document.querySelector('pl-iframe iframe');
  }

  render() {
    return (
      <ul class="pl-c-size-list">
        {!this.ishControlsHide.s && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Small"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-s',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('small')}
                  dangerouslySetInnerHTML={{
                    __html: `
                      <span class="is-vishidden">Resize viewport to small</span>
                      <pl-icon name="phone"></pl-icon>
                    `,
                  }}
                />
              )}
            </Tooltip>
          </li>
        )}
        {!this.ishControlsHide.m && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Medium"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-m',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('medium')}
                  dangerouslySetInnerHTML={{
                    __html: `
                      <span class="is-vishidden">Resize viewport to medium</span>
                      <pl-icon name="tablet"></pl-icon>
                    `,
                  }}
                />
              )}
            </Tooltip>
          </li>
        )}
        {!this.ishControlsHide.l && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Large"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-l',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('large')}
                  dangerouslySetInnerHTML={{
                    __html: `
                      <span class="is-vishidden">Resize viewport to large</span>
                      <pl-icon name="laptop"></pl-icon>
                    `,
                  }}
                />
              )}
            </Tooltip>
          </li>
        )}
        {!this.ishControlsHide.full && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Full"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-full',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('full')}
                  dangerouslySetInnerHTML={{
                    __html: `
                      <span class="is-vishidden">Resize viewport to full</span>
                      <pl-icon name="desktop"></pl-icon>
                    `,
                  }}
                />
              )}
            </Tooltip>
          </li>
        )}
        {/* {!this.ishControlsHide.random && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Random"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-random',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('random')}
                >
                  <VisuallyHidden>Resize viewport to random</VisuallyHidden>
                  <RandomIcon
                    width={24}
                    height={24}
                    fill="currentColor"
                    stroke="currentColor"
                    viewBox="0 0 28 28"
                  />
                </button>
              )}
            </Tooltip>
          </li>
        )} */}
        {/* {!this.ishControlsHide.disco && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Disco"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-disco',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('disco')}
                >
                  <VisuallyHidden>
                    Resize viewport using disco mode!
                  </VisuallyHidden>
                  <DiscoIcon
                    width={24}
                    height={24}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  />
                </button>
              )}
            </Tooltip>
          </li>
        )} */}
        {!this.ishControlsHide.hay && (
          <li class="pl-c-size-list__item">
            <button class="pl-c-size-list__action mode-link" id="pl-size-hay">
              Hay!
            </button>
          </li>
        )}
      </ul>
    );
  }
}
