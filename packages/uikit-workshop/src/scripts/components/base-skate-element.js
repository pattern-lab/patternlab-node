import { dashCase, empty, keys } from 'skatejs/dist/esnext/util';

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

export function normalizeAttributeDefinition(name, prop) {
  const { attribute } = prop;
  const obj =
    typeof attribute === 'object'
      ? _extends({}, attribute)
      : {
          source: attribute,
          target: attribute,
        };
  if (obj.source === true) {
    obj.source = dashCase(name);
  }
  if (obj.target === true) {
    obj.target = dashCase(name);
  }
  return obj;
}

function identity(v) {
  return v;
}

export function normalizePropertyDefinition(name, prop) {
  const { coerce, default: def, deserialize, serialize } = prop;
  return {
    attribute: normalizeAttributeDefinition(name, prop),
    coerce: coerce || identity,
    default: def,
    deserialize: deserialize || identity,
    serialize: serialize || identity,
  };
}

const defaultTypesMap = new Map();

function defineProps(constructor) {
  if (constructor.hasOwnProperty('_propsNormalized')) {
    return;
  }
  const { props } = constructor;
  keys(props).forEach((name) => {
    let func = props[name] || props.any;
    if (defaultTypesMap.has(func)) {
      func = defaultTypesMap.get(func);
    }
    if (typeof func !== 'function') {
      func = prop(func);
    }
    func({ constructor }, name);
  });
}

function delay(fn) {
  if (window.Promise) {
    Promise.resolve().then(fn);
  } else {
    setTimeout(fn);
  }
}

export function prop(definition) {
  const propertyDefinition = definition || {};

  // Allows decorators, or imperative definitions.
  const func = function ({ constructor }, name) {
    const normalized = normalizePropertyDefinition(name, propertyDefinition);

    // Ensure that we can cache properties. We have to do this so the _props object literal doesn't modify parent
    // classes or share the instance anywhere where it's not intended to be shared explicitly in userland code.
    if (!constructor.hasOwnProperty('_propsNormalized')) {
      constructor._propsNormalized = {};
    }

    // Cache the value so we can reference when syncing the attribute to the property.
    constructor._propsNormalized[name] = normalized;
    const {
      attribute: { source, target },
    } = normalized;

    if (source) {
      constructor._observedAttributes.push(source);
      constructor._attributeToPropertyMap[source] = name;
      if (source !== target) {
        constructor._attributeToAttributeMap[source] = target;
      }
    }

    Object.defineProperty(constructor.prototype, name, {
      configurable: true,
      get() {
        const val = this._props[name];
        return val == null ? normalized.default : val;
      },
      set(val) {
        const {
          attribute: { target },
          serialize,
        } = normalized;
        if (target) {
          const serializedVal = serialize ? serialize(val) : val;
          if (serializedVal == null) {
            this.removeAttribute(target);
          } else {
            this.setAttribute(target, serializedVal);
          }
        }
        this._props[name] = normalized.coerce(val);
        this.triggerUpdate();
      },
    });
  };

  // Allows easy extension of pre-defined props { ...prop(), ...{} }.
  Object.keys(propertyDefinition).forEach(
    (key) => (func[key] = propertyDefinition[key])
  );

  return func;
}

export class SkateElement extends HTMLElement {
  constructor(...args) {
    let _temp;
    return (
      (_temp = super(...args)),
      (this._prevProps = {}),
      (this._prevState = {}),
      (this._props = {}),
      (this._state = {}),
      _temp
    );
  }

  static get observedAttributes() {
    // We have to define props here because observedAttributes are retrieved
    // only once when the custom element is defined. If we did this only in
    // the constructor, then props would not link to attributes.
    defineProps(this);
    return this._observedAttributes.concat(super.observedAttributes || []);
  }

  static get props() {
    return this._props;
  }

  static set props(props) {
    this._props = props;
  }

  get props() {
    return keys(this.constructor.props).reduce((prev, curr) => {
      prev[curr] = this[curr];
      return prev;
    }, {});
  }

  set props(props) {
    const ctorProps = this.constructor.props;
    keys(props).forEach((k) => k in ctorProps && (this[k] = props[k]));
  }

  get state() {
    return this._state;
  }

  set state(state) {
    this._state = state;
    this.triggerUpdate();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const {
      _attributeToAttributeMap,
      _attributeToPropertyMap,
      _propsNormalized,
    } = this.constructor;

    if (super.attributeChangedCallback) {
      super.attributeChangedCallback(name, oldValue, newValue);
    }

    const propertyName = _attributeToPropertyMap[name];
    if (propertyName) {
      const propertyDefinition = _propsNormalized[propertyName];
      if (propertyDefinition) {
        const { default: defaultValue, deserialize } = propertyDefinition;
        const propertyValue = deserialize ? deserialize(newValue) : newValue;
        this._props[propertyName] =
          propertyValue == null ? defaultValue : propertyValue;
        this.triggerUpdate();
      }
    }

    const targetAttributeName = _attributeToAttributeMap[name];
    if (targetAttributeName) {
      if (newValue == null) {
        this.removeAttribute(targetAttributeName);
      } else {
        this.setAttribute(targetAttributeName, newValue);
      }
    }
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.triggerUpdate();
  }

  shouldUpdate() {
    return true;
  }

  triggerUpdate() {
    if (this._updating) {
      return;
    }
    this._updating = true;
    delay(() => {
      const { _prevProps, _prevState } = this;
      if (this.updating) {
        this.updating(_prevProps, _prevState);
      }
      if (this.updated && this.shouldUpdate(_prevProps, _prevState)) {
        this.updated(_prevProps, _prevState);
      }
      this._prevProps = this.props;
      this._prevState = this.state;
      this._updating = false;
    });
  }
}

SkateElement._attributeToAttributeMap = {};
SkateElement._attributeToPropertyMap = {};
SkateElement._observedAttributes = [];
SkateElement._props = {};

const { parse, stringify } = JSON;
const attribute = Object.freeze({ source: true });
const zeroOrNumber = (val) => (empty(val) ? 0 : Number(val));

const any = prop({
  attribute,
});

const array = prop({
  attribute,
  coerce: (val) => (Array.isArray(val) ? val : empty(val) ? null : [val]),
  default: Object.freeze([]),
  deserialize: parse,
  serialize: stringify,
});

const boolean = prop({
  attribute,
  coerce: Boolean,
  default: false,
  deserialize: (val) => !empty(val),
  serialize: (val) => (val ? '' : null),
});

const number = prop({
  attribute,
  default: 0,
  coerce: zeroOrNumber,
  deserialize: zeroOrNumber,
  serialize: (val) => (empty(val) ? null : String(Number(val))),
});

const object = prop({
  attribute,
  default: Object.freeze({}),
  deserialize: parse,
  serialize: stringify,
});

const string = prop({
  attribute,
  default: '',
  coerce: String,
  serialize: (val) => (empty(val) ? null : String(val)),
});

defaultTypesMap.set(Array, array);
defaultTypesMap.set(Boolean, boolean);
defaultTypesMap.set(Number, number);
defaultTypesMap.set(Object, object);
defaultTypesMap.set(String, string);

export const props = {
  any,
  array,
  boolean,
  number,
  object,
  string,
};
