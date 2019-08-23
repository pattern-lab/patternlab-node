/* eslint-disable no-unused-vars */
import { withComponent, shadow } from 'skatejs';
import withPreact from '@skatejs/renderer-preact';
import { store } from '../store.js';
import { extend, supportsShadowDom } from '../utils/index.js';
import { h } from 'preact';
import withLitHtml from './with-lit-html';

export class BaseComponent extends withComponent(withPreact()) {
  get renderRoot() {
    return this;
    // @todo: re-enable Shadow DOM conditionally after further testing + making sure PL components have inline styles needed
    // if (this.useShadow === true && supportsShadowDom) {
    //   return super.renderRoot || shadow(this);
    // } else {
    //   return this;
    // }
  }

  disconnectedCallback() {
    this.__storeUnsubscribe && this.__storeUnsubscribe();

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
    // throw new Error('_stateChanged() not implemented', this);
    this.triggerUpdate();
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
    this.state = Object.assign({}, this.state, state);
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

export class BaseLitComponent extends withComponent(withLitHtml()) {
  get renderRoot() {
    return this;
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
    this.triggerUpdate();
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
    this.state = Object.assign({}, this.state, state);
  }
}
