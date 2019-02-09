import { define, props } from 'skatejs';
import { h } from 'preact';
import Hogan from 'hogan.js';
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
    try {
      /* load pattern nav */
      const template = document.querySelector('.pl-js-pattern-nav-template');
      const templateCompiled = Hogan.compile(template.innerHTML);
      const templateRendered = templateCompiled.render(window.navItems);
      this.renderRoot.querySelector(
        '.pl-js-pattern-nav-target'
      ).innerHTML = templateRendered;

      /* load ish controls */
      const controlsTemplate = document.querySelector(
        '.pl-js-ish-controls-template'
      );
      const controlsTemplateCompiled = Hogan.compile(
        controlsTemplate.innerHTML
      );
      const controlsTemplateRendered = controlsTemplateCompiled.render(
        window.ishControls
      );
      this.renderRoot.querySelector(
        '.pl-js-controls'
      ).innerHTML = controlsTemplateRendered;
    } catch (e) {
      const message =
        '<p>Please generate your site before trying to view it.</p>';
      this.renderRoot.querySelector(
        '.pl-js-pattern-nav-target'
      ).innerHTML = message;
    }
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

  get renderRoot() {
    return this;
  }

  _stateChanged(state) {
    this.layoutMode = state.app.layoutMode;
    this.themeMode = state.app.themeMode;

    const classes = classNames({
      [`pl-c-body--theme-${this.themeMode}`]: this.themeMode !== undefined,
      [`pl-c-body--theme-${
        this.layoutMode === 'vertical' ? 'sidebar' : 'horizontal'
      }`]:
        this.layoutMode !== undefined,
    });

    this.className = classes;
  }
}

export { Layout };
