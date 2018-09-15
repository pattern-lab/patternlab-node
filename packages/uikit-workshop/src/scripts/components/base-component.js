import { withComponent, shadow } from 'skatejs';
import withPreact from '@skatejs/renderer-preact';
import { store } from '../store.js';
import { extend, supportsShadowDom } from '../utils/index.js';
import { h } from 'preact';

export class BaseComponent extends withComponent(withPreact()) {
  get renderRoot() {
    if (this.useShadow === true && supportsShadowDom) {
      return super.renderRoot || shadow(this);
    } else {
      return this;
    }
  }

  disconnectedCallback() {
    this.__storeUnsubscribe();

    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
  }

  connectedCallback() {
    this.__storeUnsubscribe = store.subscribe(() =>
      this._stateChanged(store.getState())
    );
    this._stateChanged(store.getState());
    if (super.connectedCallback) {
      super.connectedCallback();
    }
  }

  _stateChanged(state) {
    throw new Error('_stateChanged() not implemented', this);
  }

  /**
   * Update component state and schedule a re-render.
   * @param {object} state A dict of state properties to be shallowly merged
   * 	into the current state, or a function that will produce such a dict. The
   * 	function is called with the current state and props.
   * @param {() => void} callback A function to be called once component state is
   * 	updated
   */
  setState(state, callback) {
    if (!this._prevState) {
      this._prevState = this.state;
    }

    this.state = extend(
      extend({}, this.state),
      typeof state === 'function' ? state(this.state, this.props) : state
    );

    if (callback) {
      this._renderCallbacks.push(callback);
    }

    this.triggerUpdate();
  }

  _renderStyles(stylesheets) {
    let styles = Array.from(stylesheets);
    styles = styles.join(' ');

    if (styles) {
      return this.useShadow && <style>{styles}</style>;
    } else {
      return null;
    }
  }
}
