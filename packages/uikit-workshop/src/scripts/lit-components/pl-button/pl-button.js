import { LitElement, html } from 'lit-element';
import { Slotify } from '../slotify';
import styles from './pl-button.scss?external';
import { ifDefined } from 'lit-html/directives/if-defined';

// This decorator defines the element.
class Button extends Slotify(LitElement) {
  static get properties() {
    return {
      href: {
        attribute: true,
        type: String,
      },
      target: {
        attribute: true,
        type: String,
      },
      size: {
        attribute: true,
        type: String,
      },
      iconOnly: {
        attribute: 'icon-only',
        type: Boolean,
        reflect: true,
      },
      title: {
        attribute: true,
        type: String,
      },
    };
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

  innerTemplate() {
    return html`
      ${this.slotify('before')
        ? html`
            <span class="pl-c-button__icon">${this.slotify('before')}</span>
          `
        : ''}
      ${this.slotify('default')
        ? html`
            <span
              class="pl-c-button__text ${this.iconOnly ? 'is-vishidden' : ''}"
              >${this.slotify('default')}</span
            >
          `
        : ''}
      ${this.slotify('after')
        ? html`
            <span class="pl-c-button__icon">${this.slotify('after')}</span>
          `
        : ''}
    `;
  }

  // Render element DOM by returning a `lit-html` template.
  render() {
    const size = this.size || 'medium';
    // const iconOnly = this.iconOnly !== false|| false;

    return html`
      ${this.href
        ? html`
            <a
              class="pl-c-button pl-c-button--${size} ${this.iconOnly
                ? 'pl-c-button--icon-only'
                : ''}"
              href="${this.href}"
              target="${this.target ? this.target : 'self'}"
              title=${ifDefined(this.title === '' ? undefined : this.title)}
            >
              ${this.innerTemplate()}
            </a>
          `
        : html`
            <button
              class="pl-c-button pl-c-button--${size} ${this.iconOnly
                ? 'pl-c-button--icon-only'
                : ''}"
              title=${ifDefined(this.title === '' ? undefined : this.title)}
              type="button"
            >
              ${this.innerTemplate()}
            </button>
          `}
    `;
  }
}

customElements.define('pl-button', Button);

export { Button };
