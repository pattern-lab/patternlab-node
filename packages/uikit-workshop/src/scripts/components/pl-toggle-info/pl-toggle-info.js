import { define, props } from 'skatejs';
import { h } from 'preact';

import { store } from '../../store.js'; // connect to the Redux store.
import { updateDrawerState } from '../../actions/app.js'; // redux actions
import { BaseComponent } from '../base-component.js';

@define
class InfoToggle extends BaseComponent {
  static is = 'pl-toggle-info';

  constructor(self) {
    self = super(self);
    return self;
  }

  static props = {
    _drawerOpened: props.boolean,
  };

  _stateChanged(state) {
    this._drawerOpened = state.app.drawerOpened;
    this.isViewallPage = state.app.isViewallPage;
  }

  render({ _drawerOpened, isViewallPage }) {
    return (
      <button
        class="pl-c-tools__action"
        onClick={_ => store.dispatch(updateDrawerState(!_drawerOpened))}
      >
        {_drawerOpened
          ? `Hide ${isViewallPage ? 'all ' : ''}Pattern Info`
          : `Show ${isViewallPage ? 'all ' : ''}Pattern Info`}
      </button>
    );
  }
}

export { InfoToggle };
