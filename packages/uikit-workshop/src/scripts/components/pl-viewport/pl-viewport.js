/* eslint-disable no-unused-vars, no-param-reassign */
import { define, props } from 'skatejs';
import { h } from 'preact';
const classNames = require('classnames');
import render from 'preact-render-to-string';

import { store } from '../../store.js'; // connect to redux
import { BaseComponent } from '../base-component.js';

import styles from '../../../sass/pattern-lab--iframe-loader.scss';

@define
class IFrame extends BaseComponent {
  static is = 'pl-iframe';

  constructor(self) {
    self = super(self);
    this.useShadow = false;
    self.styleguideReady = false;
    return self;
  }

  _stateChanged(state) {}

  render() {
    const IframeInner = () => {
      return (
        <div>
          <style>{styles[0][1]}</style>
          <div className={'pl-c-loader'}>
            <div className={'pl-c-loader__content'}>
              <div className={'pl-c-loader__message'}>Loading Pattern Lab</div>
              <div className={'pl-c-loader__spinner'}>
                <svg className={'pl-c-loader-svg'} viewBox={'0 0 268 255'}>
                  <circle
                    className={'pl-c-loader-svg__outer-circle'}
                    cx={'134.2'}
                    cy={'127.6'}
                    r={'115.1'}
                  />
                  <circle
                    className={'pl-c-loader-svg__inner-circle'}
                    cx={'134.2'}
                    cy={'127.6'}
                    r={'66.3'}
                  />
                  <path
                    className={'pl-c-loader-svg__electron'}
                    d={
                      'M253,56.3c0,15.6-12.6,28.2-28.2,28.2s-28.2-12.6-28.2-28.2s12.6-28.2,28.2-28.2C240.3,28.1,253,40.7,253,56.3z'
                    }
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div class="pl-c-viewport pl-js-viewport">
        <div class="pl-c-viewport__cover pl-js-viewport-cover" />
        <div class="pl-c-viewport__iframe-wrapper pl-js-vp-iframe-container">
          <iframe
            class="pl-c-viewport__iframe pl-js-iframe"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            srcdoc={render(<IframeInner />)}
          />
          <div class="pl-c-viewport__resizer pl-js-resize-container">
            <div class="pl-c-viewport__resizer-handle pl-js-resize-handle" />
          </div>
        </div>
      </div>
    );
  }
}

export { IFrame };
