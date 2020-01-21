/* eslint-disable no-unused-vars */
import { withComponent, shadow, name } from 'skatejs';
import { store } from '../store.js';
import withLitHtml from './with-lit-html';
import { LitElement } from 'lit-element';
import { SkatePreactElement } from './base-skate-preact-element';

export class BaseComponent extends SkatePreactElement {
  constructor() {
    super();
  }

  get renderRoot() {
    return this;
    // @todo: re-enable Shadow DOM conditionally after further testing + making sure PL components have inline styles needed
    // if (this.useShadow === true && supportsShadowDom) {
    //   return super.renderRoot || shadow(this);
    // } else {
    //   return this;
    // }
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

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    this.__storeUnsubscribe && this.__storeUnsubscribe();

    if (super.disconnectedCallback) {
      super.disconnectedCallback();
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

export class BaseLitComponent extends LitElement {
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
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
    this.requestUpdate();
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
