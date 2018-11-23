import { define, props } from 'skatejs';
import { h } from 'preact';
const classNames = require('classnames');

import { store } from '../../store.js'; // connect to redux
import { BaseComponent } from '../base-component.js';

@define
class Header extends BaseComponent {
  static is = 'pl-header';

  constructor(self) {
    self = super(self);
    this.useShadow = false;
    return self;
  }

  _stateChanged(state) {}

  render() {
    return (
      <header class="pl-c-header" role="banner">
        <button class="pl-c-header__nav-toggle pl-js-nav-trigger">Menu</button>
        <nav
          class="pl-c-nav pl-js-nav-target pl-js-nav-container"
          role="navigation"
        >
          <pl-search max-results="10" placeholder="Find a Pattern" />
          <pl-nav />
        </nav>
        <pl-controls />
      </header>
    );
  }
}

export { Header };
