/* eslint-disable no-unused-vars */
import { h } from 'preact';

import { BaseLitComponent } from '../../components/base-component';
import { html, customElement } from 'lit-element';
import styles from './pl-viewport-size.scss?external';
import { store } from '../../store.js'; // connect to redux

const nRegex = /\D+/g;
const fpRegex = /[^0-9\.]+/g;

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

@customElement('pl-viewport-size')
class ViewportSize extends BaseLitComponent {
  static get properties() {
    return {
      px: String,
      em: String,
    };
  }

  constructor() {
    super();
    this.state = { inputPixelValue: 0, inputEmValue: 0 };
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    styles.use();
    const state = store.getState();
    this.setPxEm(state);
    this.iframe = document.querySelector('pl-iframe');
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    styles.unuse();
  }

  _stateChanged(state) {
    this.setPxEm(state);
  }

  setPxEm(state) {
    if (state.app.viewportPx !== this.px) {
      this.px = round(state.app.viewportPx, 0);
      this.setState({ inputPixelValue: this.px }, () => {});
    }

    if (round(state.app.viewportEm, 1) !== this.em) {
      this.em = round(state.app.viewportEm, 1);
      this.setState({ inputEmValue: this.em }, () => {});
    }
  }

  firstUpdated() {
    this.viewport = document.querySelector('pl-viewport');
  }

  updated() {
    if (this.viewport && this.viewport.bodySize) {
      this.em = Math.floor(this.px * this.bodySize);
    }
  }

  handlePixelUpdateUp(e) {
    this.setState(
      { inputPixelValue: e.target.value.replace(nRegex, '') },
      () => {}
    );
  }

  handlePixelUpdatePress(e) {
    if (e.key.match(nRegex)) {
      // Prevent inserting letters or symbols
      e.preventDefault();
    }
  }

  handlePixelUpdateDown(e) {
    if (e.key === 'Enter') {
      event.preventDefault();
      this.iframe.sizeiframe(this.state.inputPixelValue, true);
    } else if (e.key === 'ArrowUp') {
      this.setState(
        {
          inputPixelValue:
            Number(e.target.value.replace(nRegex, '')) + (e.shiftKey ? 10 : 1),
        },
        () => {}
      );
      this.iframe.sizeiframe(this.state.inputPixelValue, true);
    } else if (e.key === 'ArrowDown') {
      this.setState(
        {
          inputPixelValue:
            Number(e.target.value.replace(nRegex, '')) - (e.shiftKey ? 10 : 1),
        },
        () => {}
      );
      this.iframe.sizeiframe(this.state.inputPixelValue, true);
    }
  }

  handlePixelBlur(e) {
    this.setState({ inputPixelValue: this.px }, () => {});
    e.target.value = this.state.inputPixelValue;
  }

  handleEmUpdateUp(e) {
    this.setState(
      { inputEmValue: e.target.value.replace(fpRegex, '') },
      () => {}
    );
  }

  handleEmUpdatePress(e) {
    if (e.key.match(fpRegex)) {
      // Prevent inserting letters or symbols
      e.preventDefault();
    }
  }

  handleEmUpdateDown(e) {
    if (e.key === 'Enter') {
      event.preventDefault();
      this.iframe.sizeiframe(this.toPixelValue(), true);
    } else if (e.key === 'ArrowUp') {
      this.setState(
        {
          inputEmValue: round(
            Number(e.target.value.replace(fpRegex, '')) +
              (e.shiftKey ? 0.5 : 0.1),
            1
          ),
        },
        () => {}
      );
      this.iframe.sizeiframe(this.toPixelValue(), true);
    } else if (e.key === 'ArrowDown') {
      this.setState(
        {
          inputEmValue: round(
            Number(e.target.value.replace(fpRegex, '')) -
              (e.shiftKey ? 0.5 : 0.1),
            1
          ),
        },
        () => {}
      );
      this.iframe.sizeiframe(this.toPixelValue(), true);
    }
  }

  handleEmBlur(e) {
    this.setState({ inputEmValue: this.em }, () => {});
    e.target.value = this.state.inputEmValue;
  }

  toPixelValue() {
    return Math.floor(this.state.inputEmValue * this.iframe.bodySize);
  }

  render() {
    if (!window.__PRERENDER_INJECTED) {
      return html`
        <form class="pl-c-viewport-size" @submit=${this.handleSubmit}>
          <label
            for="pl-viewport-pixel-width"
            class="pl-c-viewport-size__label"
          >
            <input
              class="pl-c-viewport-size__input pl-c-viewport-size__input-action"
              id="pl-viewport-pixel-width"
              .value="${this.state.inputPixelValue}"
              @keypress=${this.handlePixelUpdatePress}
              @keyup=${this.handlePixelUpdateUp}
              @keydown=${this.handlePixelUpdateDown}
              @blur=${this.handlePixelBlur}
            />px</label
          >&nbsp;/&nbsp;<label
            for="pl-viewport-em-width"
            class="pl-c-viewport-size__label"
          >
            <input
              class="pl-c-viewport-size__input pl-c-viewport-size__input-action"
              id="pl-viewport-em-width"
              .value="${this.state.inputEmValue}"
              @keypress=${this.handleEmUpdatePress}
              @keyup=${this.handleEmUpdateUp}
              @keydown=${this.handleEmUpdateDown}
              @blur=${this.handleEmBlur}
            />em
          </label>
        </form>
      `;
    }
  }
}

export { ViewportSize };
