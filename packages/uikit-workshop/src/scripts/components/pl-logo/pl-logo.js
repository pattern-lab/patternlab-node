import { define, props } from 'skatejs';
import { h } from 'preact';
import { store } from '../../store.js'; // connect to redux

const classNames = require('classnames');
import { BaseComponent } from '../base-component.js';

@define
class Logo extends BaseComponent {
  static is = 'pl-logo';

  constructor(self) {
    self = super(self);
    return self;
  }

  connected() {
    const state = store.getState();
    this.themeMode = state.app.themeMode || 'dark';
  }

  shouldUpdate(prevProps, prevState) {
    return true;
  }

  static props = {
    url: props.string,
    text: props.string,
    src: props.string,
  };

  render({ themeMode }) {
    return (
      <a href={this.props.url} className="pl-c-logo">
        <img src={this.props.src} className="pl-c-logo__img" />
        {this.props.text && (
          <span className="pl-c-logo__text">{this.props.text}</span>
        )}
      </a>
    );
  }
}

export { Logo };
