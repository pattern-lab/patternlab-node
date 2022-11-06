import { LitElement, html, customElement } from 'lit-element';
import { store } from '../../store.js'; // connect to the Redux store.
import { updateDrawerState } from '../../actions/app.js'; // redux actions
import styles from './pl-toggle-info.scss?external';

@customElement('pl-toggle-info')
class InfoToggle extends LitElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  createRenderRoot() {
    return this;
  }

  static get properties() {
    return {
      isDrawerOpen: {
        attribute: 'is-drawer-open',
        type: Boolean,
      },
      isViewallPage: {
        attribute: 'is-viewall-page',
        type: Boolean,
      },
    };
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    styles.use();

    const state = store.getState();
    this.isDrawerOpen = state.app.drawerOpened;
    this.isViewallPage = state.app.isViewallPage;

    this.__storeUnsubscribe = store.subscribe(() =>
      this._stateChanged(store.getState())
    );
    this._stateChanged(store.getState());
  }

  disconnectedCallback() {
    this.__storeUnsubscribe && this.__storeUnsubscribe();
    styles.unuse();

    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
  }

  _stateChanged(state) {
    this.isDrawerOpen = state.app.drawerOpened;
    this.isViewallPage = state.app.isViewallPage;
  }

  handleClick() {
    this.isDrawerOpen = !this.isDrawerOpen;
    store.dispatch(updateDrawerState(this.isDrawerOpen));
  }

  render() {
    return html`
      <pl-button @click="${this.handleClick}">
        <span slot="default"
          >${this.isDrawerOpen ? 'Collapse' : 'Expand'}
          ${this.isViewallPage ? 'All Panels' : 'Panel'}</span
        >
        <pl-icon
          name="${this.isDrawerOpen ? 'code-collapse' : 'code-expand'}"
          slot="after"
          aria-hidden="true"
        ></pl-icon>
      </pl-button>
    `;
  }
}

export { InfoToggle };
