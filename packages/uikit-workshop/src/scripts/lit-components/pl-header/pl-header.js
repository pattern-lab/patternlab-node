/* eslint-disable no-unused-vars, no-param-reassign */
import { store } from '../../store.js'; // connect to redux
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';
import { BaseLitComponent } from '../../components/base-component';
import { iframeMsgDataExtraction } from '../../utils';
import { customElement } from 'lit-element';
import Mousetrap from 'mousetrap';
import styles from './pl-header.scss?external';

@customElement('pl-header')
class Header extends BaseLitComponent {
  constructor() {
    super();
    this._wasInitiallyRendered = false;
    this.receiveIframeMessage = this.receiveIframeMessage.bind(this);
    this.handleExternalClicks = this.handleExternalClicks.bind(this);
    this.toggleNav = this.toggleNav.bind(this);
  }

  static get properties() {
    return {
      themeMode: String,
      isActive: Boolean,
      currentPattern: String,
    };
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    styles.use();
    const state = store.getState();
    this.currentPattern = state.app.currentPattern || '';
    this.themeMode = state.app.themeMode || 'dark';

    window.addEventListener('message', this.receiveIframeMessage, false);
    document.addEventListener('click', this.handleExternalClicks);

    Mousetrap(this).bind('esc', () => {
      if (window.innerWidth <= 670) {
        this.isActive = false;
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    styles.unuse();
    window.removeEventListener('message', this.receiveIframeMessage);
    document.removeEventListener('click', this.handleExternalClicks);
  }

  _stateChanged(state) {
    if (this.themeMode !== state.app.themeMode) {
      this.themeMode = state.app.themeMode || 'dark';
    }

    if (this.currentPattern !== state.app.currentPattern) {
      if (this.isActive === true) {
        this.isActive = false;
      }
      this.currentPattern = state.app.currentPattern;
    }
  }

  handleExternalClicks(e) {
    if (window.innerWidth <= 670) {
      if (
        e.target !== this.navToggle &&
        !e.target.closest('.pl-js-nav-container') &&
        !e.target.closest('pl-toggle-layout') &&
        this.isActive === true
      ) {
        this.isActive = false;
      }
    }
  }

  firstUpdated() {
    this.navToggle = this.renderRoot.querySelector('.pl-js-nav-trigger');
    this.navTarget = this.querySelector('.pl-js-nav-target');

    if (!window.__PRERENDER_INJECTED) {
      this._wasInitiallyRendered = true;
    }
  }

  toggleNav() {
    this.isActive = !this.isActive;
  }

  render() {
    return html`
      <header class="pl-c-header" role="banner">
        <button
          class="pl-c-header__nav-toggle pl-js-nav-trigger"
          @click="${this.toggleNav}"
          type="button"
        >
          <pl-icon
            name="${this.isActive ? 'close' : 'menu'}"
            height="20"
            width="20"
            fill="currentColor"
            aria-hidden="true"
          ></pl-icon>
          <span class="is-vishidden">Toggle Menu</span>
        </button>

        ${window.config?.theme?.logo !== false
          ? html`
              <pl-logo
                src-light="${window.config?.theme?.logo?.srcLight ||
                'styleguide/images/pattern-lab-logo--on-light.svg'}"
                src-dark="${window.config?.theme?.logo?.srcDark ||
                'styleguide/images/pattern-lab-logo--on-dark.svg'}"
                url="${window.config?.theme?.logo?.url === '' ||
                window.config?.theme?.logo?.url === 'none'
                  ? ''
                  : window.config?.theme?.logo?.url || './'}"
                alt-text="${window.config?.theme?.logo?.altText || ''}"
                theme="${this.themeMode}"
                width="${ifDefined(window.config?.theme?.logo?.width)}"
                height="${ifDefined(window.config?.theme?.logo?.height)}"
                text="${window.config?.theme?.logo?.text === '' ||
                window.config?.theme?.logo?.text === false ||
                window.config?.theme?.logo?.text === 'none'
                  ? ''
                  : window.config?.theme?.logo?.text || 'Pattern Lab'}"
              ></pl-logo>
            `
          : ''}

        <nav
          class="pl-c-nav pl-js-nav-target pl-js-nav-container ${this.isActive
            ? 'pl-is-active'
            : ''}"
          role="navigation"
        >
          <pl-search max-results="10" placeholder="Find a Pattern"></pl-search>
          <pl-nav></pl-nav>
        </nav>
        <pl-controls></pl-controls>
      </header>
    `;
  }

  /**
   *
   * @param {MessageEvent} e A message received by a target object.
   */
  receiveIframeMessage(event) {
    const self = this;

    const data = iframeMsgDataExtraction(event);

    if (data.event !== undefined && data.event === 'patternLab.pageClick') {
      try {
        if (
          window.innerWidth <= 670 ||
          (window.innerWidth >= 670 && self.layoutMode !== 'vertical')
        ) {
          this.isActive = false;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

export { Header };
