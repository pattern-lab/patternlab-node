import { LitElement, html } from 'lit-element';
import styles from './pl-tooltip.scss?external';
import { Slotify } from '../slotify';

class Tooltip extends Slotify(LitElement) {
  static get properties() {
    return {
      message: { type: String },
      position: { type: String },
      child: {},
    };
  }

  constructor() {
    super();

    // property defaults
    this.position = 'top';
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    styles.use();
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    styles.unuse();
  }

  render() {
    return html`
      <div class="pl-tooltip pl-tooltip--${this.position}">
        ${this.slotify('default') ? this.slotify('default') : ''}
        <span class="pl-tooltip__text">${this.message}</span>
      </div>
    `;
  }

  hideTooltip() {
    this.opened = false;
  }

  showTooltip() {
    this.opened = true;
  }

  toggleTooltip() {
    this.opened = !this.opened;
  }
}

customElements.define('pl-tooltip', Tooltip);

export { Tooltip };
