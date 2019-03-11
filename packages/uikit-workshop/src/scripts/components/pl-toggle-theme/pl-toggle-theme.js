import { define, props } from 'skatejs';
import { h } from 'preact';

import { store } from '../../store.js'; // connect to the Redux store.
import { updateThemeMode } from '../../actions/app.js'; // redux actions needed
import { BaseComponent } from '../base-component.js';

import './pl-toggle-theme.scss?external';
import styles from './pl-toggle-theme.scss';

@define
class ThemeToggle extends BaseComponent {
  static is = 'pl-toggle-theme';

  constructor(self) {
    self = super(self);
    this.useShadow = false;
    return self;
  }

  connected() {
    const state = store.getState();
    this.themeMode = state.app.themeMode || 'dark';
    store.dispatch(updateThemeMode(this.themeMode));
  }

  static props = {
    themeMode: props.string,
  };

  _stateChanged(state) {
    this.themeMode = state.app.themeMode;
  }

  render({ themeMode }) {
    const toggleThemeMode = this.themeMode !== 'dark' ? 'dark' : 'light';
    return (
      <div class="pl-c-toggle-theme">
        {this._renderStyles([styles])}
        <button
          class="pl-c-tools__action pl-c-toggle-theme__action"
          title="Switch Theme"
          onClick={_ => store.dispatch(updateThemeMode(toggleThemeMode))}
        >
          <span class="pl-c-tools__action-text">Switch Theme</span>

          <span class="pl-c-tools__action-icon">
            {themeMode === 'dark' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </span>
        </button>
      </div>
    );
  }
}

export { ThemeToggle };
