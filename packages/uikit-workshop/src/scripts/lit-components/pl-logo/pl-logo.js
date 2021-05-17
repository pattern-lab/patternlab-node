import { store } from '../../store.js'; // connect to redux
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';
import { customElement } from 'lit-element';
import { BaseLitComponent } from '../../components/base-component';
import styles from './pl-logo.scss?external';

@customElement('pl-logo')
class Logo extends BaseLitComponent {
  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    styles.use();
    const state = store.getState();
    this.theme = this.theme || state.app.themeMode || 'dark';
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    styles.unuse();
  }

  static get properties() {
    return {
      width: String,
      height: String,
      theme: String,
      url: String,
      text: String,
      altText: {
        type: String,
        attribute: 'alt-text',
      },
      srcLight: {
        type: String,
        attribute: 'src-light',
      },
      srcDark: {
        type: String,
        attribute: 'src-dark',
      },
    };
  }

  render() {
    const imageSrc = this.theme === 'dark' ? this.srcDark : this.srcLight;

    return html`
      <a href="${this.url === '' ? undefined : this.url}" class="pl-c-logo">
        <img
          alt=${this.altText || 'Pattern Lab Logo'}
          src=${imageSrc}
          class="pl-c-logo__img"
          width="${ifDefined(this.width)}"
          height="${ifDefined(this.height)}"
        />
        ${this.text && this.text !== ''
          ? html` <span class="pl-c-logo__text">${this.text}</span> `
          : ''}
      </a>
    `;
  }
}

export { Logo };
