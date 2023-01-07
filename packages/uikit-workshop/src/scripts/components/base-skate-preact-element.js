const _extends =
  Object.assign ||
  function (target) {
    for (let i = 1; i < arguments.length; i++) {
      const source = arguments[i];
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

import { SkateElement } from './base-skate-element';

/** @jsx h */

import { h, render } from 'preact';

export class SkatePreactElement extends SkateElement {
  get props() {
    // We override props so that we can satisfy most use
    // cases for children by using a slot.
    return _extends({}, super.props, { children: h('slot', null) });
  }

  renderer(root, call) {
    this._renderRoot = root;
    render(call(), root);
  }

  disconnectedCallback() {
    this.disconnecting && this.disconnecting();
    super.disconnectedCallback && super.disconnectedCallback();
    this.disconnected && this.disconnected();
    // Render null to unmount. See https://github.com/skatejs/skatejs/pull/1432#discussion_r183381359
    render(null, this._renderRoot);

    this.__storeUnsubscribe && this.__storeUnsubscribe();

    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
  }

  connectedCallback() {
    this.connecting && this.connecting();
    super.connectedCallback && super.connectedCallback();
    this.connected && this.connected();
  }

  get renderRoot() {
    return super.renderRoot || shadow(this);
  }

  updated(prevProps, prevState) {
    super.updated && super.updated(prevProps, prevState);
    this.rendering && this.rendering();
    this.renderer(this.renderRoot, () => this.render && this.render(this));
    this.rendered && this.rendered();
  }
}
