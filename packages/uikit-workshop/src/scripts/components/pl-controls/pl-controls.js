import { define, props } from 'skatejs';
import { h } from 'preact';
const classNames = require('classnames');
import { urlHandler, patternName } from '../../utils';

import { store } from '../../store.js'; // connect to redux
import { BaseComponent } from '../base-component.js';

import { ViewportSize } from '../pl-viewport-size/pl-viewport-size';
import { ViewportSizeList } from '../pl-viewport-size-list/pl-viewport-size-list';

@define
class Controls extends BaseComponent {
  static is = 'pl-controls';

  constructor(self) {
    self = super(self);
    this.useShadow = false;
    return self;
  }

  _stateChanged(state) {}

  render() {
    const { ishControlsHide } = window.ishControls;

    return (
      <div className="pl-c-controls">
        <ViewportSize />
        <ViewportSizeList {...ishControlsHide} />
        <pl-tools-menu />
      </div>
    );
  }
}

export { Controls };
