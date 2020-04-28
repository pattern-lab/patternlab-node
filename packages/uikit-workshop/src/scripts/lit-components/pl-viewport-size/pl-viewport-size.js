/* eslint-disable no-unused-vars */
import { h } from 'preact';

import { BaseLitComponent } from '../../components/base-component';
import { html, customElement } from 'lit-element';
import styles from './pl-viewport-size.scss?external';
import { store } from '../../store.js'; // connect to redux

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
    this.state = { inputPixelValue: '' };
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
      this.setState({ inputPixelValue: this.px });
    }

    if (round(state.app.viewportEm, 1) !== this.em) {
      this.em = round(state.app.viewportEm, 1);
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

  handlePixelUpdate(e) {
    // Prevent inserting letters or symbols
    if (e.key.match(/\D+/g) && !(e.charCode === 13 || e.keyCode === 13)) {
      e.preventDefault();
    } else {
      this.setState({ inputPixelValue: e.target.value.replace(/\D+/g, '') });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.iframe.sizeiframe(this.state.inputPixelValue, true);
  }

  handlePixelBlur(e) {
    this.setState({ inputPixelValue: this.px });
    e.target.value = this.state.inputPixelValue;
  }

  render() {
    if (!window.__PRERENDER_INJECTED) {
      return html`
        <form class="pl-c-viewport-size" @submit=${this.handleSubmit}>
          <label for="pl-viewport-width" class="pl-c-viewport-size__label">
            <input
              class="pl-c-viewport-size__input pl-c-viewport-size__input-action"
              id="pl-viewport-width"
              .value="${this.state.inputPixelValue}"
              @keypress=${this.handlePixelUpdate}
              @blur=${this.handlePixelBlur}
            />px&nbsp;/&nbsp;<span class="pl-c-viewport-size__input"
              >${this.em}em</span
            >
          </label>
        </form>
      `;
    }
  }
}

export { ViewportSize };
