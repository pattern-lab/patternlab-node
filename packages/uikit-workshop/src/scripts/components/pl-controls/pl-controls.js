import { define, props } from 'skatejs';
import { h } from 'preact';

const classNames = require('classnames');
import { urlHandler, patternName } from '../../utils';

import { store } from '../../store.js'; // connect to redux
import { BaseComponent } from '../base-component.js';

import { ViewportSize } from '../pl-viewport-size/pl-viewport-size';
import { ViewportSizes } from '../pl-viewport-size-list/pl-viewport-size-list';

@define
class Controls extends BaseComponent {
  static is = 'pl-controls';

  constructor(self) {
    self = super(self);
    self.useShadow = false;
    self.state = {
      pxSize: '',
      emSize: '',
    };
    return self;
  }

  _stateChanged(state) {
    this.setState({
      pxSize: state.app.viewportPx || '',
      emSize: state.app.viewportEm || '',
    });
  }

  connected() {
    const state = store.getState();

    this.setState({
      pxSize: state.app.viewportPx || '',
      emSize: state.app.viewportEm || '',
    });
  }

  render() {
    const { pxSize, emSize } = this.state;

    return (
      <div className="pl-c-controls">
        <ViewportSize px={pxSize} em={emSize} />
        <pl-viewport-sizes />
        <pl-tools-menu />
      </div>
    );
  }
}

export { Controls };
