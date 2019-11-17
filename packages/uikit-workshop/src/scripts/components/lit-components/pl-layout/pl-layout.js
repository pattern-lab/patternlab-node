/* eslint-disable no-unused-vars, no-param-reassign */
const classNames = require('classnames');
import { store } from '@pattern-lab/uikit-data'; // connect to redux
import { html, LitComponent } from '@pattern-lab/uikit-base';
import styles from './pl-layout.scss?external';

class Layout extends LitComponent {
  constructor() {
    super();
    this.targetOrigin =
      window.location.protocol === 'file:'
        ? '*'
        : window.location.protocol + '//' + window.location.host;
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    styles.use();
    const state = store.getState();
    this.layoutMode = state.app.layoutMode;
    this.themeMode = state.app.themeMode;
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    styles.unuse();
  }

  firstUpdated() {
    this.iframeElement = this.renderRoot.querySelector('.pl-js-iframe');
  }

  _stateChanged(state) {
    let hasChanged = false;
    if (this.layoutMode !== state.app.layoutMode) {
      hasChanged = true;
      this.layoutMode = state.app.layoutMode || 'vertical';
    }

    if (this.themeMode !== state.app.themeMode) {
      hasChanged = true;
      this.themeMode = state.app.themeMode;
    }

    if (hasChanged === true) {
      hasChanged = false;
      const layoutModeClass =
        this.layoutMode === 'vertical' ? 'sidebar' : 'horizontal';

      const classes = classNames(`pl-c-body--theme-${layoutModeClass}`, {
        [`pl-c-body--theme-${this.themeMode}`]: this.themeMode !== undefined,
      });

      this.className = classes;
    }

    this.iframeElement = document.querySelector('.pl-js-iframe');

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

customElements.define('pl-layout', Layout);

export { Layout };
