/* eslint-disable */
/*!
Copyright (C) 2015 by WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
(function(Object, GOPS) {
  'use strict';

  // (C) Andrea Giammarchi - Mit Style

  if (GOPS in Object) return;

  var setDescriptor,
    G = typeof global === typeof G ? window : global,
    id = 0,
    random = '' + Math.random(),
    prefix = '__\x01symbol:',
    prefixLength = prefix.length,
    internalSymbol = '__\x01symbol@@' + random,
    DP = 'defineProperty',
    DPies = 'defineProperties',
    GOPN = 'getOwnPropertyNames',
    GOPD = 'getOwnPropertyDescriptor',
    PIE = 'propertyIsEnumerable',
    gOPN = Object[GOPN],
    gOPD = Object[GOPD],
    create = Object.create,
    keys = Object.keys,
    freeze = Object.freeze || Object,
    defineProperty = Object[DP],
    $defineProperties = Object[DPies],
    descriptor = gOPD(Object, GOPN),
    ObjectProto = Object.prototype,
    hOP = ObjectProto.hasOwnProperty,
    pIE = ObjectProto[PIE],
    toString = ObjectProto.toString,
    addInternalIfNeeded = function(o, uid, enumerable) {
      if (!hOP.call(o, internalSymbol)) {
        defineProperty(o, internalSymbol, {
          enumerable: false,
          configurable: false,
          writable: false,
          value: {},
        });
      }
      o[internalSymbol]['@@' + uid] = enumerable;
    },
    createWithSymbols = function(proto, descriptors) {
      var self = create(proto);
      gOPN(descriptors).forEach(function(key) {
        if (propertyIsEnumerable.call(descriptors, key)) {
          $defineProperty(self, key, descriptors[key]);
        }
      });
      return self;
    },
    copyAsNonEnumerable = function(descriptor) {
      var newDescriptor = create(descriptor);
      newDescriptor.enumerable = false;
      return newDescriptor;
    },
    get = function get() {},
    onlyNonSymbols = function(name) {
      return name != internalSymbol && !hOP.call(source, name);
    },
    onlySymbols = function(name) {
      return name != internalSymbol && hOP.call(source, name);
    },
    propertyIsEnumerable = function propertyIsEnumerable(key) {
      var uid = '' + key;
      return onlySymbols(uid)
        ? hOP.call(this, uid) && this[internalSymbol]['@@' + uid]
        : pIE.call(this, key);
    },
    setAndGetSymbol = function(uid) {
      var descriptor = {
        enumerable: false,
        configurable: true,
        get: get,
        set: function(value) {
          setDescriptor(this, uid, {
            enumerable: false,
            configurable: true,
            writable: true,
            value: value,
          });
          addInternalIfNeeded(this, uid, true);
        },
      };
      defineProperty(ObjectProto, uid, descriptor);
      return freeze(
        (source[uid] = defineProperty(
          Object(uid),
          'constructor',
          sourceConstructor
        ))
      );
    },
    Symbol = function Symbol(description) {
      if (this instanceof Symbol) {
        throw new TypeError('Symbol is not a constructor');
      }
      return setAndGetSymbol(prefix.concat(description || '', random, ++id));
    },
    source = create(null),
    sourceConstructor = { value: Symbol },
    sourceMap = function(uid) {
      return source[uid];
    },
    $defineProperty = function defineProp(o, key, descriptor) {
      var uid = '' + key;
      if (onlySymbols(uid)) {
        setDescriptor(
          o,
          uid,
          descriptor.enumerable ? copyAsNonEnumerable(descriptor) : descriptor
        );
        addInternalIfNeeded(o, uid, !!descriptor.enumerable);
      } else {
        defineProperty(o, key, descriptor);
      }
      return o;
    },
    $getOwnPropertySymbols = function getOwnPropertySymbols(o) {
      return gOPN(o)
        .filter(onlySymbols)
        .map(sourceMap);
    };
  descriptor.value = $defineProperty;
  defineProperty(Object, DP, descriptor);

  descriptor.value = $getOwnPropertySymbols;
  defineProperty(Object, GOPS, descriptor);

  /**
   * @see https://github.com/aurelia/polyfills/pull/52/files
   */
  var cachedWindowNames =
    typeof window === 'object' ? Object.getOwnPropertyNames(window) : [];
  var originalObjectGetOwnPropertyNames = Object.getOwnPropertyNames;
  descriptor.value = function getOwnPropertyNames(o) {
    if (toString.call(o) === '[object Window]') {
      try {
        return originalObjectGetOwnPropertyNames(o);
      } catch (e) {
        // IE bug where layout engine calls userland gOPN for cross-domain "window" objects
        return [].concat([], cachedWindowNames);
      }
    }

    return gOPN(o).filter(onlyNonSymbols);
  };
  defineProperty(Object, GOPN, descriptor);

  descriptor.value = function defineProperties(o, descriptors) {
    var symbols = $getOwnPropertySymbols(descriptors);
    if (symbols.length) {
      keys(descriptors)
        .concat(symbols)
        .forEach(function(uid) {
          if (propertyIsEnumerable.call(descriptors, uid)) {
            $defineProperty(o, uid, descriptors[uid]);
          }
        });
    } else {
      $defineProperties(o, descriptors);
    }
    return o;
  };
  defineProperty(Object, DPies, descriptor);

  descriptor.value = propertyIsEnumerable;
  defineProperty(ObjectProto, PIE, descriptor);

  descriptor.value = Symbol;
  defineProperty(G, 'Symbol', descriptor);

  // defining `Symbol.for(key)`
  descriptor.value = function(key) {
    var uid = prefix.concat(prefix, key, random);
    return uid in ObjectProto ? source[uid] : setAndGetSymbol(uid);
  };
  defineProperty(Symbol, 'for', descriptor);

  // defining `Symbol.keyFor(symbol)`
  descriptor.value = function(symbol) {
    if (onlyNonSymbols(symbol))
      throw new TypeError(symbol + ' is not a symbol');
    if (!hOP.call(source, symbol)) {
      return void 0;
    }
    var label = symbol.slice(prefixLength);
    if (label.slice(0, prefixLength) !== prefix) {
      return void 0;
    }
    label = label.slice(prefixLength);
    if (label === random) {
      return void 0;
    }
    label = label.slice(0, label.length - random.length);
    return label.length > 0 ? label : void 0;
  };
  defineProperty(Symbol, 'keyFor', descriptor);

  descriptor.value = function getOwnPropertyDescriptor(o, key) {
    var descriptor = gOPD(o, key);
    if (descriptor && onlySymbols(key)) {
      descriptor.enumerable = propertyIsEnumerable.call(o, key);
    }
    return descriptor;
  };
  defineProperty(Object, GOPD, descriptor);

  descriptor.value = function(proto, descriptors) {
    return arguments.length === 1 || typeof descriptors === 'undefined'
      ? create(proto)
      : createWithSymbols(proto, descriptors);
  };
  defineProperty(Object, 'create', descriptor);

  descriptor.value = function() {
    var str = toString.call(this);
    return str === '[object String]' && onlySymbols(this)
      ? '[object Symbol]'
      : str;
  };
  defineProperty(ObjectProto, 'toString', descriptor);

  try {
    // fails in few pre ES 5.1 engines
    if (
      true ===
      create(
        defineProperty({}, prefix, {
          get: function() {
            return defineProperty(this, prefix, { value: true })[prefix];
          },
        })
      )[prefix]
    ) {
      setDescriptor = defineProperty;
    } else {
      throw 'IE11';
    }
  } catch (o_O) {
    setDescriptor = function(o, key, descriptor) {
      var protoDescriptor = gOPD(ObjectProto, key);
      delete ObjectProto[key];
      defineProperty(o, key, descriptor);
      defineProperty(ObjectProto, key, protoDescriptor);
    };
  }
})(Object, 'getOwnPropertySymbols');

