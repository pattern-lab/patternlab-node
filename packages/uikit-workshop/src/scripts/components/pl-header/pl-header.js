/* eslint-disable no-unused-vars, no-param-reassign */
import { define, props } from 'skatejs';
import { h } from 'preact';
const classNames = require('classnames');

import { store } from '../../store.js'; // connect to redux
import { BaseComponent } from '../base-component.js';

import { html } from 'lit-html';
import { BaseLitComponent } from '../base-component.js';

@define
class Header extends BaseLitComponent {
  static is = 'pl-header';

  constructor(self) {
    self = super(self);
    self.useShadow = false;
    self.toggleNav = self.toggleNav.bind(self);
    return self;
  }

  connected() {
    const state = store.getState();
    this.themeMode = state.app.themeMode || 'dark';
  }

  static props = {
    themeMode: props.string,
  };

  _stateChanged(state) {
    this.themeMode = state.app.themeMode || 'dark';
    this.triggerUpdate();
  }

  shouldUpdate(prevProps, prevState) {
    return true;
  }

  toggleNav() {
    const navTarget = this.querySelector('.pl-js-nav-target');
    navTarget.classList.toggle('pl-is-active'); // @todo: refactor to have this add based on the component's state
  }

  render() {
    return html`
      <header class="pl-c-header" role="banner">
        <button
          class="pl-c-header__nav-toggle pl-js-nav-trigger"
          @click="${this.toggleNav}"
        >
          <pl-icon
            name="menu"
            height="20"
            width="20"
            fill="currentColor"
          ></pl-icon>
          <span class="is-vishidden">Menu</span>
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
                  : window.config?.theme?.logo?.url || '/'}"
                alt-text="${window.config?.theme?.logo?.altText || ''}"
                theme="${this.themeMode}"
                ratio="${window.config?.theme?.logo?.ratio || ''}"
                text="${window.config?.theme?.logo?.text === '' ||
                window.config?.theme?.logo?.text === false ||
                window.config?.theme?.logo?.text === 'none'
                  ? ''
                  : window.config?.theme?.logo?.text || 'Pattern Lab'}"
              ></pl-logo>
            `
          : ''}

        <nav
          class="pl-c-nav pl-js-nav-target pl-js-nav-container"
          role="navigation"
        >
          <pl-search max-results="10" placeholder="Find a Pattern"></pl-search>
          <pl-nav></pl-nav>
        </nav>
        <pl-controls></pl-controls>
      </header>
    `;
  }
}

export { Header };
