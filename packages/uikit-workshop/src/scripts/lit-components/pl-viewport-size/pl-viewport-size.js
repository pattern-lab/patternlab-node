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

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    styles.use();
    const state = store.getState();
    this.px = round(state.app.viewportPx, 0);
    this.em = round(state.app.viewportEm, 1);
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    styles.unuse();
  }

  _stateChanged(state) {
    if (state.app.viewportPx !== this.px) {
      this.px = round(state.app.viewportPx, 0);
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

  render() {
    if (!window.__PRERENDER_INJECTED) {
      return html`
        <form class="pl-c-viewport-size" method="post" action="#">
          <span class="pl-c-viewport-size__input">${this.px}px</span
          >&nbsp;/&nbsp;
          <span class="pl-c-viewport-size__input">${this.em}em</span>
        </form>
      `;
    }
  }
}

export { ViewportSize };
