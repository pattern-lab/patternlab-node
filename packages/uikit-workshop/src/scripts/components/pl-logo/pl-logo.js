import { define, props } from 'skatejs';
import { store } from '../../store.js'; // connect to redux

const classNames = require('classnames');
import { html } from 'lit-html';
import { BaseLitComponent } from '../base-component.js';

@define
class Logo extends BaseLitComponent {
  static is = 'pl-logo';

  constructor(self) {
    self = super(self);
    return self;
  }

  connected() {
    const state = store.getState();
    this.theme = this.theme || state.app.themeMode || 'dark';
  }

  static props = {
    ratio: props.string,
    theme: props.string,
    url: props.string,
    text: props.string,
    altText: props.string,
    srcLight: props.string,
    srcDark: props.string,
  };

  render() {
    const imageSrc = this.theme === 'dark' ? this.srcDark : this.srcLight;

    return html`
      <a
        href="${this.props.url === '' ? undefined : this.props.url}"
        class="pl-c-logo"
      >
        <img
          alt=${this.props.altText || 'Pattern Lab Logo'}
          src=${imageSrc}
          class="pl-c-logo__img"
        />
        ${this.props.text && this.props.text !== ''
          ? html`
              <span class="pl-c-logo__text">{this.props.text}</span>
            `
          : ''}
      </a>
    `;
  }
}

export { Logo };