(function(O, Symbol) {
  'use strict';
  var dP = O.defineProperty,
    ObjectProto = O.prototype,
    toString = ObjectProto.toString,
    toStringTag = 'toStringTag',
    descriptor;
  [
    'iterator', // A method returning the default iterator for an object. Used by for...of.
    'match', // A method that matches against a string, also used to determine if an object may be used as a regular expression. Used by String.prototype.match().
    'replace', // A method that replaces matched substrings of a string. Used by String.prototype.replace().
    'search', // A method that returns the index within a string that matches the regular expression. Used by String.prototype.search().
    'split', // A method that splits a string at the indices that match a regular expression. Used by String.prototype.split().
    'hasInstance', // A method determining if a constructor object recognizes an object as its instance. Used by instanceof.
    'isConcatSpreadable', // A Boolean value indicating if an object should be flattened to its array elements. Used by Array.prototype.concat().
    'unscopables', // An Array of string values that are property values. These are excluded from the with environment bindings of the associated objects.
    'species', // A constructor function that is used to create derived objects.
    'toPrimitive', // A method converting an object to a primitive value.
    toStringTag, // A string value used for the default description of an object. Used by Object.prototype.toString().
  ].forEach(function(name) {
    if (!(name in Symbol)) {
      dP(Symbol, name, { value: Symbol(name) });
      switch (name) {
        case toStringTag:
          descriptor = O.getOwnPropertyDescriptor(ObjectProto, 'toString');
          descriptor.value = function() {
            var str = toString.call(this),
              tst = this != null ? this[Symbol.toStringTag] : this;
            return tst == null ? str : '[object ' + tst + ']';
          };
          dP(ObjectProto, 'toString', descriptor);
          break;
      }
    }
  });
})(Object, Symbol);

(function(Si, AP, SP) {
  function returnThis() {
    return this;
  }

  // make Arrays usable as iterators
  // so that other iterables can copy same logic
  if (!AP[Si])
    AP[Si] = function() {
      var i = 0,
        self = this,
        iterator = {
          next: function next() {
            var done = self.length <= i;
            return done ? { done: done } : { done: done, value: self[i++] };
          },
        };
      iterator[Si] = returnThis;
      return iterator;
    };

  // make Strings usable as iterators
  // to simplify Array.from and for/of like loops
  if (!SP[Si])
    SP[Si] = function() {
      var fromCodePoint = String.fromCodePoint,
        self = this,
        i = 0,
        length = self.length,
        iterator = {
          next: function next() {
            var done = length <= i,
              c = done ? '' : fromCodePoint(self.codePointAt(i));
            i += c.length;
            return done ? { done: done } : { done: done, value: c };
          },
        };
      iterator[Si] = returnThis;
      return iterator;
    };
})(Symbol.iterator, Array.prototype, String.prototype);
