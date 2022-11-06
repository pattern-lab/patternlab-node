import { LitElement, html, customElement } from 'lit-element';
import { store } from '../../store.js'; // connect to the Redux store.
import { updateLayoutMode } from '../../actions/app.js'; // redux actions
import styles from './pl-toggle-layout.scss?external';

@customElement('pl-toggle-layout')
class LayoutToggle extends LitElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
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
    this.layoutMode = state.app.layoutMode || 'vertical';

    this.__storeUnsubscribe = store.subscribe(() =>
      this._stateChanged(store.getState())
    );
    this._stateChanged(store.getState());

    this.size = this.size || 'medium';
  }

  disconnectedCallback() {
    this.__storeUnsubscribe && this.__storeUnsubscribe();
    styles.unuse();

    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
  }

  static get properties() {
    return {
      layoutMode: {
        attribute: true,
        type: String,
      },
      text: {
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
    };
  }

  _stateChanged(state) {
    if (this.layoutMode !== state.app.layoutMode) {
      this.layoutMode = state.app.layoutMode;
    }
  }

  handleClick() {
    const getLayoutMode =
      this.layoutMode !== 'vertical' ? 'vertical' : 'horizontal';

    this.layoutMode = getLayoutMode;
    store.dispatch(updateLayoutMode(this.layoutMode));
  }

  render() {
    return html`
      <pl-button
        title="Switch Layout"
        @click="${this.handleClick}"
        size="${this.size}"
        ?icon-only="${this.iconOnly || false}"
      >
        ${this.text}
        <pl-icon
          slot="after"
          name="${this.layoutMode === 'horizontal' ? 'layout-h' : 'layout-v'}"
          aria-hidden="true"
        ></pl-icon>
      </pl-button>
    `;
  }
}

export { LayoutToggle };
