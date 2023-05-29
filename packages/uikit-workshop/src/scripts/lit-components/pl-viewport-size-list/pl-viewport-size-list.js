/* eslint-disable no-unused-vars */
import { h } from 'preact';
import { define, props } from 'skatejs';
import { BaseComponent } from '../../components/base-component.js';
import { store } from '../../store.js'; // connect to redux

import {
  minViewportWidth,
  maxViewportWidth,
  getRandom,
  iframeMsgDataExtraction,
} from '../../utils';

import styles from './pl-viewport-size-list.scss?external';

@define
class ViewportSizes extends BaseComponent {
  static is = 'pl-viewport-sizes';

  sizes = Object.freeze({
    ZERO: 'zero',
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    FULL: 'full',
    RANDOM: 'random',
    DISCO: 'disco',
    HAY: 'hay',
  });

  discomode = false;
  doscoId = null;
  hayMode = false;
  hayId = null;
  layoutMode = null;
  tooltipPos = null;

  controlIsPressed = false;
  altIsPressed = false;

  _stateChanged(state) {
    this.triggerUpdate();

    if (this.layoutMode !== state.app.layoutMode) {
      this.layoutMode = state.app.layoutMode || 'vertical';
      this.tooltipPos = this.layoutMode === 'horizontal' ? 'bottom' : 'top';
    }
  }

  constructor() {
    super();
    this.resizeViewport = this.resizeViewport.bind(this);
    this.useShadow = false;
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    styles.use();
    const state = store.getState();
    const { ishControlsHide } = window?.ishControls;
    this.ishControlsHide = ishControlsHide;

    // Remove EventListener or they will be added multiple times when reloading in serve mode
    document.removeEventListener('keydown', this.handleKeyDownEvent);
    document.removeEventListener('keyup', this.handleKeyCombination);
    document.addEventListener('keydown', this.handleKeyDownEvent.bind(this));
    document.addEventListener('keyup', this.handleKeyCombination.bind(this));
    this.receiveIframeMessage = this.receiveIframeMessage.bind(this);

    window.removeEventListener('message', this.receiveIframeMessage);
    window.addEventListener('message', this.receiveIframeMessage, false);
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
      this.killDisco();
      this.killHay();

      switch (size) {
        case this.sizes.ZERO:
          this.iframe.fullMode = false;
          this.iframe.sizeiframe(0, true);
        case this.sizes.SMALL:
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
        case this.sizes.MEDIUM:
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
        case this.sizes.LARGE:
          this.iframe.fullMode = false;
          this.iframe.sizeiframe(
            getRandom(
              window.config.ishViewportRange !== undefined
                ? parseInt(window.config.ishViewportRange.l[0], 10)
                : 800,
              window.config.ishViewportRange !== undefined
                ? parseInt(window.config.ishViewportRange.l[1], 10)
                : 1000
            ),
            true
          );
          break;
        case this.sizes.FULL:
          this.iframe.fullMode = true;
          this.iframe.sizeiframe(maxViewportWidth, true);
          break;
        case this.sizes.RANDOM:
          this.fullMode = false;
          this.iframe.sizeiframe(this.getRangeRandomNumber(), true);
          break;
        case this.sizes.DISCO:
          this.fullMode = false;
          this.startDisco();
          break;
        case this.sizes.HAY:
          this.fullMode = false;
          this.iframe.sizeiframe(minViewportWidth, true);
          this.startHay();
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
        {!this.ishControlsHide?.s && (
          <li class="pl-c-size-list__item">
            <pl-tooltip message="Small" position={this.tooltipPos}>
              <button
                slot="default"
                class="pl-c-size-list__action"
                onClick={() => this.resizeViewport(this.sizes.SMALL)}
                dangerouslySetInnerHTML={{
                  __html: `
                      <span class="is-vishidden">Resize viewport to small</span>
                      <pl-icon name="phone" aria-hidden="true"></pl-icon>
                    `,
                }}
                type="button"
              />
            </pl-tooltip>
          </li>
        )}
        {!this.ishControlsHide?.m && (
          <li class="pl-c-size-list__item">
            <pl-tooltip message="Medium" position={this.tooltipPos}>
              <button
                slot="default"
                class="pl-c-size-list__action"
                onClick={() => this.resizeViewport(this.sizes.MEDIUM)}
                dangerouslySetInnerHTML={{
                  __html: `
                      <span class="is-vishidden">Resize viewport to medium</span>
                      <pl-icon name="tablet" aria-hidden="true"></pl-icon>
                    `,
                }}
                type="button"
              />
            </pl-tooltip>
          </li>
        )}
        {!this.ishControlsHide?.l && (
          <li class="pl-c-size-list__item">
            <pl-tooltip message="Large" position={this.tooltipPos}>
              <button
                slot="default"
                class="pl-c-size-list__action"
                onClick={() => this.resizeViewport(this.sizes.LARGE)}
                dangerouslySetInnerHTML={{
                  __html: `
                      <span class="is-vishidden">Resize viewport to large</span>
                      <pl-icon name="laptop" aria-hidden="true"></pl-icon>
                    `,
                }}
                type="button"
              />
            </pl-tooltip>
          </li>
        )}
        {!this.ishControlsHide?.full && (
          <li class="pl-c-size-list__item">
            <pl-tooltip message="Full" position={this.tooltipPos}>
              <button
                slot="default"
                class="pl-c-size-list__action"
                onClick={() => this.resizeViewport(this.sizes.FULL)}
                dangerouslySetInnerHTML={{
                  __html: `
                      <span class="is-vishidden">Resize viewport to full</span>
                      <pl-icon name="desktop" aria-hidden="true"></pl-icon>
                    `,
                }}
                type="button"
              />
            </pl-tooltip>
          </li>
        )}
        {!this.ishControlsHide?.random && (
          <li class="pl-c-size-list__item">
            <pl-tooltip message="Random" position={this.tooltipPos}>
              <button
                slot="default"
                class="pl-c-size-list__action"
                onClick={() => this.resizeViewport(this.sizes.RANDOM)}
                dangerouslySetInnerHTML={{
                  __html: `
                      <span class="is-vishidden">Resize viewport to random</span>
                      <pl-icon name="random" aria-hidden="true"></pl-icon>
                    `,
                }}
                type="button"
              />
            </pl-tooltip>
          </li>
        )}
        {!this.ishControlsHide?.disco && (
          <li class="pl-c-size-list__item">
            <pl-tooltip message="Disco" position={this.tooltipPos}>
              <button
                slot="default"
                class="pl-c-size-list__action"
                onClick={() => this.resizeViewport(this.sizes.DISCO)}
                dangerouslySetInnerHTML={{
                  __html: `
                      <span class="is-vishidden">Resize viewport using disco mode!</span>
                      <pl-icon name="disco-ball" aria-hidden="true"></pl-icon>
                    `,
                }}
                type="button"
              />
            </pl-tooltip>
          </li>
        )}
        {!this.ishControlsHide?.hay && (
          <li class="pl-c-size-list__item">
            <pl-tooltip message="Hay" position={this.tooltipPos}>
              <button
                slot="default"
                class="pl-c-size-list__action"
                onClick={() => this.resizeViewport(this.sizes.HAY)}
                dangerouslySetInnerHTML={{
                  __html: `
                     <span class="is-vishidden">Resize viewport using hay mode!</span>
                     <pl-icon name="hay" aria-hidden="true"></pl-icon>
                   `,
                }}
                type="button"
              />
            </pl-tooltip>
          </li>
        )}
      </ul>
    );
  }
}
