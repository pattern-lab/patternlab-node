import { define, props } from 'skatejs';
const classNames = require('classnames');
import { html } from 'lit-html';

import { store } from '../../store.js'; // connect to redux
import { BaseLitComponent } from '../base-component.js';

@define
class Layout extends BaseLitComponent {
  static is = 'pl-layout';

  constructor(self) {
    self = super(self);
    self.useShadow = false;
    self.targetOrigin =
      window.location.protocol === 'file:'
        ? '*'
        : window.location.protocol + '//' + window.location.host;
    return self;
  }

  static props = {
    layoutMode: props.string,
    themeMode: props.string,
  };

  connected() {
    const state = store.getState();
    this.layoutMode = state.app.layoutMode || 'vertical';
    this.themeMode = state.app.themeMode;
  }

  rendered() {
    this.iframeElement = this.renderRoot.querySelector('.pl-js-iframe');
  }

  _stateChanged(state) {
    this.layoutMode = state.app.layoutMode || 'vertical';
    this.themeMode = state.app.themeMode;
    this.iframeElement = document.querySelector('.pl-js-iframe');
    const layoutModeClass =
      this.layoutMode === 'vertical' ? 'sidebar' : 'horizontal';

    const classes = classNames(`pl-c-body--theme-${layoutModeClass}`, {
      [`pl-c-body--theme-${this.themeMode}`]: this.themeMode !== undefined,
    });

    this.className = classes;

    if (this.iframeElement) {
      const obj = JSON.stringify({
        event: 'patternLab.stateChange',
        state,
      });
      this.iframeElement.contentWindow.postMessage(obj, this.targetOrigin);
    }
  }

  render() {
    return html`
      <pl-header></pl-header>
      <div class="pl-c-viewport-modal-wrapper">
        <pl-iframe></pl-iframe>
        <pl-drawer></pl-drawer>
      </div>
    `;
  }
}

export { Layout };
