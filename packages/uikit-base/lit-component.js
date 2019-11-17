/* eslint-disable no-unused-vars */
import { store } from '@pattern-lab/uikit-data';
import { LitElement } from 'lit-element';

export class LitComponent extends LitElement {
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
