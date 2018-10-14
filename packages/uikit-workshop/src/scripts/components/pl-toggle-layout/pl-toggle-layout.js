import { define, props } from 'skatejs';
import { h } from 'preact';

import { store } from '../../store.js'; // connect to the Redux store.
import { updateLayoutMode } from '../../actions/app.js'; // redux actions
import { BaseComponent } from '../base-component.js';

@define
class LayoutToggle extends BaseComponent {
  static is = 'pl-toggle-layout';

  constructor(self) {
    self = super(self);
    this.useShadow = false;
    return self;
  }

  connected() {
    const state = store.getState();
    this.layoutMode = state.app.layoutMode || 'vertical';
    store.dispatch(updateLayoutMode(this.layoutMode));
  }

  static props = {
    layoutMode: props.string,
    text: props.string,
  };

  _stateChanged(state) {
    if (this.layoutMode !== state.app.layoutMode) {
      this.layoutMode = state.app.layoutMode;
    }
  }

  render({ layoutMode, text }) {
    const toggleLayoutMode =
      layoutMode !== 'vertical' ? 'vertical' : 'horizontal';
    return (
      <div class="pl-c-toggle-layout">
        <button
          class="pl-c-tools__action pl-c-toggle-layout__action"
          title="Switch Layout"
          onClick={_ => store.dispatch(updateLayoutMode(toggleLayoutMode))}
        >
          {text && <span class="pl-c-tools__action-text">{text}</span>}

          <span class="pl-c-tools__action-icon">
            {layoutMode === 'horizontal' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                stroke="currentColor"
                stroke-width="1"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 4v25h25v-25h-25zM11 28h-7v-23h7v23zM27 28h-15v-23h15v23z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                stroke="currentColor"
                stroke-width="1"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 4v25h25v-25h-25zM27 28h-23v-17h23v17zM27 10h-23v-5h23v5z" />
              </svg>
            )}
          </span>
        </button>
      </div>
    );
  }
}

export { LayoutToggle };
