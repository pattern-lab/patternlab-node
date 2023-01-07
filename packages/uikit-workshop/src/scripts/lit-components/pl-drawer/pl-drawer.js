import { styleMap } from 'lit-html/directives/style-map';
import { classMap } from 'lit-html/directives/class-map';
import { LitElement, html, customElement } from 'lit-element';
import { store } from '../../store.js'; // redux store
import {
  updateDrawerState,
  updateDrawerHeight,
  updateDrawerAnimationState,
} from '../../actions/app.js'; // redux actions needed by this element.
import styles from './pl-drawer.scss?external';

@customElement('pl-drawer')
class Drawer extends LitElement {
  constructor() {
    super();
    this.onMouseDown = this.onMouseDown.bind(this); // fix bindings so "this" works properly
    this.onMouseUp = this.onMouseUp.bind(this); // fix bindings so "this" works properly
    this.onMouseMove = this.onMouseMove.bind(this); // fix bindings so "this" works properly
  }

  connectedCallback() {
    styles.use();
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.__storeUnsubscribe = store.subscribe(() =>
      this._stateChanged(store.getState())
    );
    this._stateChanged(store.getState());
  }

  disconnectedCallback() {
    styles.unuse();
    this.__storeUnsubscribe && this.__storeUnsubscribe();

    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
  }

  static get properties() {
    return {
      drawerOpened: {
        attribute: true,
        type: Boolean,
      },
      drawerHeight: {
        attribute: true,
        type: Number,
      },
      isViewallPage: {
        attribute: true,
        type: Boolean,
      },
      isMouseDown: {
        attribute: true,
        type: Boolean,
      },
    };
  }

  createRenderRoot() {
    return this;
  }

  onMouseDown() {
    this.isMouseDown = true;
    store.dispatch(updateDrawerAnimationState(true));

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove(event) {
    // 1/2 the height of the UI being dragged. @todo: make sure this 20px is calculated
    const clientHeight = event.targetTouches
      ? event.targetTouches[0].clientY
      : event.clientY;
    const panelHeight = window.innerHeight - clientHeight + 28;

    this.drawerHeight = panelHeight;
  }

  onMouseUp() {
    this.isMouseDown = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    store.dispatch(updateDrawerHeight(this.drawerHeight));
    store.dispatch(updateDrawerAnimationState(false));
  }

  render() {
    const classes = {
      'pl-c-drawer': true,
      'pl-js-drawer': true,
      'pl-is-active': this.drawerOpened && !this.isViewallPage,
    };

    const renderedHeight =
      this.drawerOpened && !this.isViewallPage
        ? this.drawerHeight > 20
          ? this.drawerHeight
          : 300
        : 0;

    const drawerStyles = {
      height: `${renderedHeight}px`,
      transitionDuration: this.isMouseDown ? '0ms' : '300ms',
    };

    return html`
      <div>
        <div class="pl-c-drawer__cover" ?hidden="${!this.isMouseDown}"></div>
        <div style="${styleMap(drawerStyles)}" class="pl-c-drawer__wrapper">
          <div class="pl-c-drawer__resizer" @mousedown="${this.onMouseDown}">
            <svg
              viewBox="0 0 20 20"
              preserveAspectRatio="xMidYMid"
              focusable="false"
              class="pl-c-drawer__resizer-icon"
            >
              <title>Drag to resize Pattern Lab Drawer</title>
              <path d="M6 0h2v20H6zM13 0h2v20h-2z" />
            </svg>
          </div>
          <div class="${classMap(classes)}">
            <div class="pl-c-drawer__toolbar">
              <div class="pl-c-drawer__toolbar-controls">
                <pl-toggle-layout
                  size="small"
                  icon-only="true"
                ></pl-toggle-layout>

                <pl-button
                  title="Hide pattern info"
                  title="Menu"
                  size="small"
                  icon-only="true"
                  @click="${(_) => store.dispatch(updateDrawerState(false))}"
                >
                  <pl-icon
                    slot="after"
                    name="close"
                    aria-hidden="true"
                  ></pl-icon>
                </pl-button>
              </div>
            </div>
            <div class="pl-c-drawer__content pl-js-drawer-content">
              <div
                class="pl-c-loader-wrapper pl-c-body--theme-${this.themeMode}"
              >
                <div class="pl-c-loader">
                  <div class="pl-c-loader__content">
                    <div class="pl-c-loader__message">Loading Code Panel</div>
                    <div class="pl-c-loader__spinner">
                      <svg
                        class="pl-c-loader-svg"
                        viewBox="0 0 268 255"
                        aria-hidden="true"
                      >
                        <circle
                          class="pl-c-loader-svg__outer-circle"
                          cx="134.2"
                          cy="127.6"
                          r="115.1"
                        />
                        <circle
                          class="pl-c-loader-svg__inner-circle"
                          cx="134.2"
                          cy="127.6"
                          r="66.3"
                        />
                        <path
                          class="pl-c-loader-svg__electron"
                          d="M253,56.3c0,15.6-12.6,28.2-28.2,28.2s-28.2-12.6-28.2-28.2s12.6-28.2,28.2-28.2C240.3,28.1,253,40.7,253,56.3z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _stateChanged(state) {
    if (this.themeMode !== state.app.themeMode) {
      this.themeMode = state.app.themeMode || 'dark';
    }
    if (this.drawerOpened !== state.app.drawerOpened) {
      this.drawerOpened = state.app.drawerOpened;
    }
    if (this.drawerHeight !== state.app.drawerHeight) {
      this.drawerHeight = state.app.drawerHeight;
    }
    if (this.isDragging !== state.app.isDragging) {
      this.isDragging = state.app.isDragging;
    }
    if (this.isViewallPage !== state.app.isViewallPage) {
      this.isViewallPage = state.app.isViewallPage;
    }
  }
}

export { Drawer };
