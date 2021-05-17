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

import preact, { h, render } from 'preact';

// TODO make this a Symbol() when it's supported.
const preactNodeName = '__preactNodeName';

let oldVnode;

function newVnode(vnode) {
  const fn = vnode.nodeName;
  if (fn && fn.prototype instanceof HTMLElement) {
    if (!fn[preactNodeName]) {
      const prefix = fn.name;
      customElements.define(
        (fn[preactNodeName] = name(prefix)),
        class extends fn {}
      );
    }
    vnode.nodeName = fn[preactNodeName];
  }
  return vnode;
}

function setupPreact() {
  oldVnode = preact.options.vnode;
  preact.options.vnode = newVnode;
}

function teardownPreact() {
  preact.options.vnode = oldVnode;
}

export class SkatePreactElement extends SkateElement {
  get props() {
    // We override props so that we can satisfy most use
    // cases for children by using a slot.
    return _extends({}, super.props, { children: h('slot', null) });
  }

  renderer(root, call) {
    setupPreact();
    this._renderRoot = root;
    this._preactDom = render(
      call(),
      root,
      this._preactDom || root.childNodes[0]
    );
    teardownPreact();
  }

  disconnectedCallback() {
    this.disconnecting && this.disconnecting();
    super.disconnectedCallback && super.disconnectedCallback();
    this.disconnected && this.disconnected();
    // Render null to unmount. See https://github.com/skatejs/skatejs/pull/1432#discussion_r183381359
    this._preactDom = render(null, this._renderRoot, this._preactDom);
    this._renderRoot = null;

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
