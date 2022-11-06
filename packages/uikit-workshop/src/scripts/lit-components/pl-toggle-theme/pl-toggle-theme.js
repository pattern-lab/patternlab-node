/* eslint-disable no-unused-vars, no-param-reassign */
import { LitElement, html, customElement } from 'lit-element';
import { store } from '../../store.js'; // connect to the Redux store.
import { updateThemeMode } from '../../actions/app.js'; // redux actions needed
import styles from './pl-toggle-theme.scss?external';

@customElement('pl-toggle-theme')
class ThemeToggle extends LitElement {
  constructor() {
    super();
    this.targetOrigin =
      window.location.protocol === 'file:'
        ? '*'
        : window.location.protocol + '//' + window.location.host;
  }

  static get properties() {
    return {
      themeMode: {
        attribute: true,
        type: String,
      },
    };
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    styles.use();

    const state = store.getState();
    this.themeMode = state.app.themeMode || 'dark';

    this.__storeUnsubscribe = store.subscribe(() =>
      this._stateChanged(store.getState())
    );
    this._stateChanged(store.getState());

    store.dispatch(updateThemeMode(this.themeMode));
  }

  disconnectedCallback() {
    this.__storeUnsubscribe && this.__storeUnsubscribe();
    styles.unuse();

    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
  }

  _stateChanged(state) {
    this.themeMode = state.app.themeMode;
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
    const toggleThemeMode = this.themeMode !== 'dark' ? 'dark' : 'light';
    return html`
      <pl-button
        class="pl-c-tools__action pl-c-toggle-theme__action"
        title="Switch Theme"
        @click="${(_) => store.dispatch(updateThemeMode(toggleThemeMode))}"
      >
        Switch Theme

        <pl-icon
          slot="after"
          name="theme-${this.themeMode}"
          aria-hidden="true"
        ></pl-icon>
      </pl-button>
    `;
  }
}

export { ThemeToggle };
