/* eslint-disable no-unused-vars, no-param-reassign */
import { define, props } from 'skatejs';
import { h } from 'preact';
const classNames = require('classnames');

import { store } from '../../store.js'; // connect to redux
import { BaseComponent } from '../base-component.js';

import iFrameResize from 'iframe-resizer/js/iframeResizer.js';
iFrameResize({
  checkOrigin: false,
  scrolling: false,
  heightCalculationMethod: 'documentElementOffset', // most accurate calculation in testing available options
  initCallback() {
    document.querySelector('.pl-js-iframe').classList.add('is-ready'); // toggles class that removes initial min-height styling
  },
});

@define
class Layout extends BaseComponent {
  static is = 'pl-layout';

  constructor(self) {
    self = super(self);
    this.useShadow = false;
    return self;
  }

  static props = {
    layoutMode: props.string,
    themeMode: props.string,
  };

  connected() {
    const state = store.getState();
    this.layoutMode = state.app.layoutMode;
    this.themeMode = state.app.themeMode;
  }

  _stateChanged(state) {
    this.layoutMode = state.app.layoutMode;
    this.themeMode = state.app.themeMode;

    const classes = classNames({
      [`pl-c-body--theme-${this.themeMode}`]: this.themeMode !== undefined,
      [`pl-c-body--theme-${
        this.layoutMode === 'vertical' ? 'sidebar' : 'horizontal'
      }`]: this.layoutMode !== undefined,
    });

    this.className = classes;
  }
}

export { Layout };
