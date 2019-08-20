/* eslint-disable no-unused-vars, no-param-reassign */
import { define, props } from 'skatejs';
import { h } from 'preact';
const classNames = require('classnames');

import { store } from '../../store.js'; // connect to redux
import { BaseComponent } from '../base-component.js';
import MenuIcon from '../../../icons/menu.svg';
import VisuallyHidden from '@reach/visually-hidden';

@define
class Header extends BaseComponent {
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

  render({ themeMode }) {
    return (
      <header class="pl-c-header" role="banner">
        <button
          class="pl-c-header__nav-toggle pl-js-nav-trigger"
          onClick={this.toggleNav}
        >
          <MenuIcon height={20} width={20} fill="currentColor" />
          <VisuallyHidden>Menu</VisuallyHidden>
        </button>

        <pl-logo
          src={`styleguide/images/pattern-lab-logo--on-${themeMode}.svg`}
          url="/"
          text="Pattern Lab"
        />

        <nav
          class="pl-c-nav pl-js-nav-target pl-js-nav-container"
          role="navigation"
        >
          <pl-search max-results="10" placeholder="Find a Pattern" />
          <pl-nav />
        </nav>
        <pl-controls></pl-controls>
      </header>
    );
  }
}

export { Header };
