(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/tor/projects/patternlab-node/public/styleguide/js/config.js":[function(require,module,exports){
module.exports = {
    minViewportWidth            : 240, //Minimum Size for Viewport
    maxViewportWidth            : 2600, //Maxiumum Size for Viewport
    viewportResizeHandleWidth   : 14, //Width of the viewport drag-to-resize handle
    bodySize                    : parseInt(window.getComputedStyle(document.body).getPropertyValue('font-size')),
    sw                          : document.body.clientWidth, //Viewport Width
    sh                          : document.body.clientHeight //Viewport Height
}
},{}],"/Users/tor/projects/patternlab-node/public/styleguide/js/cookie.js":[function(require,module,exports){
/*jslint indent: 4*/
/*global window*/
'use strict';

var pluses = /\+/g;

function raw(s) {
    return s;
}

function decoded(s) {
    return decodeURIComponent(s.replace(pluses, ' '));
}

function Cookie(options) {
    this.options = options || {};
}

Cookie.prototype.write = function (key, value, options) {
    var c;
    options = options || {};

    Object.keys(this.options).every(function (key) {
        if (!options.hasOwnProperty(key)) {
            options[key] = this.options[key];
        }
        return true;
    });

    if (value === null) {
        options.expires = -1;
    }

    if (typeof options.expires === 'number') {
        var days    = options.expires,
            t;

        t = options.expires = new Date();
        t.setDate(t.getDate() + days);
    }

    value = options.json ? JSON.stringify(value) : String(value);

    c = [
        encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
        options.path    ? '; path=' + options.path : '',
        options.domain  ? '; domain=' + options.domain : '',
        options.secure  ? '; secure' : ''
    ].join('');
    document.cookie = c;
    return c;
};

Cookie.prototype.read = function (key) {
    // read
    var decode  = this.options.raw ? raw : decoded,
        cookies = document.cookie.split('; '),
        i,
        l,
        parts,
        cookie;

    for (i = 0, l = cookies.length; i < l; i++) {
        parts = cookies[i].split('=');
        if (decode(parts.shift()) === key) {
            cookie = decode(parts.join('='));
            return this.options.json ? JSON.parse(cookie) : cookie;
        }
    }

    return null;
};

Cookie.prototype.remove = function (key, options) {
    if (this.read(key) !== null) {
        this.write(key, null, options);
        return true;
    }
    return false;
};

module.exports = Cookie;
},{}],"/Users/tor/projects/patternlab-node/public/styleguide/js/data-saver.js":[function(require,module,exports){
/*jslint indent: 4*/
/*global window*/
'use strict';
var Cookie = require('./cookie'),
    cookie = new Cookie();

/*!
 * Data Saver - v0.1
 *
 * Copyright (c) 2013 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 */

var DataSaver = {

    // the name of the cookie to store the data in
    cookieName: "patternlab",

    /**
    * Add a given value to the cookie
    * @param  {String}       the name of the key
    * @param  {String}       the value
    */
    addValue: function (name, val) {
        var cookieVal = cookie.read(this.cookieName);
        if ((cookieVal === null) || (cookieVal === "")) {
            cookieVal = name + "~" + val;
        } else {
            cookieVal = cookieVal + "|" + name + "~" + val;
        }
        cookie.write(this.cookieName, cookieVal);
    },

    /**
    * Update a value found in the cookie. If the key doesn't exist add the value
    * @param  {String}       the name of the key
    * @param  {String}       the value
    */
    updateValue: function (name, val) {
        if (this.findValue(name)) {
            var updateCookieVals = "",
                cookieVals = cookie.read(this.cookieName).split("|"),
                i,
                l,
                fieldVals;
            for (i = 0, l = cookieVals.length; i < l; i++) {
                fieldVals = cookieVals[i].split("~");
                if (fieldVals[0] === name) {
                    fieldVals[1] = val;
                }
                if (i > 0) {
                    updateCookieVals += "|" + fieldVals[0] + "~" + fieldVals[1];
                } else {
                    updateCookieVals += fieldVals[0] + "~" + fieldVals[1];
                }
            }
            cookie.write(this.cookieName, updateCookieVals);
        } else {
            this.addValue(name, val);
        }
    },

    /**
    * Remove the given key
    * @param  {String}       the name of the key
    */
    removeValue: function (name) {
        var updateCookieVals = "",
            cookieVals = cookie.read(this.cookieName).split("|"),
            k = 0,
            i,
            l,
            fieldVals;
        for (i = 0, l = cookieVals.length; i < l; i++) {
            fieldVals = cookieVals[i].split("~");
            if (fieldVals[0] !== name) {
                if (k === 0) {
                    updateCookieVals += fieldVals[0] + "~" + fieldVals[1];
                } else {
                    updateCookieVals += "|" + fieldVals[0] + "~" + fieldVals[1];
                }
                k++;
            }
        }
        cookie.write(this.cookieName, updateCookieVals);
    },

    /**
    * Find the value using the given key
    * @param  {String}       the name of the key
    *
    * @return {String}       the value of the key or false if the value isn't found
    */
    findValue: function (name) {
        if (cookie.read(this.cookieName)) {
            var cookieVals = cookie.read(this.cookieName).split("|"),
                i,
                l,
                fieldVals;
            for (i = 0, l = cookieVals.length; i < l; i++) {
                fieldVals = cookieVals[i].split("~");
                if (fieldVals[0] === name) {
                    return fieldVals[1];
                }
            }
        }
        return false;
    }
};

module.exports = DataSaver;
},{"./cookie":"/Users/tor/projects/patternlab-node/public/styleguide/js/cookie.js"}],"/Users/tor/projects/patternlab-node/public/styleguide/js/eventDelegator/eventDelegator.js":[function(require,module,exports){
/*jslint indent: 4*/
/*global window*/
'use strict';
var WM          = require('./weakMapSet').WeakMap,
    delegators  = new WM();

require('./matches.js');

function EventDelegator(element) {
    var delegator = delegators.get(element);

    if (delegator) {
        return delegator;
    }

    this.events     = {};
    this.element    = element;
    this.handlers   = {};
    delegators.set(element, this);
}

EventDelegator.prototype._match = function (selectors, e) {
    var target  = e.target,
        selector;

    function _runCallback(selector) {
        var i,
            l;
        for (i = 0, l = selectors[selector].length; i < l; i++) {
            selectors[selector][i](e);
        }
    }
    while (target !== this.element) {
        for (selector in selectors) {
            if (selectors.hasOwnProperty(selector) && target.matches(selector)) {
                _runCallback(selector);
            }
        }
        if (!target.parentNode) {
            return;
        }
        target = target.parentNode;
    }
};

EventDelegator.prototype.on = function (type, selector, cb) {
    //todo support elements as selector

    var _this = this;

    function handler(e) {
        _this._match(_this.events[type], e);
    }

    if (!this.events[type]) {
        this.events[type] = {};

        this.handlers[type] = handler;
        this.element.addEventListener(type, handler, false);
    }

    this.events[type][selector] = this.events[type][selector] || [];

    if (this.events[type][selector].indexOf(cb) === -1) {
        this.events[type][selector].push(cb);
    }
    return this;
};

EventDelegator.prototype.off = function (type, selector, cb) {
    if (type === undefined) {
        Object.keys(this.events).every(function (evtType) {
            this.element.removeEventListener(evtType, this.handlers[evtType]);
            return true;
        });
        this.events = {};
    } else if (selector === undefined) {
        //remove all of one type
        if (this.events[type]) {
            this.element.removeEventListener(type, this.handlers[type]);
            delete this.events[type];
            delete this.handlers[type];
        }
    } else if (cb === undefined) {
        // remove all handlers
        if (this.events[type] && this.events[type][selector]) {
            delete this.events[type][selector];
            // Remove eventlistener if no selectors are present
            if (Object.keys(this.events[type]).length === 0) {
                this.off(type);
            }
        }
    } else {
        // remove specific handler
        var i = this.events[type][selector].indexOf(cb);

        if (i !== -1) {
            this.events[type][selector].splice(i, 1);
        }
    }
    return this;
};

EventDelegator.prototype.toString = function () {
    return 'EventDelegator';
};

module.exports = EventDelegator;
},{"./matches.js":"/Users/tor/projects/patternlab-node/public/styleguide/js/eventDelegator/matches.js","./weakMapSet":"/Users/tor/projects/patternlab-node/public/styleguide/js/eventDelegator/weakMapSet.js"}],"/Users/tor/projects/patternlab-node/public/styleguide/js/eventDelegator/matches.js":[function(require,module,exports){
/*jslint indent: 4*/
/*global window*/
/**
 * Polyfill for Element.matches
 **/
function addPolyfill(ElementPrototype) {
    'use strict';

    if (ElementPrototype.matches !== undefined) {
        return;
    }

    ElementPrototype.matches = ElementPrototype.matchesSelector ||
        ElementPrototype.mozMatchesSelector ||
        ElementPrototype.msMatchesSelector ||
        ElementPrototype.oMatchesSelector ||
        ElementPrototype.webkitMatchesSelector ||
        function (selector) {
            var node    = this,
                nodes   = (node.parentNode || node.document).querySelectorAll(selector),
                i       = -1;

            while (nodes[i] && nodes[i] !== node) {
                ++i;
            }

            return !!nodes[i];
        };
}

if (module && module.exports) {
    module.exports = addPolyfill;
} else {
    addPolyfill(window.Element.prototype);
}
},{}],"/Users/tor/projects/patternlab-node/public/styleguide/js/eventDelegator/weakMapSet.js":[function(require,module,exports){
(function (global){
"WeakMap" in this || (function (module) {"use strict";

  //!(C) WebReflection - Mit Style License
  // size and performances oriented polyfill for ES6
  // WeakMap, Map, and Set
  // compatible with node.js, Rhino, any browser
  // does not implement default vaule during wm.get()
  // since ES.next won't probably do that
  // use wm.has(o) ? wm.get(o) : d3fault; instead

  // WeakMap(void):WeakMap
  function WeakMap() {

    // private references holders
    var
      keys = [],
      values = []
    ;

    // returns freshly new created
    // instanceof WeakMap in any case
    return create(WeakMapPrototype, {
      // WeakMap#delete(key:void*):boolean
      "delete": {value: bind.call(sharedDel, NULL, TRUE, keys, values)},
      //:was WeakMap#get(key:void*[, d3fault:void*]):void*
      // WeakMap#get(key:void*):void*
      get:      {value: bind.call(sharedGet, NULL, TRUE, keys, values)},
      // WeakMap#has(key:void*):boolean
      has:      {value: bind.call(sharedHas, NULL, TRUE, keys, values)},
      // WeakMap#set(key:void*, value:void*):void
      set:      {value: bind.call(sharedSet, NULL, TRUE, keys, values)}
    });

  }

  // Map(void):Map
  function Map() {

    // private references holders
    var
      keys = [],
      values = []
    ;

    // returns freshly new created
    // instanceof WeakMap in any case
    return create(MapPrototype, {
      // Map#delete(key:void*):boolean
      "delete": {value: bind.call(sharedDel, NULL, FALSE, keys, values)},
      //:was Map#get(key:void*[, d3fault:void*]):void*
      // Map#get(key:void*):void*
      get:      {value: bind.call(sharedGet, NULL, FALSE, keys, values)},
      // Map#has(key:void*):boolean
      has:      {value: bind.call(sharedHas, NULL, FALSE, keys, values)},
      // Map#set(key:void*, value:void*):void
      set:      {value: bind.call(sharedSet, NULL, FALSE, keys, values)}
      /*,
      // Map#size(void):number === Mozilla only so far
      size:     {value: bind.call(sharedSize, NULL, keys)},
      // Map#keys(void):Array === not in specs
      keys:     {value: boundSlice(keys)},
      // Map#values(void):Array === not in specs
      values:   {value: boundSlice(values)},
      // Map#iterate(callback:Function, context:void*):void ==> callback.call(context, key, value, index) === not in specs
      iterate:  {value: bind.call(sharedIterate, NULL, FALSE, keys, values)}
      //*/
    });

  }

  // Set(void):Set
  /**
   * to be really honest, I would rather pollute Array.prototype
   * in order to have Set like behavior
   * Object.defineProperties(Array.prototype, {
   *   add: {value: function add(value) {
   *     return -1 < this.indexOf(value) && !!this.push(value);
   *   }}
   *   has: {value: function has(value) {
   *     return -1 < this.indexOf(value);
   *   }}
   *   delete: {value: function delete(value) {
   *     var i = this.indexOf(value);
   *     return -1 < i && !!this.splice(i, 1);
   *   }}
   * });
   * ... anyway ...
   */
  function Set() {
    var
      keys = [],  // placeholder used simply to recycle functions
      values = [],// real storage
      has = bind.call(sharedHas, NULL, FALSE, values, keys)
    ;
    return create(SetPrototype, {
      // Set#delete(value:void*):boolean
      "delete": {value: bind.call(sharedDel, NULL, FALSE, values, keys)},
      // Set#has(value:void*):boolean
      has:      {value: has},
      // Set#add(value:void*):boolean
      add:      {value: bind.call(Set_add, NULL, FALSE, has, values)}
      /*,
      // Map#size(void):number === Mozilla only
      size:     {value: bind.call(sharedSize, NULL, values)},
      // Set#values(void):Array === not in specs
      values:   {value: boundSlice(values)},
      // Set#iterate(callback:Function, context:void*):void ==> callback.call(context, value, index) === not in specs
      iterate:  {value: bind.call(Set_iterate, NULL, FALSE, NULL, values)}
      //*/
    });
  }

  // common shared method recycled for all shims through bind
  function sharedDel(objectOnly, keys, values, key) {
    if (sharedHas(objectOnly, keys, values, key)) {
      keys.splice(i, 1);
      values.splice(i, 1);
    }
    // Aurora here does it while Canary doesn't
    return -1 < i;
  }

  function sharedGet(objectOnly, keys, values, key/*, d3fault*/) {
    return sharedHas(objectOnly, keys, values, key) ? values[i] : undefined; //d3fault;
  }

  function sharedHas(objectOnly, keys, values, key) {
    if (objectOnly && key !== Object(key)) {
      console.log(key);
      throw new TypeError("not a non-null object");
    }
    i = betterIndexOf.call(keys, key);
    return -1 < i;
  }

  function sharedSet(objectOnly, keys, values, key, value) {
    /* return */sharedHas(objectOnly, keys, values, key) ?
      values[i] = value
      :
      values[keys.push(key) - 1] = value
    ;
  }

  /* keys, values, and iterate related methods
  function boundSlice(values) {
    return function () {
      return slice.call(values);
    };
  }

  function sharedSize(keys) {
    return keys.length;
  }

  function sharedIterate(objectOnly, keys, values, callback, context) {
    for (var
      k = slice.call(keys), v = slice.call(values),
      i = 0, length = k.length;
      i < length; callback.call(context, k[i], v[i], i++)
    );
  }

  function Set_iterate(objectOnly, keys, values, callback, context) {
    for (var
      v = slice.call(values),
      i = 0, length = v.length;
      i < length; callback.call(context, v[i], i++)
    );
  }
  //*/

  // Set#add recycled through bind per each instanceof Set
  function Set_add(objectOnly, has, values, value) {
    /*return */(!has(value) && !!values.push(value));
  }

  // a more reliable indexOf
  function betterIndexOf(value) {
    if (value != value || value === 0) {
      for (i = this.length; i-- && !is(this[i], value););
    } else {
      i = indexOf.call(this, value);
    }
    return i;
  }

  // need for an empty constructor ...
  function Constructor(){}  // GC'ed if !!Object.create
  // ... so that new WeakMapInstance and new WeakMap
  // produces both an instanceof WeakMap

  var
    // shortcuts and ...
    NULL = null, TRUE = true, FALSE = false,
    notInNode = module == "undefined",
    window = notInNode ? this : global,
    module = notInNode ? {} : exports,
    Object = window.Object,
    WeakMapPrototype = WeakMap.prototype,
    MapPrototype = Map.prototype,
    SetPrototype = Set.prototype,
    defineProperty = Object.defineProperty,
    slice = [].slice,

    // Object.is(a, b) shim
    is = Object.is || function (a, b) {
      return a === b ?
        a !== 0 || 1 / a == 1 / b :
        a != a && b != b
      ;
    },

    // partial polyfill for this aim only
    bind = WeakMap.bind || function bind(context, objectOnly, keys, values) {
      // partial fast ad-hoc Function#bind polyfill if not available
      var callback = this;
      return function bound(key, value) {
        if (!!key === false) {
          console.log(arguments.caller.callee);
        };
        return callback.call(context, objectOnly, keys, values, key, value);
      };
    },

    create = Object.create || function create(proto, descriptor) {
      // partial ad-hoc Object.create shim if not available
      Constructor.prototype = proto;
      var object = new Constructor(), key;
      for (key in descriptor) {
        object[key] = descriptor[key].value;
      }
      return object;
    },

    indexOf = [].indexOf || function indexOf(value) {
      // partial fast Array#indexOf polyfill if not available
      for (i = this.length; i-- && this[i] !== value;);
      return i;
    },

    undefined,
    i // recycle ALL the variables !
  ;

  // ~indexOf.call([NaN], NaN) as future possible feature detection

  // used to follow FF behavior where WeakMap.prototype is a WeakMap itself
  WeakMap.prototype = WeakMapPrototype = WeakMap();
  Map.prototype = MapPrototype = Map();
  Set.prototype = SetPrototype = Set();

  // assign it to the global context
  // if already there, e.g. in node, export native
  window.WeakMap = module.WeakMap = window.WeakMap || WeakMap;
  window.Map = module.Map = window.Map || Map;
  window.Set = module.Set = window.Set || Set;

  /* probably not needed, add a slash to ensure non configurable and non writable
  if (defineProperty) {
    defineProperty(window, "WeakMap", {value: WeakMap});
    defineProperty(window, "Map", {value: Map});
    defineProperty(window, "Set", {value: Set});
  }
  //*/

  // that's pretty much it

}.call(
  this,
  typeof exports
));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/Users/tor/projects/patternlab-node/public/styleguide/js/gui.js":[function(require,module,exports){
/*jslint indent: 4*/
/*global window*/
'use strict';
var config = require('./config'),
    dataSaver = require('./data-saver'),
    urlHandler = require('./url-handler'),
    elGenContainer = document.getElementById('sg-gen-container'),
    elViewport = document.getElementById('sg-viewport'),
    elSizePx = document.querySelector('.sg-size-px'), //Px size input element in toolbar
    elSizeEms = document.querySelector('.sg-size-em'), //Em size input element in toolbar;
    discoID = false,
    discoMode = false,
    hayMode = false;

//Update Pixel and Em inputs
//'size' is the input number
//'unit' is the type of unit: either px or em. Default is px. Accepted values are 'px' and 'em'
//'target' is what inputs to update. Defaults to both
function updateSizeReading(size, unit, target) {
    var emSize = (unit === 'em' ? Math.floor(size * config.bodySize) : size),
        pxSize = (unit === 'em' ? size / config.bodySize : size);

    if (target === 'updatePxInput') {
        elSizePx.value = pxSize;
    } else if (target === 'updateEmInput') {
        elSizeEms.value = emSize;
    } else {
        elSizeEms.value = emSize;
        elSizePx.value = pxSize;
    }
}

function saveSize(size) {
    if (!dataSaver.findValue('vpWidth')) {
        dataSaver.addValue('vpWidth', size);
    } else {
        dataSaver.updateValue('vpWidth', size);
    }
}

/* Returns a random number between min and max */
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

//Resize the viewport
//'size' is the target size of the viewport
//'animate' is a boolean for switching the CSS animation on or off. 'animate' is true by default, but can be set to false for things like nudging and dragging
function sizeiframe(size, animate) {
    var theSize;

    if (size > config.maxViewportWidth) { //If the entered size is larger than the max allowed viewport size, cap value at max vp size
        theSize = config.maxViewportWidth;
    } else if (size < config.minViewportWidth) { //If the entered size is less than the minimum allowed viewport size, cap value at min vp size
        theSize = config.minViewportWidth;
    } else {
        theSize = size;
    }

    //Conditionally remove CSS animation class from viewport
    elGenContainer.classList.remove('vp-animate', animate);
    elViewport.classList.remove('vp-animate', animate);

    elGenContainer.style.width = (theSize + config.viewportResizeHandleWidth) + 'px'; //Resize viewport wrapper to desired size + size of drag resize handler
    elViewport.style.width = theSize + 'px'; //Resize viewport to desired size

    updateSizeReading(theSize); //Update values in toolbar
    saveSize(theSize); //Save current viewport to cookie
}

function updateViewportWidth(size) {
    size = parseInt(size, 10);
    elViewport.style.width = parseInt(size, 10) + 'px';
    elGenContainer.style.width = (size + 14) + 'px';

    updateSizeReading(size);
}

/* Disco Mode */
function disco() {
    sizeiframe(getRandom(config.minViewportWidth, config.sw));
}

function killDisco() {
    discoMode = false;
    clearInterval(discoID);
    discoID = false;
}

function startDisco() {
    discoMode = true;
    discoID = setInterval(disco, 800);
}

function toggleDisco() {
    if (!discoMode) {
        startDisco();
    } else {
        killDisco();
    }
}

//Stop Hay! Mode
function killHay() {
    var currentWidth = elViewport.offsetWidth;
    hayMode = false;
    elViewport.classList.remove('hay-mode');
    elGenContainer.classList.remove('hay-mode');
    sizeiframe(Math.floor(currentWidth));
}

// start Hay! mode
function startHay() {
    hayMode = true;
    elGenContainer.classList.remove('vp-animate');
    elGenContainer.style.width = (config.minViewportWidth + config.viewportResizeHandleWidth) + 'px';
    elViewport.classList.remove('vp-animate');
    elViewport.style.width = config.minViewportWidth + 'px';

    window.setTimeout(function () {
        elGenContainer.classList.add('hay-mode');
        elGenContainer.style.width = (config.maxViewportWidth + config.viewportResizeHandleWidth) + 'px';
        elViewport.classList.add('hay-mode');
        elViewport.style.width = config.maxViewportWidth + 'px';

        //todo this is not removed
        setInterval(function () {
            var vpSize = elViewport.offsetWidth;
            updateSizeReading(vpSize);
        }, 100);
    }, 200);
}

function toggleHay() {
    if (!hayMode) {
        startHay();
    } else {
        killHay();
    }
}

// handle when someone clicks on the grey area of the viewport so it auto-closes the nav
function closePanels() {
    // close up the menu
    var panels = document.querySelectorAll('.sg-acc-panel'),
        handles = document.querySelectorAll('.sg-acc-handle');

    [].forEach.call(panels, function (panel) {
        panel.classList.remove('active');
    });


    [].forEach.call(handles, function (handle) {
        handle.classList.remove('active');
    });
}

function init() {
    var origViewportWidth   = elViewport.offsetWidth,
        oGetVars            = urlHandler.getRequestVars(), // get the request vars
        vpWidth             = 0,
        trackViewportWidth  = true, // can toggle this feature on & off
        patternName         = 'all',
        patternPath         = '',
        iFramePath          = window.location.protocol + '//' + window.location.host + window.location.pathname.replace('index.html', '') + 'styleguide/html/styleguide.html';

    // capture the viewport width that was loaded and modify it so it fits with the pull bar
    elGenContainer.style.width = origViewportWidth + 'px';
    elViewport.style.width = (origViewportWidth - 14) + 'px';
    updateSizeReading(origViewportWidth - 14);

    // pre-load the viewport width
    if (oGetVars.h || oGetVars.hay) {
        startHay();
    } else if (oGetVars.d || oGetVars.disco) {
        startDisco();
    } else if (oGetVars.w || oGetVars.width) {
        vpWidth = oGetVars.w || oGetVars.width;
        vpWidth = vpWidth.indexOf('em') !== -1 ? Math.floor(Math.floor(vpWidth.replace('em', '')) * config.bodySize) : Math.floor(vpWidth.replace('px', ''));

        dataSaver.updateValue('vpWidth', vpWidth);
        updateViewportWidth(vpWidth);
    } else if (trackViewportWidth && dataSaver.findValue('vpWidth')) {
        updateViewportWidth(dataSaver.findValue('vpWidth'));
    }

    // load the iframe source
    if (oGetVars.p || oGetVars.pattern) {
        patternName = oGetVars.p || oGetVars.pattern;
        patternPath = urlHandler.getFileName(patternName);
        iFramePath  = (patternPath !== '') ? window.location.protocol + '//' + window.location.host + window.location.pathname.replace('index.html', '') + patternPath : iFramePath;
    }

    if (patternName !== 'all') {
        document.getElementById('title').innerHTML = 'Pattern Lab - ' + patternName;
        window.history.replaceState({ 'pattern': patternName }, null, null);
    }

    document.getElementById('sg-raw').setAttribute('href', urlHandler.getFileName(patternName));

    urlHandler.skipBack = true;
    document.getElementById('sg-viewport').contentWindow.location.replace(iFramePath);
}

module.exports = {
    sizeiframe          : sizeiframe,
    getRandom           : getRandom,
    updateViewportWidth : updateViewportWidth,
    disco               : disco,
    killDisco           : killDisco,
    startDisco          : startDisco,
    startHay            : startHay,
    killHay             : killHay,
    toggleDisco         : toggleDisco,
    toggleHay           : toggleHay,
    updateSizeReading   : updateSizeReading,
    closePanels         : closePanels,
    init                : init
};
},{"./config":"/Users/tor/projects/patternlab-node/public/styleguide/js/config.js","./data-saver":"/Users/tor/projects/patternlab-node/public/styleguide/js/data-saver.js","./url-handler":"/Users/tor/projects/patternlab-node/public/styleguide/js/url-handler.js"}],"/Users/tor/projects/patternlab-node/public/styleguide/js/handlers.js":[function(require,module,exports){
/*jslint indent: 4, regexp: true*/
/*global window*/
var EventDelegator  = require('./eventDelegator/eventDelegator'),
    config          = require('./config'),
    dataSaver       = require('./data-saver'),
    gui             = require('./gui'),
    urlHandler      = require('./url-handler'),
    delegator       = new EventDelegator(document.documentElement),
    elViewport      = document.getElementById('sg-viewport'),
    elCover         = document.getElementById('sg-cover');

function _parents(element, selector, cb) {
    var target = element.parentNode;

    while (target && target !== document.documentElement) {
        if (target.matches(selector)) {
            cb(target);
        }
        target = target.parentNode;
    }
}

function _siblings(element, selector, cb) {
    var target = element.parentNode.children[0];

    while (target) {
        if (target.matches(selector)) {
            cb(target);
        }
        target = target.nextSibling;
    }
}

function _toggleUL(e) {
    e.preventDefault();
    var target = e.target.parentNode;

    _parents(target, 'ul', function (el) {
        el.classList.toggle('active');
    });
}

function _size(num) {
    gui.killDisco();
    gui.killHay();
    gui.sizeiframe(num);
}

delegator
    // handles widening the "viewport"
    //   1. on "mousedown" store the click location
    //   2. make a hidden div visible so that it can track mouse movements and make sure the pointer doesn't get lost in the iframe
    //   3. on "mousemove" calculate the math, save the results to a cookie, and update the viewport
    .on('mousedown', '#sg-rightpull', function (e) {
        // capture default data
        var origClientX = e.clientX,
            origViewportWidth = elViewport.offsetWidth;

        // show the cover
        elCover.style.display = 'block';

        // add the mouse move event and capture data. also update the viewport width
        delegator.on('mousemove', '#sg-cover', function (e) {
            var viewportWidth = (origClientX > e.clientX) ?
                    origViewportWidth - ((origClientX - e.clientX) * 2) :
                    origViewportWidth + ((e.clientX - origClientX) * 2);

            if (viewportWidth > config.minViewportWidth) {
                if (!dataSaver.findValue('vpWidth')) {
                    dataSaver.addValue('vpWidth', viewportWidth);
                } else {
                    dataSaver.updateValue('vpWidth', viewportWidth);
                }

                gui.sizeiframe(viewportWidth, false);
            }
        });
    })

    // on "mouseup" we unbind the "mousemove" event and hide the cover again
    .on('mouseup', 'body', function () {
        delegator.off('mousemove', '#sg-cover');
        elCover.style.display = 'none';
    })

    /* Pattern Lab accordion dropdown */
    .on('click', '.sg-acc-handle', function (e) {
        var next = e.target;

        while (next && (next.nodeType !== 1 || !next.matches('.sg-acc-panel'))) {
            next = next.nextSibling;
        }

        e.preventDefault();

        e.target.classList.toggle('active');
        if (next) {
            next.classList.toggle('active');
        }
    })

    .on('click', '.sg-nav-toggle', function (e) {
        e.preventDefault();
        document.querySelector('.sg-nav-container').classList.toggle('active');
    })

    //View (containing clean, code, raw, etc options) Trigger
    .on('click', '#sg-t-toggle', _toggleUL)

    //Size Trigger
    .on('click', '#sg-size-toggle', _toggleUL)

    //Phase View Events
    .on('click', '.sg-size[data-size]', function (e) {
        e.preventDefault();
        gui.killDisco();
        gui.killHay();

        var val = e.target.getAttribute('data-size');

        if (val.indexOf('px') > -1) {
            config.bodySize = 1;
        }

        val = val.replace(/[^\d.\-]/g, '');
        gui.sizeiframe(Math.floor(val * config.bodySize));
    })

    //Size View Events

    //Click Size Small Button
    .on('click', '#sg-size-s', function (e) {
        e.preventDefault();
        _size(gui.getRandom(config.minViewportWidth, 500));
    })

    //Click Size Medium Button
    .on('click', '#sg-size-m', function (e) {
        e.preventDefault();
        _size(gui.getRandom(500, 800));
    })

    //Click Size Large Button
    .on('click', '#sg-size-l', function (e) {
        e.preventDefault();
        _size(gui.getRandom(800, 1200));
    })

    //Click Full Width Button
    .on('click', '#sg-size-full', function (e) { //Resets 
        e.preventDefault();
        _size(config.sw);
    })

    //Click Random Size Button
    .on('click', '#sg-size-random', function (e) {
        e.preventDefault();
        _size(gui.getRandom(config.minViewportWidth, config.sw));
    })

    //Click for Disco Mode, which resizes the viewport randomly
    .on('click', '#sg-size-disco', function (e) {
        e.preventDefault();
        gui.killHay();
        gui.toggleDisco();
    })

    //Stephen Hay Mode - "Start with the small screen first, then expand until it looks like shit. Time for a breakpoint!"
    .on('click', '#sg-size-hay', function (e) {
        e.preventDefault();
        gui.killDisco();
        gui.toggleHay();
    })

    //Pixel input
    .on('keydown', '.sg-size-px', function (e) {
        var val = parseInt(e.target.value, 10);

        if (e.keyCode === 38) { //If the up arrow key is hit
            val++;
            gui.sizeiframe(val, false);
        } else if (e.keyCode === 40) { //If the down arrow key is hit
            val--;
            gui.sizeiframe(val, false);
        } else if (e.keyCode === 13) { //If the Enter key is hit
            e.preventDefault();
            gui.sizeiframe(val); //Size Iframe to value of text box
            e.target.blur();
        }
    })

    .on('keyup', '.sg-size-px', function (e) {
        var val = parseInt(e.target.value, 10);
        gui.updateSizeReading(val, 'px', 'updateEmInput');
    })

    //Em input
    .on('keydown', '.sg-size-em', function (e) {
        var val = parseFloat(e.target.value);

        if (e.keyCode === 38) { //If the up arrow key is hit
            val++;
            gui.sizeiframe(Math.floor(val * config.bodySize), false);
        } else if (e.keyCode === 40) { //If the down arrow key is hit
            val--;
            gui.sizeiframe(Math.floor(val * config.bodySize), false);
        } else if (e.keyCode === 13) { //If the Enter key is hit
            e.preventDefault();
            gui.sizeiframe(Math.floor(val * config.bodySize)); //Size Iframe to value of text box
        }
    })

    .on('keyup', '.sg-size-em', function (e) {
        var val = parseFloat(e.target.value);
        gui.updateSizeReading(val, 'em', 'updatePxInput');
    })

    // handle the MQ click
    .on('click', '#sg-mq a', function (e) {
        e.preventDefault();
        var val     = e.target.innerHTML,
            type    = parseInt((val.indexOf('px') !== -1 ? 'px' : 'em'), 10);

        val = val.replace(type, '');

        gui.sizeiframe((type === 'px' ? val : val * config.bodySize), true);
    })

    // update the iframe with the source from clicked element in pull down menu. also close the menu
    // having it outside fixes an auto-close bug i ran into
    .on('click', '.sg-nav a', function (e) {
        if (e.target.matches('.sg-acc-handle')) {
            return;
        }
        e.preventDefault();

        // update the iframe via the history api handler
        document.getElementById('sg-viewport').contentWindow.postMessage(
            {
                'path': urlHandler.getFileName(e.target.getAttribute('data-patternpartial'))
            },
            urlHandler.targetOrigin
        );

        // close up the menu
        _parents(e.target, '.sg-acc-panel', function (el) {
            el.classList.toggle('active');
            _siblings(el, '.sg-acc-handle', function (el) {
                el.classList.toggle('active');
            });
        });
        return false;
    })

    .on('click', '#sg-vp-wrap', function () {
        gui.closePanels();
    });

window.addEventListener('resize', function () {
    config.sw = document.body.clientWidth;
    config.sh = document.body.clientHeight;
}, false);

window.addEventListener('message', function receiveIframeMessage(event) {
    // does the origin sending the message match the current host? if not dev/null the request
    if ((window.location.protocol !== 'file:') && (event.origin !== window.location.protocol + '//' + window.location.host)) {
        return;
    }

    if (event.data.bodyclick !== undefined) {
        gui.closePanels();
    } else if (event.data.patternpartial !== undefined) {
        if (!urlHandler.skipBack) {
            if (window.history.state === null || window.history.state.pattern !== event.data.patternpartial) {
                urlHandler.pushPattern(event.data.patternpartial, event.data.path);
            }
            if (window.wsnConnected) {
                console.log('wsn');
                var iFramePath = urlHandler.getFileName(event.data.patternpartial);
                window.wsn.send('{"url": "' + iFramePath + '", "patternpartial": "' + event.data.patternpartial + '" }');
            }
        }

        // for testing purposes
        //console.log(event.data.lineage);

        // reset the defaults
        urlHandler.skipBack = false;
    }
}, false);
},{"./config":"/Users/tor/projects/patternlab-node/public/styleguide/js/config.js","./data-saver":"/Users/tor/projects/patternlab-node/public/styleguide/js/data-saver.js","./eventDelegator/eventDelegator":"/Users/tor/projects/patternlab-node/public/styleguide/js/eventDelegator/eventDelegator.js","./gui":"/Users/tor/projects/patternlab-node/public/styleguide/js/gui.js","./url-handler":"/Users/tor/projects/patternlab-node/public/styleguide/js/url-handler.js"}],"/Users/tor/projects/patternlab-node/public/styleguide/js/main.js":[function(require,module,exports){
var gui      = require('./gui');

require('./handlers');

gui.init();
},{"./gui":"/Users/tor/projects/patternlab-node/public/styleguide/js/gui.js","./handlers":"/Users/tor/projects/patternlab-node/public/styleguide/js/handlers.js"}],"/Users/tor/projects/patternlab-node/public/styleguide/js/url-handler.js":[function(require,module,exports){
/*!
 * URL Handler - v0.1
 *
 * Copyright (c) 2013 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Helps handle the initial iFrame source. Parses a string to see if it matches
 * an expected pattern in Pattern Lab. Supports Pattern Labs fuzzy pattern partial
 * matching style.
 *
 */

var urlHandler = {
    
    // set-up some default vars
    skipBack: false,
    targetOrigin: (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host,
    
    /**
    * get the real file name for a given pattern name
    * @param  {String}       the shorthand partials syntax for a given pattern
    *
    * @return {String}       the real file path
    */
    getFileName: function (name) {
        
        var baseDir     = "patterns";
        var fileName    = "";
        
        if (name == undefined) {
            return fileName;
        }
        
        if (name == "all") {
            return "styleguide/html/styleguide.html";
        }
        
        var paths = (name.indexOf("viewall-") != -1) ? viewAllPaths : patternPaths;
        nameClean = name.replace("viewall-","");
        
        // look at this as a regular pattern
        var bits        = this.getPatternInfo(nameClean, paths);
        var patternType = bits[0];
        var pattern     = bits[1];
        
        if ((paths[patternType] != undefined) && (paths[patternType][pattern] != undefined)) {
            
            fileName = paths[patternType][pattern];
            
        } else if (paths[patternType] != undefined) {
            
            for (patternMatchKey in paths[patternType]) {
                if (patternMatchKey.indexOf(pattern) != -1) {
                    fileName = paths[patternType][patternMatchKey];
                    break;
                }
            }
        
        }
        
        if (fileName == "") {
            return fileName;
        }
        
        var regex = /\//g;
        if ((name.indexOf("viewall-") != -1) && (fileName != "")) {
            fileName = baseDir+"/"+fileName.replace(regex,"-")+"/index.html";
        } else if (fileName != "") {
            fileName = baseDir+"/"+fileName.replace(regex,"-")+"/"+fileName.replace(regex,"-")+".html";
        }
        
        return fileName;
    },
    
    /**
    * break up a pattern into its parts, pattern type and pattern name
    * @param  {String}       the shorthand partials syntax for a given pattern
    * @param  {Object}       the paths to be compared
    *
    * @return {Array}        the pattern type and pattern name
    */
    getPatternInfo: function (name, paths) {
        var patternBits = name.split("-");
        
        var i = 1;
        var c = patternBits.length;
        
        var patternType = patternBits[0];
        while ((paths[patternType] == undefined) && (i < c)) {
            patternType += "-"+patternBits[i];
            i++;
        }
        
        pattern = name.slice(patternType.length+1,name.length);
        
        return [patternType, pattern];
        
    },
    
    /**
    * search the request vars for a particular item
    *
    * @return {Object}       a search of the window.location.search vars
    */
    getRequestVars: function() {
        
        // the following is taken from https://developer.mozilla.org/en-US/docs/Web/API/window.location
        var oGetVars = new (function (sSearch) {
          if (sSearch.length > 1) {
            for (var aItKey, nKeyId = 0, aCouples = sSearch.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
              aItKey = aCouples[nKeyId].split("=");
              this[unescape(aItKey[0])] = aItKey.length > 1 ? unescape(aItKey[1]) : "";
            }
          }
        })(window.location.search);
        
        return oGetVars;
        
    },
    
    /**
    * push a pattern onto the current history based on a click
    * @param  {String}       the shorthand partials syntax for a given pattern
    * @param  {String}       the path given by the loaded iframe
    */
    pushPattern: function (pattern, givenPath) {
        var data         = { "pattern": pattern };
        var fileName     = urlHandler.getFileName(pattern);
        var expectedPath = window.location.protocol+"//"+window.location.host+window.location.pathname.replace("public/index.html","public/")+fileName;
        if (givenPath != expectedPath) {
            // make sure to update the iframe because there was a click
            document.getElementById("sg-viewport").contentWindow.postMessage( { "path": fileName }, urlHandler.targetOrigin);
        } else {
            // add to the history
            var addressReplacement = (window.location.protocol == "file:") ? null : window.location.protocol+"//"+window.location.host+window.location.pathname.replace("index.html","")+"?p="+pattern;
            history.pushState(data, null, addressReplacement);
            document.getElementById("title").innerHTML = "Pattern Lab - "+pattern;
            document.getElementById("sg-raw").setAttribute("href",urlHandler.getFileName(pattern));
        }
    },
    
    /**
    * based on a click forward or backward modify the url and iframe source
    * @param  {Object}      event info like state and properties set in pushState()
    */
    popPattern: function (e) {
        
        var state = e.state;
        
        if (state == null) {
            this.skipBack = false;
            return;
        } else if (state != null) {
            var patternName = state.pattern;
        } 
        
        var iFramePath = "";
        iFramePath = this.getFileName(patternName);
        if (iFramePath == "") {
            iFramePath = "styleguide/html/styleguide.html";
        }
        
        document.getElementById("sg-viewport").contentWindow.postMessage( { "path": iFramePath }, urlHandler.targetOrigin);
        document.getElementById("title").innerHTML = "Pattern Lab - "+patternName;
        document.getElementById("sg-raw").setAttribute("href",urlHandler.getFileName(patternName));
        
        if (wsnConnected) {
            wsn.send( '{"url": "'+iFramePath+'", "patternpartial": "'+patternName+'" }' );
        }
        
    }
    
}

/**
* handle the onpopstate event
*/
window.onpopstate = function (event) {
    urlHandler.skipBack = true;
    urlHandler.popPattern(event);
}

module.exports = window.urlHandler = urlHandler;
},{}]},{},["/Users/tor/projects/patternlab-node/public/styleguide/js/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3Rvci9wcm9qZWN0cy9wYXR0ZXJubGFiLW5vZGUvcHVibGljL3N0eWxlZ3VpZGUvanMvY29uZmlnLmpzIiwiL1VzZXJzL3Rvci9wcm9qZWN0cy9wYXR0ZXJubGFiLW5vZGUvcHVibGljL3N0eWxlZ3VpZGUvanMvY29va2llLmpzIiwiL1VzZXJzL3Rvci9wcm9qZWN0cy9wYXR0ZXJubGFiLW5vZGUvcHVibGljL3N0eWxlZ3VpZGUvanMvZGF0YS1zYXZlci5qcyIsIi9Vc2Vycy90b3IvcHJvamVjdHMvcGF0dGVybmxhYi1ub2RlL3B1YmxpYy9zdHlsZWd1aWRlL2pzL2V2ZW50RGVsZWdhdG9yL2V2ZW50RGVsZWdhdG9yLmpzIiwiL1VzZXJzL3Rvci9wcm9qZWN0cy9wYXR0ZXJubGFiLW5vZGUvcHVibGljL3N0eWxlZ3VpZGUvanMvZXZlbnREZWxlZ2F0b3IvbWF0Y2hlcy5qcyIsIi9Vc2Vycy90b3IvcHJvamVjdHMvcGF0dGVybmxhYi1ub2RlL3B1YmxpYy9zdHlsZWd1aWRlL2pzL2V2ZW50RGVsZWdhdG9yL3dlYWtNYXBTZXQuanMiLCIvVXNlcnMvdG9yL3Byb2plY3RzL3BhdHRlcm5sYWItbm9kZS9wdWJsaWMvc3R5bGVndWlkZS9qcy9ndWkuanMiLCIvVXNlcnMvdG9yL3Byb2plY3RzL3BhdHRlcm5sYWItbm9kZS9wdWJsaWMvc3R5bGVndWlkZS9qcy9oYW5kbGVycy5qcyIsIi9Vc2Vycy90b3IvcHJvamVjdHMvcGF0dGVybmxhYi1ub2RlL3B1YmxpYy9zdHlsZWd1aWRlL2pzL21haW4uanMiLCIvVXNlcnMvdG9yL3Byb2plY3RzL3BhdHRlcm5sYWItbm9kZS9wdWJsaWMvc3R5bGVndWlkZS9qcy91cmwtaGFuZGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBtaW5WaWV3cG9ydFdpZHRoICAgICAgICAgICAgOiAyNDAsIC8vTWluaW11bSBTaXplIGZvciBWaWV3cG9ydFxuICAgIG1heFZpZXdwb3J0V2lkdGggICAgICAgICAgICA6IDI2MDAsIC8vTWF4aXVtdW0gU2l6ZSBmb3IgVmlld3BvcnRcbiAgICB2aWV3cG9ydFJlc2l6ZUhhbmRsZVdpZHRoICAgOiAxNCwgLy9XaWR0aCBvZiB0aGUgdmlld3BvcnQgZHJhZy10by1yZXNpemUgaGFuZGxlXG4gICAgYm9keVNpemUgICAgICAgICAgICAgICAgICAgIDogcGFyc2VJbnQod2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSkuZ2V0UHJvcGVydHlWYWx1ZSgnZm9udC1zaXplJykpLFxuICAgIHN3ICAgICAgICAgICAgICAgICAgICAgICAgICA6IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGgsIC8vVmlld3BvcnQgV2lkdGhcbiAgICBzaCAgICAgICAgICAgICAgICAgICAgICAgICAgOiBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodCAvL1ZpZXdwb3J0IEhlaWdodFxufSIsIi8qanNsaW50IGluZGVudDogNCovXG4vKmdsb2JhbCB3aW5kb3cqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGx1c2VzID0gL1xcKy9nO1xuXG5mdW5jdGlvbiByYXcocykge1xuICAgIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVkKHMpIHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHMucmVwbGFjZShwbHVzZXMsICcgJykpO1xufVxuXG5mdW5jdGlvbiBDb29raWUob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHzCoHt9O1xufVxuXG5Db29raWUucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgYztcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fMKge307XG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLm9wdGlvbnMpLmV2ZXJ5KGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIG9wdGlvbnNba2V5XSA9IHRoaXMub3B0aW9uc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMuZXhwaXJlcyA9IC0xO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5leHBpcmVzID09PSAnbnVtYmVyJykge1xuICAgICAgICB2YXIgZGF5cyAgICA9IG9wdGlvbnMuZXhwaXJlcyxcbiAgICAgICAgICAgIHQ7XG5cbiAgICAgICAgdCA9IG9wdGlvbnMuZXhwaXJlcyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHQuc2V0RGF0ZSh0LmdldERhdGUoKSArIGRheXMpO1xuICAgIH1cblxuICAgIHZhbHVlID0gb3B0aW9ucy5qc29uID8gSlNPTi5zdHJpbmdpZnkodmFsdWUpIDogU3RyaW5nKHZhbHVlKTtcblxuICAgIGMgPSBbXG4gICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChrZXkpLCAnPScsIG9wdGlvbnMucmF3ID8gdmFsdWUgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpLFxuICAgICAgICBvcHRpb25zLmV4cGlyZXMgPyAnOyBleHBpcmVzPScgKyBvcHRpb25zLmV4cGlyZXMudG9VVENTdHJpbmcoKSA6ICcnLCAvLyB1c2UgZXhwaXJlcyBhdHRyaWJ1dGUsIG1heC1hZ2UgaXMgbm90IHN1cHBvcnRlZCBieSBJRVxuICAgICAgICBvcHRpb25zLnBhdGggICAgPyAnOyBwYXRoPScgKyBvcHRpb25zLnBhdGggOiAnJyxcbiAgICAgICAgb3B0aW9ucy5kb21haW4gID8gJzsgZG9tYWluPScgKyBvcHRpb25zLmRvbWFpbiA6ICcnLFxuICAgICAgICBvcHRpb25zLnNlY3VyZSAgPyAnOyBzZWN1cmUnIDogJydcbiAgICBdLmpvaW4oJycpO1xuICAgIGRvY3VtZW50LmNvb2tpZSA9IGM7XG4gICAgcmV0dXJuIGM7XG59O1xuXG5Db29raWUucHJvdG90eXBlLnJlYWQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgLy8gcmVhZFxuICAgIHZhciBkZWNvZGUgID0gdGhpcy5vcHRpb25zLnJhdyA/IHJhdyA6IGRlY29kZWQsXG4gICAgICAgIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsgJyksXG4gICAgICAgIGksXG4gICAgICAgIGwsXG4gICAgICAgIHBhcnRzLFxuICAgICAgICBjb29raWU7XG5cbiAgICBmb3IgKGkgPSAwLCBsID0gY29va2llcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgIGlmIChkZWNvZGUocGFydHMuc2hpZnQoKSkgPT09IGtleSkge1xuICAgICAgICAgICAgY29va2llID0gZGVjb2RlKHBhcnRzLmpvaW4oJz0nKSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmpzb24gPyBKU09OLnBhcnNlKGNvb2tpZSkgOiBjb29raWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkNvb2tpZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGtleSwgb3B0aW9ucykge1xuICAgIGlmICh0aGlzLnJlYWQoa2V5KSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLndyaXRlKGtleSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvb2tpZTsiLCIvKmpzbGludCBpbmRlbnQ6IDQqL1xuLypnbG9iYWwgd2luZG93Ki9cbid1c2Ugc3RyaWN0JztcbnZhciBDb29raWUgPSByZXF1aXJlKCcuL2Nvb2tpZScpLFxuICAgIGNvb2tpZSA9IG5ldyBDb29raWUoKTtcblxuLyohXG4gKiBEYXRhIFNhdmVyIC0gdjAuMVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMyBEYXZlIE9sc2VuLCBodHRwOi8vZG1vbHNlbi5jb21cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG5cbnZhciBEYXRhU2F2ZXIgPSB7XG5cbiAgICAvLyB0aGUgbmFtZSBvZiB0aGUgY29va2llIHRvIHN0b3JlIHRoZSBkYXRhIGluXG4gICAgY29va2llTmFtZTogXCJwYXR0ZXJubGFiXCIsXG5cbiAgICAvKipcbiAgICAqIEFkZCBhIGdpdmVuIHZhbHVlIHRvIHRoZSBjb29raWVcbiAgICAqIEBwYXJhbSAge1N0cmluZ30gICAgICAgdGhlIG5hbWUgb2YgdGhlIGtleVxuICAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgICB0aGUgdmFsdWVcbiAgICAqL1xuICAgIGFkZFZhbHVlOiBmdW5jdGlvbiAobmFtZSwgdmFsKSB7XG4gICAgICAgIHZhciBjb29raWVWYWwgPSBjb29raWUucmVhZCh0aGlzLmNvb2tpZU5hbWUpO1xuICAgICAgICBpZiAoKGNvb2tpZVZhbCA9PT0gbnVsbCkgfHwgKGNvb2tpZVZhbCA9PT0gXCJcIikpIHtcbiAgICAgICAgICAgIGNvb2tpZVZhbCA9IG5hbWUgKyBcIn5cIiArIHZhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvb2tpZVZhbCA9IGNvb2tpZVZhbCArIFwifFwiICsgbmFtZSArIFwiflwiICsgdmFsO1xuICAgICAgICB9XG4gICAgICAgIGNvb2tpZS53cml0ZSh0aGlzLmNvb2tpZU5hbWUsIGNvb2tpZVZhbCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICogVXBkYXRlIGEgdmFsdWUgZm91bmQgaW4gdGhlIGNvb2tpZS4gSWYgdGhlIGtleSBkb2Vzbid0IGV4aXN0IGFkZCB0aGUgdmFsdWVcbiAgICAqIEBwYXJhbSAge1N0cmluZ30gICAgICAgdGhlIG5hbWUgb2YgdGhlIGtleVxuICAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgICB0aGUgdmFsdWVcbiAgICAqL1xuICAgIHVwZGF0ZVZhbHVlOiBmdW5jdGlvbiAobmFtZSwgdmFsKSB7XG4gICAgICAgIGlmICh0aGlzLmZpbmRWYWx1ZShuYW1lKSkge1xuICAgICAgICAgICAgdmFyIHVwZGF0ZUNvb2tpZVZhbHMgPSBcIlwiLFxuICAgICAgICAgICAgICAgIGNvb2tpZVZhbHMgPSBjb29raWUucmVhZCh0aGlzLmNvb2tpZU5hbWUpLnNwbGl0KFwifFwiKSxcbiAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgIGwsXG4gICAgICAgICAgICAgICAgZmllbGRWYWxzO1xuICAgICAgICAgICAgZm9yIChpID0gMCwgbCA9IGNvb2tpZVZhbHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZmllbGRWYWxzID0gY29va2llVmFsc1tpXS5zcGxpdChcIn5cIik7XG4gICAgICAgICAgICAgICAgaWYgKGZpZWxkVmFsc1swXSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHNbMV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb29raWVWYWxzICs9IFwifFwiICsgZmllbGRWYWxzWzBdICsgXCJ+XCIgKyBmaWVsZFZhbHNbMV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ29va2llVmFscyArPSBmaWVsZFZhbHNbMF0gKyBcIn5cIiArIGZpZWxkVmFsc1sxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb29raWUud3JpdGUodGhpcy5jb29raWVOYW1lLCB1cGRhdGVDb29raWVWYWxzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWRkVmFsdWUobmFtZSwgdmFsKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAqIFJlbW92ZSB0aGUgZ2l2ZW4ga2V5XG4gICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAgIHRoZSBuYW1lIG9mIHRoZSBrZXlcbiAgICAqL1xuICAgIHJlbW92ZVZhbHVlOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICB2YXIgdXBkYXRlQ29va2llVmFscyA9IFwiXCIsXG4gICAgICAgICAgICBjb29raWVWYWxzID0gY29va2llLnJlYWQodGhpcy5jb29raWVOYW1lKS5zcGxpdChcInxcIiksXG4gICAgICAgICAgICBrID0gMCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBsLFxuICAgICAgICAgICAgZmllbGRWYWxzO1xuICAgICAgICBmb3IgKGkgPSAwLCBsID0gY29va2llVmFscy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGZpZWxkVmFscyA9IGNvb2tpZVZhbHNbaV0uc3BsaXQoXCJ+XCIpO1xuICAgICAgICAgICAgaWYgKGZpZWxkVmFsc1swXSAhPT0gbmFtZSkge1xuICAgICAgICAgICAgICAgIGlmIChrID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNvb2tpZVZhbHMgKz0gZmllbGRWYWxzWzBdICsgXCJ+XCIgKyBmaWVsZFZhbHNbMV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ29va2llVmFscyArPSBcInxcIiArIGZpZWxkVmFsc1swXSArIFwiflwiICsgZmllbGRWYWxzWzFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBrKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29va2llLndyaXRlKHRoaXMuY29va2llTmFtZSwgdXBkYXRlQ29va2llVmFscyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICogRmluZCB0aGUgdmFsdWUgdXNpbmcgdGhlIGdpdmVuIGtleVxuICAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgICB0aGUgbmFtZSBvZiB0aGUga2V5XG4gICAgKlxuICAgICogQHJldHVybiB7U3RyaW5nfSAgICAgICB0aGUgdmFsdWUgb2YgdGhlIGtleSBvciBmYWxzZSBpZiB0aGUgdmFsdWUgaXNuJ3QgZm91bmRcbiAgICAqL1xuICAgIGZpbmRWYWx1ZTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgaWYgKGNvb2tpZS5yZWFkKHRoaXMuY29va2llTmFtZSkpIHtcbiAgICAgICAgICAgIHZhciBjb29raWVWYWxzID0gY29va2llLnJlYWQodGhpcy5jb29raWVOYW1lKS5zcGxpdChcInxcIiksXG4gICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICBsLFxuICAgICAgICAgICAgICAgIGZpZWxkVmFscztcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGwgPSBjb29raWVWYWxzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgIGZpZWxkVmFscyA9IGNvb2tpZVZhbHNbaV0uc3BsaXQoXCJ+XCIpO1xuICAgICAgICAgICAgICAgIGlmIChmaWVsZFZhbHNbMF0gPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpZWxkVmFsc1sxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVNhdmVyOyIsIi8qanNsaW50IGluZGVudDogNCovXG4vKmdsb2JhbCB3aW5kb3cqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIFdNICAgICAgICAgID0gcmVxdWlyZSgnLi93ZWFrTWFwU2V0JykuV2Vha01hcCxcbiAgICBkZWxlZ2F0b3JzICA9IG5ldyBXTSgpO1xuXG5yZXF1aXJlKCcuL21hdGNoZXMuanMnKTtcblxuZnVuY3Rpb24gRXZlbnREZWxlZ2F0b3IoZWxlbWVudCkge1xuICAgIHZhciBkZWxlZ2F0b3IgPSBkZWxlZ2F0b3JzLmdldChlbGVtZW50KTtcblxuICAgIGlmIChkZWxlZ2F0b3IpIHtcbiAgICAgICAgcmV0dXJuIGRlbGVnYXRvcjtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50cyAgICAgPSB7fTtcbiAgICB0aGlzLmVsZW1lbnQgICAgPSBlbGVtZW50O1xuICAgIHRoaXMuaGFuZGxlcnMgICA9IHt9O1xuICAgIGRlbGVnYXRvcnMuc2V0KGVsZW1lbnQsIHRoaXMpO1xufVxuXG5FdmVudERlbGVnYXRvci5wcm90b3R5cGUuX21hdGNoID0gZnVuY3Rpb24gKHNlbGVjdG9ycywgZSkge1xuICAgIHZhciB0YXJnZXQgID0gZS50YXJnZXQsXG4gICAgICAgIHNlbGVjdG9yO1xuXG4gICAgZnVuY3Rpb24gX3J1bkNhbGxiYWNrKHNlbGVjdG9yKSB7XG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgbDtcbiAgICAgICAgZm9yIChpID0gMCwgbCA9IHNlbGVjdG9yc1tzZWxlY3Rvcl0ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBzZWxlY3RvcnNbc2VsZWN0b3JdW2ldKGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHdoaWxlICh0YXJnZXQgIT09IHRoaXMuZWxlbWVudCkge1xuICAgICAgICBmb3IgKHNlbGVjdG9yIGluIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9ycy5oYXNPd25Qcm9wZXJ0eShzZWxlY3RvcikgJiYgdGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgX3J1bkNhbGxiYWNrKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhcmdldC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgfVxufTtcblxuRXZlbnREZWxlZ2F0b3IucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKHR5cGUsIHNlbGVjdG9yLCBjYikge1xuICAgIC8vdG9kbyBzdXBwb3J0IGVsZW1lbnRzIGFzIHNlbGVjdG9yXG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlcihlKSB7XG4gICAgICAgIF90aGlzLl9tYXRjaChfdGhpcy5ldmVudHNbdHlwZV0sIGUpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5ldmVudHNbdHlwZV0pIHtcbiAgICAgICAgdGhpcy5ldmVudHNbdHlwZV0gPSB7fTtcblxuICAgICAgICB0aGlzLmhhbmRsZXJzW3R5cGVdID0gaGFuZGxlcjtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzW3R5cGVdW3NlbGVjdG9yXSA9IHRoaXMuZXZlbnRzW3R5cGVdW3NlbGVjdG9yXSB8fMKgW107XG5cbiAgICBpZiAodGhpcy5ldmVudHNbdHlwZV1bc2VsZWN0b3JdLmluZGV4T2YoY2IpID09PSAtMSkge1xuICAgICAgICB0aGlzLmV2ZW50c1t0eXBlXVtzZWxlY3Rvcl0ucHVzaChjYik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnREZWxlZ2F0b3IucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uICh0eXBlLCBzZWxlY3RvciwgY2IpIHtcbiAgICBpZiAodHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuZXZlbnRzKS5ldmVyeShmdW5jdGlvbiAoZXZ0VHlwZSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZ0VHlwZSwgdGhpcy5oYW5kbGVyc1tldnRUeXBlXSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZXZlbnRzID0ge307XG4gICAgfSBlbHNlIGlmIChzZWxlY3RvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vcmVtb3ZlIGFsbCBvZiBvbmUgdHlwZVxuICAgICAgICBpZiAodGhpcy5ldmVudHNbdHlwZV0pIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIHRoaXMuaGFuZGxlcnNbdHlwZV0pO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZXZlbnRzW3R5cGVdO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuaGFuZGxlcnNbdHlwZV07XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNiID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICAgICAgICBpZiAodGhpcy5ldmVudHNbdHlwZV0gJiYgdGhpcy5ldmVudHNbdHlwZV1bc2VsZWN0b3JdKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5ldmVudHNbdHlwZV1bc2VsZWN0b3JdO1xuICAgICAgICAgICAgLy8gUmVtb3ZlIGV2ZW50bGlzdGVuZXIgaWYgbm8gc2VsZWN0b3JzIGFyZSBwcmVzZW50XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5ldmVudHNbdHlwZV0pLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMub2ZmKHR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgICAgICAgdmFyIGkgPSB0aGlzLmV2ZW50c1t0eXBlXVtzZWxlY3Rvcl0uaW5kZXhPZihjYik7XG5cbiAgICAgICAgaWYgKGkgIT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c1t0eXBlXVtzZWxlY3Rvcl0uc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnREZWxlZ2F0b3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnRXZlbnREZWxlZ2F0b3InO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudERlbGVnYXRvcjsiLCIvKmpzbGludCBpbmRlbnQ6IDQqL1xuLypnbG9iYWwgd2luZG93Ki9cbi8qKlxuICogUG9seWZpbGwgZm9yIEVsZW1lbnQubWF0Y2hlc1xuICoqL1xuZnVuY3Rpb24gYWRkUG9seWZpbGwoRWxlbWVudFByb3RvdHlwZSkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGlmIChFbGVtZW50UHJvdG90eXBlLm1hdGNoZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgRWxlbWVudFByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudFByb3RvdHlwZS5tYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgRWxlbWVudFByb3RvdHlwZS5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgRWxlbWVudFByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50UHJvdG90eXBlLm9NYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgRWxlbWVudFByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSAgICA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbm9kZXMgICA9IChub2RlLnBhcmVudE5vZGUgfHwgbm9kZS5kb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvciksXG4gICAgICAgICAgICAgICAgaSAgICAgICA9IC0xO1xuXG4gICAgICAgICAgICB3aGlsZSAobm9kZXNbaV0gJiYgbm9kZXNbaV0gIT09IG5vZGUpIHtcbiAgICAgICAgICAgICAgICArK2k7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAhIW5vZGVzW2ldO1xuICAgICAgICB9O1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBhZGRQb2x5ZmlsbDtcbn0gZWxzZSB7XG4gICAgYWRkUG9seWZpbGwod2luZG93LkVsZW1lbnQucHJvdG90eXBlKTtcbn0iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG5cIldlYWtNYXBcIiBpbiB0aGlzIHx8IChmdW5jdGlvbiAobW9kdWxlKSB7XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8hKEMpIFdlYlJlZmxlY3Rpb24gLSBNaXQgU3R5bGUgTGljZW5zZVxuICAvLyBzaXplIGFuZCBwZXJmb3JtYW5jZXMgb3JpZW50ZWQgcG9seWZpbGwgZm9yIEVTNlxuICAvLyBXZWFrTWFwLCBNYXAsIGFuZCBTZXRcbiAgLy8gY29tcGF0aWJsZSB3aXRoIG5vZGUuanMsIFJoaW5vLCBhbnkgYnJvd3NlclxuICAvLyBkb2VzIG5vdCBpbXBsZW1lbnQgZGVmYXVsdCB2YXVsZSBkdXJpbmcgd20uZ2V0KClcbiAgLy8gc2luY2UgRVMubmV4dCB3b24ndCBwcm9iYWJseSBkbyB0aGF0XG4gIC8vIHVzZSB3bS5oYXMobykgPyB3bS5nZXQobykgOiBkM2ZhdWx0OyBpbnN0ZWFkXG5cbiAgLy8gV2Vha01hcCh2b2lkKTpXZWFrTWFwXG4gIGZ1bmN0aW9uIFdlYWtNYXAoKSB7XG5cbiAgICAvLyBwcml2YXRlIHJlZmVyZW5jZXMgaG9sZGVyc1xuICAgIHZhclxuICAgICAga2V5cyA9IFtdLFxuICAgICAgdmFsdWVzID0gW11cbiAgICA7XG5cbiAgICAvLyByZXR1cm5zIGZyZXNobHkgbmV3IGNyZWF0ZWRcbiAgICAvLyBpbnN0YW5jZW9mIFdlYWtNYXAgaW4gYW55IGNhc2VcbiAgICByZXR1cm4gY3JlYXRlKFdlYWtNYXBQcm90b3R5cGUsIHtcbiAgICAgIC8vIFdlYWtNYXAjZGVsZXRlKGtleTp2b2lkKik6Ym9vbGVhblxuICAgICAgXCJkZWxldGVcIjoge3ZhbHVlOiBiaW5kLmNhbGwoc2hhcmVkRGVsLCBOVUxMLCBUUlVFLCBrZXlzLCB2YWx1ZXMpfSxcbiAgICAgIC8vOndhcyBXZWFrTWFwI2dldChrZXk6dm9pZCpbLCBkM2ZhdWx0OnZvaWQqXSk6dm9pZCpcbiAgICAgIC8vIFdlYWtNYXAjZ2V0KGtleTp2b2lkKik6dm9pZCpcbiAgICAgIGdldDogICAgICB7dmFsdWU6IGJpbmQuY2FsbChzaGFyZWRHZXQsIE5VTEwsIFRSVUUsIGtleXMsIHZhbHVlcyl9LFxuICAgICAgLy8gV2Vha01hcCNoYXMoa2V5OnZvaWQqKTpib29sZWFuXG4gICAgICBoYXM6ICAgICAge3ZhbHVlOiBiaW5kLmNhbGwoc2hhcmVkSGFzLCBOVUxMLCBUUlVFLCBrZXlzLCB2YWx1ZXMpfSxcbiAgICAgIC8vIFdlYWtNYXAjc2V0KGtleTp2b2lkKiwgdmFsdWU6dm9pZCopOnZvaWRcbiAgICAgIHNldDogICAgICB7dmFsdWU6IGJpbmQuY2FsbChzaGFyZWRTZXQsIE5VTEwsIFRSVUUsIGtleXMsIHZhbHVlcyl9XG4gICAgfSk7XG5cbiAgfVxuXG4gIC8vIE1hcCh2b2lkKTpNYXBcbiAgZnVuY3Rpb24gTWFwKCkge1xuXG4gICAgLy8gcHJpdmF0ZSByZWZlcmVuY2VzIGhvbGRlcnNcbiAgICB2YXJcbiAgICAgIGtleXMgPSBbXSxcbiAgICAgIHZhbHVlcyA9IFtdXG4gICAgO1xuXG4gICAgLy8gcmV0dXJucyBmcmVzaGx5IG5ldyBjcmVhdGVkXG4gICAgLy8gaW5zdGFuY2VvZiBXZWFrTWFwIGluIGFueSBjYXNlXG4gICAgcmV0dXJuIGNyZWF0ZShNYXBQcm90b3R5cGUsIHtcbiAgICAgIC8vIE1hcCNkZWxldGUoa2V5OnZvaWQqKTpib29sZWFuXG4gICAgICBcImRlbGV0ZVwiOiB7dmFsdWU6IGJpbmQuY2FsbChzaGFyZWREZWwsIE5VTEwsIEZBTFNFLCBrZXlzLCB2YWx1ZXMpfSxcbiAgICAgIC8vOndhcyBNYXAjZ2V0KGtleTp2b2lkKlssIGQzZmF1bHQ6dm9pZCpdKTp2b2lkKlxuICAgICAgLy8gTWFwI2dldChrZXk6dm9pZCopOnZvaWQqXG4gICAgICBnZXQ6ICAgICAge3ZhbHVlOiBiaW5kLmNhbGwoc2hhcmVkR2V0LCBOVUxMLCBGQUxTRSwga2V5cywgdmFsdWVzKX0sXG4gICAgICAvLyBNYXAjaGFzKGtleTp2b2lkKik6Ym9vbGVhblxuICAgICAgaGFzOiAgICAgIHt2YWx1ZTogYmluZC5jYWxsKHNoYXJlZEhhcywgTlVMTCwgRkFMU0UsIGtleXMsIHZhbHVlcyl9LFxuICAgICAgLy8gTWFwI3NldChrZXk6dm9pZCosIHZhbHVlOnZvaWQqKTp2b2lkXG4gICAgICBzZXQ6ICAgICAge3ZhbHVlOiBiaW5kLmNhbGwoc2hhcmVkU2V0LCBOVUxMLCBGQUxTRSwga2V5cywgdmFsdWVzKX1cbiAgICAgIC8qLFxuICAgICAgLy8gTWFwI3NpemUodm9pZCk6bnVtYmVyID09PSBNb3ppbGxhIG9ubHkgc28gZmFyXG4gICAgICBzaXplOiAgICAge3ZhbHVlOiBiaW5kLmNhbGwoc2hhcmVkU2l6ZSwgTlVMTCwga2V5cyl9LFxuICAgICAgLy8gTWFwI2tleXModm9pZCk6QXJyYXkgPT09IG5vdCBpbiBzcGVjc1xuICAgICAga2V5czogICAgIHt2YWx1ZTogYm91bmRTbGljZShrZXlzKX0sXG4gICAgICAvLyBNYXAjdmFsdWVzKHZvaWQpOkFycmF5ID09PSBub3QgaW4gc3BlY3NcbiAgICAgIHZhbHVlczogICB7dmFsdWU6IGJvdW5kU2xpY2UodmFsdWVzKX0sXG4gICAgICAvLyBNYXAjaXRlcmF0ZShjYWxsYmFjazpGdW5jdGlvbiwgY29udGV4dDp2b2lkKik6dm9pZCA9PT4gY2FsbGJhY2suY2FsbChjb250ZXh0LCBrZXksIHZhbHVlLCBpbmRleCkgPT09IG5vdCBpbiBzcGVjc1xuICAgICAgaXRlcmF0ZTogIHt2YWx1ZTogYmluZC5jYWxsKHNoYXJlZEl0ZXJhdGUsIE5VTEwsIEZBTFNFLCBrZXlzLCB2YWx1ZXMpfVxuICAgICAgLy8qL1xuICAgIH0pO1xuXG4gIH1cblxuICAvLyBTZXQodm9pZCk6U2V0XG4gIC8qKlxuICAgKiB0byBiZSByZWFsbHkgaG9uZXN0LCBJIHdvdWxkIHJhdGhlciBwb2xsdXRlIEFycmF5LnByb3RvdHlwZVxuICAgKiBpbiBvcmRlciB0byBoYXZlIFNldCBsaWtlIGJlaGF2aW9yXG4gICAqIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEFycmF5LnByb3RvdHlwZSwge1xuICAgKiAgIGFkZDoge3ZhbHVlOiBmdW5jdGlvbiBhZGQodmFsdWUpIHtcbiAgICogICAgIHJldHVybiAtMSA8IHRoaXMuaW5kZXhPZih2YWx1ZSkgJiYgISF0aGlzLnB1c2godmFsdWUpO1xuICAgKiAgIH19XG4gICAqICAgaGFzOiB7dmFsdWU6IGZ1bmN0aW9uIGhhcyh2YWx1ZSkge1xuICAgKiAgICAgcmV0dXJuIC0xIDwgdGhpcy5pbmRleE9mKHZhbHVlKTtcbiAgICogICB9fVxuICAgKiAgIGRlbGV0ZToge3ZhbHVlOiBmdW5jdGlvbiBkZWxldGUodmFsdWUpIHtcbiAgICogICAgIHZhciBpID0gdGhpcy5pbmRleE9mKHZhbHVlKTtcbiAgICogICAgIHJldHVybiAtMSA8IGkgJiYgISF0aGlzLnNwbGljZShpLCAxKTtcbiAgICogICB9fVxuICAgKiB9KTtcbiAgICogLi4uIGFueXdheSAuLi5cbiAgICovXG4gIGZ1bmN0aW9uIFNldCgpIHtcbiAgICB2YXJcbiAgICAgIGtleXMgPSBbXSwgIC8vIHBsYWNlaG9sZGVyIHVzZWQgc2ltcGx5IHRvIHJlY3ljbGUgZnVuY3Rpb25zXG4gICAgICB2YWx1ZXMgPSBbXSwvLyByZWFsIHN0b3JhZ2VcbiAgICAgIGhhcyA9IGJpbmQuY2FsbChzaGFyZWRIYXMsIE5VTEwsIEZBTFNFLCB2YWx1ZXMsIGtleXMpXG4gICAgO1xuICAgIHJldHVybiBjcmVhdGUoU2V0UHJvdG90eXBlLCB7XG4gICAgICAvLyBTZXQjZGVsZXRlKHZhbHVlOnZvaWQqKTpib29sZWFuXG4gICAgICBcImRlbGV0ZVwiOiB7dmFsdWU6IGJpbmQuY2FsbChzaGFyZWREZWwsIE5VTEwsIEZBTFNFLCB2YWx1ZXMsIGtleXMpfSxcbiAgICAgIC8vIFNldCNoYXModmFsdWU6dm9pZCopOmJvb2xlYW5cbiAgICAgIGhhczogICAgICB7dmFsdWU6IGhhc30sXG4gICAgICAvLyBTZXQjYWRkKHZhbHVlOnZvaWQqKTpib29sZWFuXG4gICAgICBhZGQ6ICAgICAge3ZhbHVlOiBiaW5kLmNhbGwoU2V0X2FkZCwgTlVMTCwgRkFMU0UsIGhhcywgdmFsdWVzKX1cbiAgICAgIC8qLFxuICAgICAgLy8gTWFwI3NpemUodm9pZCk6bnVtYmVyID09PSBNb3ppbGxhIG9ubHlcbiAgICAgIHNpemU6ICAgICB7dmFsdWU6IGJpbmQuY2FsbChzaGFyZWRTaXplLCBOVUxMLCB2YWx1ZXMpfSxcbiAgICAgIC8vIFNldCN2YWx1ZXModm9pZCk6QXJyYXkgPT09IG5vdCBpbiBzcGVjc1xuICAgICAgdmFsdWVzOiAgIHt2YWx1ZTogYm91bmRTbGljZSh2YWx1ZXMpfSxcbiAgICAgIC8vIFNldCNpdGVyYXRlKGNhbGxiYWNrOkZ1bmN0aW9uLCBjb250ZXh0OnZvaWQqKTp2b2lkID09PiBjYWxsYmFjay5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCkgPT09IG5vdCBpbiBzcGVjc1xuICAgICAgaXRlcmF0ZTogIHt2YWx1ZTogYmluZC5jYWxsKFNldF9pdGVyYXRlLCBOVUxMLCBGQUxTRSwgTlVMTCwgdmFsdWVzKX1cbiAgICAgIC8vKi9cbiAgICB9KTtcbiAgfVxuXG4gIC8vIGNvbW1vbiBzaGFyZWQgbWV0aG9kIHJlY3ljbGVkIGZvciBhbGwgc2hpbXMgdGhyb3VnaCBiaW5kXG4gIGZ1bmN0aW9uIHNoYXJlZERlbChvYmplY3RPbmx5LCBrZXlzLCB2YWx1ZXMsIGtleSkge1xuICAgIGlmIChzaGFyZWRIYXMob2JqZWN0T25seSwga2V5cywgdmFsdWVzLCBrZXkpKSB7XG4gICAgICBrZXlzLnNwbGljZShpLCAxKTtcbiAgICAgIHZhbHVlcy5zcGxpY2UoaSwgMSk7XG4gICAgfVxuICAgIC8vIEF1cm9yYSBoZXJlIGRvZXMgaXQgd2hpbGUgQ2FuYXJ5IGRvZXNuJ3RcbiAgICByZXR1cm4gLTEgPCBpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hhcmVkR2V0KG9iamVjdE9ubHksIGtleXMsIHZhbHVlcywga2V5LyosIGQzZmF1bHQqLykge1xuICAgIHJldHVybiBzaGFyZWRIYXMob2JqZWN0T25seSwga2V5cywgdmFsdWVzLCBrZXkpID8gdmFsdWVzW2ldIDogdW5kZWZpbmVkOyAvL2QzZmF1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBzaGFyZWRIYXMob2JqZWN0T25seSwga2V5cywgdmFsdWVzLCBrZXkpIHtcbiAgICBpZiAob2JqZWN0T25seSAmJiBrZXkgIT09IE9iamVjdChrZXkpKSB7XG4gICAgICBjb25zb2xlLmxvZyhrZXkpO1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm5vdCBhIG5vbi1udWxsIG9iamVjdFwiKTtcbiAgICB9XG4gICAgaSA9IGJldHRlckluZGV4T2YuY2FsbChrZXlzLCBrZXkpO1xuICAgIHJldHVybiAtMSA8IGk7XG4gIH1cblxuICBmdW5jdGlvbiBzaGFyZWRTZXQob2JqZWN0T25seSwga2V5cywgdmFsdWVzLCBrZXksIHZhbHVlKSB7XG4gICAgLyogcmV0dXJuICovc2hhcmVkSGFzKG9iamVjdE9ubHksIGtleXMsIHZhbHVlcywga2V5KSA/XG4gICAgICB2YWx1ZXNbaV0gPSB2YWx1ZVxuICAgICAgOlxuICAgICAgdmFsdWVzW2tleXMucHVzaChrZXkpIC0gMV0gPSB2YWx1ZVxuICAgIDtcbiAgfVxuXG4gIC8qIGtleXMsIHZhbHVlcywgYW5kIGl0ZXJhdGUgcmVsYXRlZCBtZXRob2RzXG4gIGZ1bmN0aW9uIGJvdW5kU2xpY2UodmFsdWVzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBzbGljZS5jYWxsKHZhbHVlcyk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNoYXJlZFNpemUoa2V5cykge1xuICAgIHJldHVybiBrZXlzLmxlbmd0aDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNoYXJlZEl0ZXJhdGUob2JqZWN0T25seSwga2V5cywgdmFsdWVzLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgIGZvciAodmFyXG4gICAgICBrID0gc2xpY2UuY2FsbChrZXlzKSwgdiA9IHNsaWNlLmNhbGwodmFsdWVzKSxcbiAgICAgIGkgPSAwLCBsZW5ndGggPSBrLmxlbmd0aDtcbiAgICAgIGkgPCBsZW5ndGg7IGNhbGxiYWNrLmNhbGwoY29udGV4dCwga1tpXSwgdltpXSwgaSsrKVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBTZXRfaXRlcmF0ZShvYmplY3RPbmx5LCBrZXlzLCB2YWx1ZXMsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXJcbiAgICAgIHYgPSBzbGljZS5jYWxsKHZhbHVlcyksXG4gICAgICBpID0gMCwgbGVuZ3RoID0gdi5sZW5ndGg7XG4gICAgICBpIDwgbGVuZ3RoOyBjYWxsYmFjay5jYWxsKGNvbnRleHQsIHZbaV0sIGkrKylcbiAgICApO1xuICB9XG4gIC8vKi9cblxuICAvLyBTZXQjYWRkIHJlY3ljbGVkIHRocm91Z2ggYmluZCBwZXIgZWFjaCBpbnN0YW5jZW9mIFNldFxuICBmdW5jdGlvbiBTZXRfYWRkKG9iamVjdE9ubHksIGhhcywgdmFsdWVzLCB2YWx1ZSkge1xuICAgIC8qcmV0dXJuICovKCFoYXModmFsdWUpICYmICEhdmFsdWVzLnB1c2godmFsdWUpKTtcbiAgfVxuXG4gIC8vIGEgbW9yZSByZWxpYWJsZSBpbmRleE9mXG4gIGZ1bmN0aW9uIGJldHRlckluZGV4T2YodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgIT0gdmFsdWUgfHwgdmFsdWUgPT09IDApIHtcbiAgICAgIGZvciAoaSA9IHRoaXMubGVuZ3RoOyBpLS0gJiYgIWlzKHRoaXNbaV0sIHZhbHVlKTspO1xuICAgIH0gZWxzZSB7XG4gICAgICBpID0gaW5kZXhPZi5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGk7XG4gIH1cblxuICAvLyBuZWVkIGZvciBhbiBlbXB0eSBjb25zdHJ1Y3RvciAuLi5cbiAgZnVuY3Rpb24gQ29uc3RydWN0b3IoKXt9ICAvLyBHQydlZCBpZiAhIU9iamVjdC5jcmVhdGVcbiAgLy8gLi4uIHNvIHRoYXQgbmV3IFdlYWtNYXBJbnN0YW5jZSBhbmQgbmV3IFdlYWtNYXBcbiAgLy8gcHJvZHVjZXMgYm90aCBhbiBpbnN0YW5jZW9mIFdlYWtNYXBcblxuICB2YXJcbiAgICAvLyBzaG9ydGN1dHMgYW5kIC4uLlxuICAgIE5VTEwgPSBudWxsLCBUUlVFID0gdHJ1ZSwgRkFMU0UgPSBmYWxzZSxcbiAgICBub3RJbk5vZGUgPSBtb2R1bGUgPT0gXCJ1bmRlZmluZWRcIixcbiAgICB3aW5kb3cgPSBub3RJbk5vZGUgPyB0aGlzIDogZ2xvYmFsLFxuICAgIG1vZHVsZSA9IG5vdEluTm9kZSA/IHt9IDogZXhwb3J0cyxcbiAgICBPYmplY3QgPSB3aW5kb3cuT2JqZWN0LFxuICAgIFdlYWtNYXBQcm90b3R5cGUgPSBXZWFrTWFwLnByb3RvdHlwZSxcbiAgICBNYXBQcm90b3R5cGUgPSBNYXAucHJvdG90eXBlLFxuICAgIFNldFByb3RvdHlwZSA9IFNldC5wcm90b3R5cGUsXG4gICAgZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHksXG4gICAgc2xpY2UgPSBbXS5zbGljZSxcblxuICAgIC8vIE9iamVjdC5pcyhhLCBiKSBzaGltXG4gICAgaXMgPSBPYmplY3QuaXMgfHwgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhID09PSBiID9cbiAgICAgICAgYSAhPT0gMCB8fCAxIC8gYSA9PSAxIC8gYiA6XG4gICAgICAgIGEgIT0gYSAmJiBiICE9IGJcbiAgICAgIDtcbiAgICB9LFxuXG4gICAgLy8gcGFydGlhbCBwb2x5ZmlsbCBmb3IgdGhpcyBhaW0gb25seVxuICAgIGJpbmQgPSBXZWFrTWFwLmJpbmQgfHwgZnVuY3Rpb24gYmluZChjb250ZXh0LCBvYmplY3RPbmx5LCBrZXlzLCB2YWx1ZXMpIHtcbiAgICAgIC8vIHBhcnRpYWwgZmFzdCBhZC1ob2MgRnVuY3Rpb24jYmluZCBwb2x5ZmlsbCBpZiBub3QgYXZhaWxhYmxlXG4gICAgICB2YXIgY2FsbGJhY2sgPSB0aGlzO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGJvdW5kKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKCEha2V5ID09PSBmYWxzZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGFyZ3VtZW50cy5jYWxsZXIuY2FsbGVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgb2JqZWN0T25seSwga2V5cywgdmFsdWVzLCBrZXksIHZhbHVlKTtcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gY3JlYXRlKHByb3RvLCBkZXNjcmlwdG9yKSB7XG4gICAgICAvLyBwYXJ0aWFsIGFkLWhvYyBPYmplY3QuY3JlYXRlIHNoaW0gaWYgbm90IGF2YWlsYWJsZVxuICAgICAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gcHJvdG87XG4gICAgICB2YXIgb2JqZWN0ID0gbmV3IENvbnN0cnVjdG9yKCksIGtleTtcbiAgICAgIGZvciAoa2V5IGluIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgb2JqZWN0W2tleV0gPSBkZXNjcmlwdG9yW2tleV0udmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH0sXG5cbiAgICBpbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbiBpbmRleE9mKHZhbHVlKSB7XG4gICAgICAvLyBwYXJ0aWFsIGZhc3QgQXJyYXkjaW5kZXhPZiBwb2x5ZmlsbCBpZiBub3QgYXZhaWxhYmxlXG4gICAgICBmb3IgKGkgPSB0aGlzLmxlbmd0aDsgaS0tICYmIHRoaXNbaV0gIT09IHZhbHVlOyk7XG4gICAgICByZXR1cm4gaTtcbiAgICB9LFxuXG4gICAgdW5kZWZpbmVkLFxuICAgIGkgLy8gcmVjeWNsZSBBTEwgdGhlIHZhcmlhYmxlcyAhXG4gIDtcblxuICAvLyB+aW5kZXhPZi5jYWxsKFtOYU5dLCBOYU4pIGFzIGZ1dHVyZSBwb3NzaWJsZSBmZWF0dXJlIGRldGVjdGlvblxuXG4gIC8vIHVzZWQgdG8gZm9sbG93IEZGIGJlaGF2aW9yIHdoZXJlIFdlYWtNYXAucHJvdG90eXBlIGlzIGEgV2Vha01hcCBpdHNlbGZcbiAgV2Vha01hcC5wcm90b3R5cGUgPSBXZWFrTWFwUHJvdG90eXBlID0gV2Vha01hcCgpO1xuICBNYXAucHJvdG90eXBlID0gTWFwUHJvdG90eXBlID0gTWFwKCk7XG4gIFNldC5wcm90b3R5cGUgPSBTZXRQcm90b3R5cGUgPSBTZXQoKTtcblxuICAvLyBhc3NpZ24gaXQgdG8gdGhlIGdsb2JhbCBjb250ZXh0XG4gIC8vIGlmIGFscmVhZHkgdGhlcmUsIGUuZy4gaW4gbm9kZSwgZXhwb3J0IG5hdGl2ZVxuICB3aW5kb3cuV2Vha01hcCA9IG1vZHVsZS5XZWFrTWFwID0gd2luZG93LldlYWtNYXAgfHwgV2Vha01hcDtcbiAgd2luZG93Lk1hcCA9IG1vZHVsZS5NYXAgPSB3aW5kb3cuTWFwIHx8IE1hcDtcbiAgd2luZG93LlNldCA9IG1vZHVsZS5TZXQgPSB3aW5kb3cuU2V0IHx8IFNldDtcblxuICAvKiBwcm9iYWJseSBub3QgbmVlZGVkLCBhZGQgYSBzbGFzaCB0byBlbnN1cmUgbm9uIGNvbmZpZ3VyYWJsZSBhbmQgbm9uIHdyaXRhYmxlXG4gIGlmIChkZWZpbmVQcm9wZXJ0eSkge1xuICAgIGRlZmluZVByb3BlcnR5KHdpbmRvdywgXCJXZWFrTWFwXCIsIHt2YWx1ZTogV2Vha01hcH0pO1xuICAgIGRlZmluZVByb3BlcnR5KHdpbmRvdywgXCJNYXBcIiwge3ZhbHVlOiBNYXB9KTtcbiAgICBkZWZpbmVQcm9wZXJ0eSh3aW5kb3csIFwiU2V0XCIsIHt2YWx1ZTogU2V0fSk7XG4gIH1cbiAgLy8qL1xuXG4gIC8vIHRoYXQncyBwcmV0dHkgbXVjaCBpdFxuXG59LmNhbGwoXG4gIHRoaXMsXG4gIHR5cGVvZiBleHBvcnRzXG4pKTtcbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8qanNsaW50IGluZGVudDogNCovXG4vKmdsb2JhbCB3aW5kb3cqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyksXG4gICAgZGF0YVNhdmVyID0gcmVxdWlyZSgnLi9kYXRhLXNhdmVyJyksXG4gICAgdXJsSGFuZGxlciA9IHJlcXVpcmUoJy4vdXJsLWhhbmRsZXInKSxcbiAgICBlbEdlbkNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZy1nZW4tY29udGFpbmVyJyksXG4gICAgZWxWaWV3cG9ydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZy12aWV3cG9ydCcpLFxuICAgIGVsU2l6ZVB4ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNnLXNpemUtcHgnKSwgLy9QeCBzaXplIGlucHV0IGVsZW1lbnQgaW4gdG9vbGJhclxuICAgIGVsU2l6ZUVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZy1zaXplLWVtJyksIC8vRW0gc2l6ZSBpbnB1dCBlbGVtZW50IGluIHRvb2xiYXI7XG4gICAgZGlzY29JRCA9IGZhbHNlLFxuICAgIGRpc2NvTW9kZSA9IGZhbHNlLFxuICAgIGhheU1vZGUgPSBmYWxzZTtcblxuLy9VcGRhdGUgUGl4ZWwgYW5kIEVtIGlucHV0c1xuLy8nc2l6ZScgaXMgdGhlIGlucHV0IG51bWJlclxuLy8ndW5pdCcgaXMgdGhlIHR5cGUgb2YgdW5pdDogZWl0aGVyIHB4IG9yIGVtLiBEZWZhdWx0IGlzIHB4LiBBY2NlcHRlZCB2YWx1ZXMgYXJlICdweCcgYW5kICdlbSdcbi8vJ3RhcmdldCcgaXMgd2hhdCBpbnB1dHMgdG8gdXBkYXRlLiBEZWZhdWx0cyB0byBib3RoXG5mdW5jdGlvbiB1cGRhdGVTaXplUmVhZGluZyhzaXplLCB1bml0LCB0YXJnZXQpIHtcbiAgICB2YXIgZW1TaXplID0gKHVuaXQgPT09ICdlbScgPyBNYXRoLmZsb29yKHNpemUgKiBjb25maWcuYm9keVNpemUpIDogc2l6ZSksXG4gICAgICAgIHB4U2l6ZSA9ICh1bml0ID09PSAnZW0nID8gc2l6ZSAvIGNvbmZpZy5ib2R5U2l6ZSA6IHNpemUpO1xuXG4gICAgaWYgKHRhcmdldCA9PT0gJ3VwZGF0ZVB4SW5wdXQnKSB7XG4gICAgICAgIGVsU2l6ZVB4LnZhbHVlID0gcHhTaXplO1xuICAgIH0gZWxzZSBpZiAodGFyZ2V0ID09PSAndXBkYXRlRW1JbnB1dCcpIHtcbiAgICAgICAgZWxTaXplRW1zLnZhbHVlID0gZW1TaXplO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGVsU2l6ZUVtcy52YWx1ZSA9IGVtU2l6ZTtcbiAgICAgICAgZWxTaXplUHgudmFsdWUgPSBweFNpemU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzYXZlU2l6ZShzaXplKSB7XG4gICAgaWYgKCFkYXRhU2F2ZXIuZmluZFZhbHVlKCd2cFdpZHRoJykpIHtcbiAgICAgICAgZGF0YVNhdmVyLmFkZFZhbHVlKCd2cFdpZHRoJywgc2l6ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZGF0YVNhdmVyLnVwZGF0ZVZhbHVlKCd2cFdpZHRoJywgc2l6ZSk7XG4gICAgfVxufVxuXG4vKiBSZXR1cm5zIGEgcmFuZG9tIG51bWJlciBiZXR3ZWVuIG1pbiBhbmQgbWF4ICovXG5mdW5jdGlvbiBnZXRSYW5kb20obWluLCBtYXgpIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xufVxuXG4vL1Jlc2l6ZSB0aGUgdmlld3BvcnRcbi8vJ3NpemUnIGlzIHRoZSB0YXJnZXQgc2l6ZSBvZiB0aGUgdmlld3BvcnRcbi8vJ2FuaW1hdGUnIGlzIGEgYm9vbGVhbiBmb3Igc3dpdGNoaW5nIHRoZSBDU1MgYW5pbWF0aW9uIG9uIG9yIG9mZi4gJ2FuaW1hdGUnIGlzIHRydWUgYnkgZGVmYXVsdCwgYnV0IGNhbiBiZSBzZXQgdG8gZmFsc2UgZm9yIHRoaW5ncyBsaWtlIG51ZGdpbmcgYW5kIGRyYWdnaW5nXG5mdW5jdGlvbiBzaXplaWZyYW1lKHNpemUsIGFuaW1hdGUpIHtcbiAgICB2YXIgdGhlU2l6ZTtcblxuICAgIGlmIChzaXplID4gY29uZmlnLm1heFZpZXdwb3J0V2lkdGgpIHsgLy9JZiB0aGUgZW50ZXJlZCBzaXplIGlzIGxhcmdlciB0aGFuIHRoZSBtYXggYWxsb3dlZCB2aWV3cG9ydCBzaXplLCBjYXAgdmFsdWUgYXQgbWF4IHZwIHNpemVcbiAgICAgICAgdGhlU2l6ZSA9IGNvbmZpZy5tYXhWaWV3cG9ydFdpZHRoO1xuICAgIH0gZWxzZSBpZiAoc2l6ZSA8IGNvbmZpZy5taW5WaWV3cG9ydFdpZHRoKSB7IC8vSWYgdGhlIGVudGVyZWQgc2l6ZSBpcyBsZXNzIHRoYW4gdGhlIG1pbmltdW0gYWxsb3dlZCB2aWV3cG9ydCBzaXplLCBjYXAgdmFsdWUgYXQgbWluIHZwIHNpemVcbiAgICAgICAgdGhlU2l6ZSA9IGNvbmZpZy5taW5WaWV3cG9ydFdpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoZVNpemUgPSBzaXplO1xuICAgIH1cblxuICAgIC8vQ29uZGl0aW9uYWxseSByZW1vdmUgQ1NTIGFuaW1hdGlvbiBjbGFzcyBmcm9tIHZpZXdwb3J0XG4gICAgZWxHZW5Db250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgndnAtYW5pbWF0ZScsIGFuaW1hdGUpO1xuICAgIGVsVmlld3BvcnQuY2xhc3NMaXN0LnJlbW92ZSgndnAtYW5pbWF0ZScsIGFuaW1hdGUpO1xuXG4gICAgZWxHZW5Db250YWluZXIuc3R5bGUud2lkdGggPSAodGhlU2l6ZSArIGNvbmZpZy52aWV3cG9ydFJlc2l6ZUhhbmRsZVdpZHRoKSArICdweCc7IC8vUmVzaXplIHZpZXdwb3J0IHdyYXBwZXIgdG8gZGVzaXJlZCBzaXplICsgc2l6ZSBvZiBkcmFnIHJlc2l6ZSBoYW5kbGVyXG4gICAgZWxWaWV3cG9ydC5zdHlsZS53aWR0aCA9IHRoZVNpemUgKyAncHgnOyAvL1Jlc2l6ZSB2aWV3cG9ydCB0byBkZXNpcmVkIHNpemVcblxuICAgIHVwZGF0ZVNpemVSZWFkaW5nKHRoZVNpemUpOyAvL1VwZGF0ZSB2YWx1ZXMgaW4gdG9vbGJhclxuICAgIHNhdmVTaXplKHRoZVNpemUpOyAvL1NhdmUgY3VycmVudCB2aWV3cG9ydCB0byBjb29raWVcbn1cblxuZnVuY3Rpb24gdXBkYXRlVmlld3BvcnRXaWR0aChzaXplKSB7XG4gICAgc2l6ZSA9IHBhcnNlSW50KHNpemUsIDEwKTtcbiAgICBlbFZpZXdwb3J0LnN0eWxlLndpZHRoID0gcGFyc2VJbnQoc2l6ZSwgMTApICsgJ3B4JztcbiAgICBlbEdlbkNvbnRhaW5lci5zdHlsZS53aWR0aCA9IChzaXplICsgMTQpICsgJ3B4JztcblxuICAgIHVwZGF0ZVNpemVSZWFkaW5nKHNpemUpO1xufVxuXG4vKiBEaXNjbyBNb2RlICovXG5mdW5jdGlvbiBkaXNjbygpIHtcbiAgICBzaXplaWZyYW1lKGdldFJhbmRvbShjb25maWcubWluVmlld3BvcnRXaWR0aCwgY29uZmlnLnN3KSk7XG59XG5cbmZ1bmN0aW9uIGtpbGxEaXNjbygpIHtcbiAgICBkaXNjb01vZGUgPSBmYWxzZTtcbiAgICBjbGVhckludGVydmFsKGRpc2NvSUQpO1xuICAgIGRpc2NvSUQgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gc3RhcnREaXNjbygpIHtcbiAgICBkaXNjb01vZGUgPSB0cnVlO1xuICAgIGRpc2NvSUQgPSBzZXRJbnRlcnZhbChkaXNjbywgODAwKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlRGlzY28oKSB7XG4gICAgaWYgKCFkaXNjb01vZGUpIHtcbiAgICAgICAgc3RhcnREaXNjbygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGtpbGxEaXNjbygpO1xuICAgIH1cbn1cblxuLy9TdG9wIEhheSEgTW9kZVxuZnVuY3Rpb24ga2lsbEhheSgpIHtcbiAgICB2YXIgY3VycmVudFdpZHRoID0gZWxWaWV3cG9ydC5vZmZzZXRXaWR0aDtcbiAgICBoYXlNb2RlID0gZmFsc2U7XG4gICAgZWxWaWV3cG9ydC5jbGFzc0xpc3QucmVtb3ZlKCdoYXktbW9kZScpO1xuICAgIGVsR2VuQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hheS1tb2RlJyk7XG4gICAgc2l6ZWlmcmFtZShNYXRoLmZsb29yKGN1cnJlbnRXaWR0aCkpO1xufVxuXG4vLyBzdGFydCBIYXkhIG1vZGVcbmZ1bmN0aW9uIHN0YXJ0SGF5KCkge1xuICAgIGhheU1vZGUgPSB0cnVlO1xuICAgIGVsR2VuQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ3ZwLWFuaW1hdGUnKTtcbiAgICBlbEdlbkNvbnRhaW5lci5zdHlsZS53aWR0aCA9IChjb25maWcubWluVmlld3BvcnRXaWR0aCArIGNvbmZpZy52aWV3cG9ydFJlc2l6ZUhhbmRsZVdpZHRoKSArICdweCc7XG4gICAgZWxWaWV3cG9ydC5jbGFzc0xpc3QucmVtb3ZlKCd2cC1hbmltYXRlJyk7XG4gICAgZWxWaWV3cG9ydC5zdHlsZS53aWR0aCA9IGNvbmZpZy5taW5WaWV3cG9ydFdpZHRoICsgJ3B4JztcblxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWxHZW5Db250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGF5LW1vZGUnKTtcbiAgICAgICAgZWxHZW5Db250YWluZXIuc3R5bGUud2lkdGggPSAoY29uZmlnLm1heFZpZXdwb3J0V2lkdGggKyBjb25maWcudmlld3BvcnRSZXNpemVIYW5kbGVXaWR0aCkgKyAncHgnO1xuICAgICAgICBlbFZpZXdwb3J0LmNsYXNzTGlzdC5hZGQoJ2hheS1tb2RlJyk7XG4gICAgICAgIGVsVmlld3BvcnQuc3R5bGUud2lkdGggPSBjb25maWcubWF4Vmlld3BvcnRXaWR0aCArICdweCc7XG5cbiAgICAgICAgLy90b2RvIHRoaXMgaXMgbm90IHJlbW92ZWRcbiAgICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHZwU2l6ZSA9IGVsVmlld3BvcnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB1cGRhdGVTaXplUmVhZGluZyh2cFNpemUpO1xuICAgICAgICB9LCAxMDApO1xuICAgIH0sIDIwMCk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZUhheSgpIHtcbiAgICBpZiAoIWhheU1vZGUpIHtcbiAgICAgICAgc3RhcnRIYXkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBraWxsSGF5KCk7XG4gICAgfVxufVxuXG4vLyBoYW5kbGUgd2hlbiBzb21lb25lIGNsaWNrcyBvbiB0aGUgZ3JleSBhcmVhIG9mIHRoZSB2aWV3cG9ydCBzbyBpdCBhdXRvLWNsb3NlcyB0aGUgbmF2XG5mdW5jdGlvbiBjbG9zZVBhbmVscygpIHtcbiAgICAvLyBjbG9zZSB1cCB0aGUgbWVudVxuICAgIHZhciBwYW5lbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2ctYWNjLXBhbmVsJyksXG4gICAgICAgIGhhbmRsZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2ctYWNjLWhhbmRsZScpO1xuXG4gICAgW10uZm9yRWFjaC5jYWxsKHBhbmVscywgZnVuY3Rpb24gKHBhbmVsKSB7XG4gICAgICAgIHBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIH0pO1xuXG5cbiAgICBbXS5mb3JFYWNoLmNhbGwoaGFuZGxlcywgZnVuY3Rpb24gKGhhbmRsZSkge1xuICAgICAgICBoYW5kbGUuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIG9yaWdWaWV3cG9ydFdpZHRoICAgPSBlbFZpZXdwb3J0Lm9mZnNldFdpZHRoLFxuICAgICAgICBvR2V0VmFycyAgICAgICAgICAgID0gdXJsSGFuZGxlci5nZXRSZXF1ZXN0VmFycygpLCAvLyBnZXQgdGhlIHJlcXVlc3QgdmFyc1xuICAgICAgICB2cFdpZHRoICAgICAgICAgICAgID0gMCxcbiAgICAgICAgdHJhY2tWaWV3cG9ydFdpZHRoICA9IHRydWUsIC8vIGNhbiB0b2dnbGUgdGhpcyBmZWF0dXJlIG9uICYgb2ZmXG4gICAgICAgIHBhdHRlcm5OYW1lICAgICAgICAgPSAnYWxsJyxcbiAgICAgICAgcGF0dGVyblBhdGggICAgICAgICA9ICcnLFxuICAgICAgICBpRnJhbWVQYXRoICAgICAgICAgID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoJ2luZGV4Lmh0bWwnLCAnJykgKyAnc3R5bGVndWlkZS9odG1sL3N0eWxlZ3VpZGUuaHRtbCc7XG5cbiAgICAvLyBjYXB0dXJlIHRoZSB2aWV3cG9ydCB3aWR0aCB0aGF0IHdhcyBsb2FkZWQgYW5kIG1vZGlmeSBpdCBzbyBpdCBmaXRzIHdpdGggdGhlIHB1bGwgYmFyXG4gICAgZWxHZW5Db250YWluZXIuc3R5bGUud2lkdGggPSBvcmlnVmlld3BvcnRXaWR0aCArICdweCc7XG4gICAgZWxWaWV3cG9ydC5zdHlsZS53aWR0aCA9IChvcmlnVmlld3BvcnRXaWR0aCAtIDE0KSArICdweCc7XG4gICAgdXBkYXRlU2l6ZVJlYWRpbmcob3JpZ1ZpZXdwb3J0V2lkdGggLSAxNCk7XG5cbiAgICAvLyBwcmUtbG9hZCB0aGUgdmlld3BvcnQgd2lkdGhcbiAgICBpZiAob0dldFZhcnMuaCB8fCBvR2V0VmFycy5oYXkpIHtcbiAgICAgICAgc3RhcnRIYXkoKTtcbiAgICB9IGVsc2UgaWYgKG9HZXRWYXJzLmQgfHwgb0dldFZhcnMuZGlzY28pIHtcbiAgICAgICAgc3RhcnREaXNjbygpO1xuICAgIH0gZWxzZSBpZiAob0dldFZhcnMudyB8fCBvR2V0VmFycy53aWR0aCkge1xuICAgICAgICB2cFdpZHRoID0gb0dldFZhcnMudyB8fCBvR2V0VmFycy53aWR0aDtcbiAgICAgICAgdnBXaWR0aCA9IHZwV2lkdGguaW5kZXhPZignZW0nKSAhPT0gLTEgPyBNYXRoLmZsb29yKE1hdGguZmxvb3IodnBXaWR0aC5yZXBsYWNlKCdlbScsICcnKSkgKiBjb25maWcuYm9keVNpemUpIDogTWF0aC5mbG9vcih2cFdpZHRoLnJlcGxhY2UoJ3B4JywgJycpKTtcblxuICAgICAgICBkYXRhU2F2ZXIudXBkYXRlVmFsdWUoJ3ZwV2lkdGgnLCB2cFdpZHRoKTtcbiAgICAgICAgdXBkYXRlVmlld3BvcnRXaWR0aCh2cFdpZHRoKTtcbiAgICB9IGVsc2UgaWYgKHRyYWNrVmlld3BvcnRXaWR0aCAmJiBkYXRhU2F2ZXIuZmluZFZhbHVlKCd2cFdpZHRoJykpIHtcbiAgICAgICAgdXBkYXRlVmlld3BvcnRXaWR0aChkYXRhU2F2ZXIuZmluZFZhbHVlKCd2cFdpZHRoJykpO1xuICAgIH1cblxuICAgIC8vIGxvYWQgdGhlIGlmcmFtZSBzb3VyY2VcbiAgICBpZiAob0dldFZhcnMucCB8fCBvR2V0VmFycy5wYXR0ZXJuKSB7XG4gICAgICAgIHBhdHRlcm5OYW1lID0gb0dldFZhcnMucCB8fCBvR2V0VmFycy5wYXR0ZXJuO1xuICAgICAgICBwYXR0ZXJuUGF0aCA9IHVybEhhbmRsZXIuZ2V0RmlsZU5hbWUocGF0dGVybk5hbWUpO1xuICAgICAgICBpRnJhbWVQYXRoICA9IChwYXR0ZXJuUGF0aCAhPT0gJycpID8gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoJ2luZGV4Lmh0bWwnLCAnJykgKyBwYXR0ZXJuUGF0aCA6IGlGcmFtZVBhdGg7XG4gICAgfVxuXG4gICAgaWYgKHBhdHRlcm5OYW1lICE9PSAnYWxsJykge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGl0bGUnKS5pbm5lckhUTUwgPSAnUGF0dGVybiBMYWIgLSAnICsgcGF0dGVybk5hbWU7XG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7ICdwYXR0ZXJuJzogcGF0dGVybk5hbWUgfSwgbnVsbCwgbnVsbCk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NnLXJhdycpLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybEhhbmRsZXIuZ2V0RmlsZU5hbWUocGF0dGVybk5hbWUpKTtcblxuICAgIHVybEhhbmRsZXIuc2tpcEJhY2sgPSB0cnVlO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZy12aWV3cG9ydCcpLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVwbGFjZShpRnJhbWVQYXRoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2l6ZWlmcmFtZSAgICAgICAgICA6IHNpemVpZnJhbWUsXG4gICAgZ2V0UmFuZG9tICAgICAgICAgICA6IGdldFJhbmRvbSxcbiAgICB1cGRhdGVWaWV3cG9ydFdpZHRoIDogdXBkYXRlVmlld3BvcnRXaWR0aCxcbiAgICBkaXNjbyAgICAgICAgICAgICAgIDogZGlzY28sXG4gICAga2lsbERpc2NvICAgICAgICAgICA6IGtpbGxEaXNjbyxcbiAgICBzdGFydERpc2NvICAgICAgICAgIDogc3RhcnREaXNjbyxcbiAgICBzdGFydEhheSAgICAgICAgICAgIDogc3RhcnRIYXksXG4gICAga2lsbEhheSAgICAgICAgICAgICA6IGtpbGxIYXksXG4gICAgdG9nZ2xlRGlzY28gICAgICAgICA6IHRvZ2dsZURpc2NvLFxuICAgIHRvZ2dsZUhheSAgICAgICAgICAgOiB0b2dnbGVIYXksXG4gICAgdXBkYXRlU2l6ZVJlYWRpbmcgICA6IHVwZGF0ZVNpemVSZWFkaW5nLFxuICAgIGNsb3NlUGFuZWxzICAgICAgICAgOiBjbG9zZVBhbmVscyxcbiAgICBpbml0ICAgICAgICAgICAgICAgIDogaW5pdFxufTsiLCIvKmpzbGludCBpbmRlbnQ6IDQsIHJlZ2V4cDogdHJ1ZSovXG4vKmdsb2JhbCB3aW5kb3cqL1xudmFyIEV2ZW50RGVsZWdhdG9yICA9IHJlcXVpcmUoJy4vZXZlbnREZWxlZ2F0b3IvZXZlbnREZWxlZ2F0b3InKSxcbiAgICBjb25maWcgICAgICAgICAgPSByZXF1aXJlKCcuL2NvbmZpZycpLFxuICAgIGRhdGFTYXZlciAgICAgICA9IHJlcXVpcmUoJy4vZGF0YS1zYXZlcicpLFxuICAgIGd1aSAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vZ3VpJyksXG4gICAgdXJsSGFuZGxlciAgICAgID0gcmVxdWlyZSgnLi91cmwtaGFuZGxlcicpLFxuICAgIGRlbGVnYXRvciAgICAgICA9IG5ldyBFdmVudERlbGVnYXRvcihkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLFxuICAgIGVsVmlld3BvcnQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZy12aWV3cG9ydCcpLFxuICAgIGVsQ292ZXIgICAgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZy1jb3ZlcicpO1xuXG5mdW5jdGlvbiBfcGFyZW50cyhlbGVtZW50LCBzZWxlY3RvciwgY2IpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuXG4gICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgICBpZiAodGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBjYih0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX3NpYmxpbmdzKGVsZW1lbnQsIHNlbGVjdG9yLCBjYikge1xuICAgIHZhciB0YXJnZXQgPSBlbGVtZW50LnBhcmVudE5vZGUuY2hpbGRyZW5bMF07XG5cbiAgICB3aGlsZSAodGFyZ2V0KSB7XG4gICAgICAgIGlmICh0YXJnZXQubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIGNiKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0Lm5leHRTaWJsaW5nO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX3RvZ2dsZVVMKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0LnBhcmVudE5vZGU7XG5cbiAgICBfcGFyZW50cyh0YXJnZXQsICd1bCcsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gX3NpemUobnVtKSB7XG4gICAgZ3VpLmtpbGxEaXNjbygpO1xuICAgIGd1aS5raWxsSGF5KCk7XG4gICAgZ3VpLnNpemVpZnJhbWUobnVtKTtcbn1cblxuZGVsZWdhdG9yXG4gICAgLy8gaGFuZGxlcyB3aWRlbmluZyB0aGUgXCJ2aWV3cG9ydFwiXG4gICAgLy8gICAxLiBvbiBcIm1vdXNlZG93blwiIHN0b3JlIHRoZSBjbGljayBsb2NhdGlvblxuICAgIC8vICAgMi4gbWFrZSBhIGhpZGRlbiBkaXYgdmlzaWJsZSBzbyB0aGF0IGl0IGNhbiB0cmFjayBtb3VzZSBtb3ZlbWVudHMgYW5kIG1ha2Ugc3VyZSB0aGUgcG9pbnRlciBkb2Vzbid0IGdldCBsb3N0IGluIHRoZSBpZnJhbWVcbiAgICAvLyAgIDMuIG9uIFwibW91c2Vtb3ZlXCIgY2FsY3VsYXRlIHRoZSBtYXRoLCBzYXZlIHRoZSByZXN1bHRzIHRvIGEgY29va2llLCBhbmQgdXBkYXRlIHRoZSB2aWV3cG9ydFxuICAgIC5vbignbW91c2Vkb3duJywgJyNzZy1yaWdodHB1bGwnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAvLyBjYXB0dXJlIGRlZmF1bHQgZGF0YVxuICAgICAgICB2YXIgb3JpZ0NsaWVudFggPSBlLmNsaWVudFgsXG4gICAgICAgICAgICBvcmlnVmlld3BvcnRXaWR0aCA9IGVsVmlld3BvcnQub2Zmc2V0V2lkdGg7XG5cbiAgICAgICAgLy8gc2hvdyB0aGUgY292ZXJcbiAgICAgICAgZWxDb3Zlci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgICAgICAvLyBhZGQgdGhlIG1vdXNlIG1vdmUgZXZlbnQgYW5kIGNhcHR1cmUgZGF0YS4gYWxzbyB1cGRhdGUgdGhlIHZpZXdwb3J0IHdpZHRoXG4gICAgICAgIGRlbGVnYXRvci5vbignbW91c2Vtb3ZlJywgJyNzZy1jb3ZlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdmlld3BvcnRXaWR0aCA9IChvcmlnQ2xpZW50WCA+IGUuY2xpZW50WCkgP1xuICAgICAgICAgICAgICAgICAgICBvcmlnVmlld3BvcnRXaWR0aCAtICgob3JpZ0NsaWVudFggLSBlLmNsaWVudFgpICogMikgOlxuICAgICAgICAgICAgICAgICAgICBvcmlnVmlld3BvcnRXaWR0aCArICgoZS5jbGllbnRYIC0gb3JpZ0NsaWVudFgpICogMik7XG5cbiAgICAgICAgICAgIGlmICh2aWV3cG9ydFdpZHRoID4gY29uZmlnLm1pblZpZXdwb3J0V2lkdGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRhdGFTYXZlci5maW5kVmFsdWUoJ3ZwV2lkdGgnKSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhU2F2ZXIuYWRkVmFsdWUoJ3ZwV2lkdGgnLCB2aWV3cG9ydFdpZHRoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkYXRhU2F2ZXIudXBkYXRlVmFsdWUoJ3ZwV2lkdGgnLCB2aWV3cG9ydFdpZHRoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBndWkuc2l6ZWlmcmFtZSh2aWV3cG9ydFdpZHRoLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pXG5cbiAgICAvLyBvbiBcIm1vdXNldXBcIiB3ZSB1bmJpbmQgdGhlIFwibW91c2Vtb3ZlXCIgZXZlbnQgYW5kIGhpZGUgdGhlIGNvdmVyIGFnYWluXG4gICAgLm9uKCdtb3VzZXVwJywgJ2JvZHknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRlbGVnYXRvci5vZmYoJ21vdXNlbW92ZScsICcjc2ctY292ZXInKTtcbiAgICAgICAgZWxDb3Zlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH0pXG5cbiAgICAvKiBQYXR0ZXJuIExhYiBhY2NvcmRpb24gZHJvcGRvd24gKi9cbiAgICAub24oJ2NsaWNrJywgJy5zZy1hY2MtaGFuZGxlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIG5leHQgPSBlLnRhcmdldDtcblxuICAgICAgICB3aGlsZSAobmV4dCAmJiAobmV4dC5ub2RlVHlwZSAhPT0gMSB8fCAhbmV4dC5tYXRjaGVzKCcuc2ctYWNjLXBhbmVsJykpKSB7XG4gICAgICAgICAgICBuZXh0ID0gbmV4dC5uZXh0U2libGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcbiAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICAgIG5leHQuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgLm9uKCdjbGljaycsICcuc2ctbmF2LXRvZ2dsZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNnLW5hdi1jb250YWluZXInKS5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcbiAgICB9KVxuXG4gICAgLy9WaWV3IChjb250YWluaW5nIGNsZWFuLCBjb2RlLCByYXcsIGV0YyBvcHRpb25zKSBUcmlnZ2VyXG4gICAgLm9uKCdjbGljaycsICcjc2ctdC10b2dnbGUnLCBfdG9nZ2xlVUwpXG5cbiAgICAvL1NpemUgVHJpZ2dlclxuICAgIC5vbignY2xpY2snLCAnI3NnLXNpemUtdG9nZ2xlJywgX3RvZ2dsZVVMKVxuXG4gICAgLy9QaGFzZSBWaWV3IEV2ZW50c1xuICAgIC5vbignY2xpY2snLCAnLnNnLXNpemVbZGF0YS1zaXplXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZ3VpLmtpbGxEaXNjbygpO1xuICAgICAgICBndWkua2lsbEhheSgpO1xuXG4gICAgICAgIHZhciB2YWwgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2l6ZScpO1xuXG4gICAgICAgIGlmICh2YWwuaW5kZXhPZigncHgnKSA+IC0xKSB7XG4gICAgICAgICAgICBjb25maWcuYm9keVNpemUgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFsID0gdmFsLnJlcGxhY2UoL1teXFxkLlxcLV0vZywgJycpO1xuICAgICAgICBndWkuc2l6ZWlmcmFtZShNYXRoLmZsb29yKHZhbCAqIGNvbmZpZy5ib2R5U2l6ZSkpO1xuICAgIH0pXG5cbiAgICAvL1NpemUgVmlldyBFdmVudHNcblxuICAgIC8vQ2xpY2sgU2l6ZSBTbWFsbCBCdXR0b25cbiAgICAub24oJ2NsaWNrJywgJyNzZy1zaXplLXMnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIF9zaXplKGd1aS5nZXRSYW5kb20oY29uZmlnLm1pblZpZXdwb3J0V2lkdGgsIDUwMCkpO1xuICAgIH0pXG5cbiAgICAvL0NsaWNrIFNpemUgTWVkaXVtIEJ1dHRvblxuICAgIC5vbignY2xpY2snLCAnI3NnLXNpemUtbScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3NpemUoZ3VpLmdldFJhbmRvbSg1MDAsIDgwMCkpO1xuICAgIH0pXG5cbiAgICAvL0NsaWNrIFNpemUgTGFyZ2UgQnV0dG9uXG4gICAgLm9uKCdjbGljaycsICcjc2ctc2l6ZS1sJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfc2l6ZShndWkuZ2V0UmFuZG9tKDgwMCwgMTIwMCkpO1xuICAgIH0pXG5cbiAgICAvL0NsaWNrIEZ1bGwgV2lkdGggQnV0dG9uXG4gICAgLm9uKCdjbGljaycsICcjc2ctc2l6ZS1mdWxsJywgZnVuY3Rpb24gKGUpIHsgLy9SZXNldHMgXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3NpemUoY29uZmlnLnN3KTtcbiAgICB9KVxuXG4gICAgLy9DbGljayBSYW5kb20gU2l6ZSBCdXR0b25cbiAgICAub24oJ2NsaWNrJywgJyNzZy1zaXplLXJhbmRvbScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3NpemUoZ3VpLmdldFJhbmRvbShjb25maWcubWluVmlld3BvcnRXaWR0aCwgY29uZmlnLnN3KSk7XG4gICAgfSlcblxuICAgIC8vQ2xpY2sgZm9yIERpc2NvIE1vZGUsIHdoaWNoIHJlc2l6ZXMgdGhlIHZpZXdwb3J0IHJhbmRvbWx5XG4gICAgLm9uKCdjbGljaycsICcjc2ctc2l6ZS1kaXNjbycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZ3VpLmtpbGxIYXkoKTtcbiAgICAgICAgZ3VpLnRvZ2dsZURpc2NvKCk7XG4gICAgfSlcblxuICAgIC8vU3RlcGhlbiBIYXkgTW9kZSAtIFwiU3RhcnQgd2l0aCB0aGUgc21hbGwgc2NyZWVuIGZpcnN0LCB0aGVuIGV4cGFuZCB1bnRpbCBpdCBsb29rcyBsaWtlIHNoaXQuIFRpbWUgZm9yIGEgYnJlYWtwb2ludCFcIlxuICAgIC5vbignY2xpY2snLCAnI3NnLXNpemUtaGF5JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBndWkua2lsbERpc2NvKCk7XG4gICAgICAgIGd1aS50b2dnbGVIYXkoKTtcbiAgICB9KVxuXG4gICAgLy9QaXhlbCBpbnB1dFxuICAgIC5vbigna2V5ZG93bicsICcuc2ctc2l6ZS1weCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciB2YWwgPSBwYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApO1xuXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDM4KSB7IC8vSWYgdGhlIHVwIGFycm93IGtleSBpcyBoaXRcbiAgICAgICAgICAgIHZhbCsrO1xuICAgICAgICAgICAgZ3VpLnNpemVpZnJhbWUodmFsLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSA0MCkgeyAvL0lmIHRoZSBkb3duIGFycm93IGtleSBpcyBoaXRcbiAgICAgICAgICAgIHZhbC0tO1xuICAgICAgICAgICAgZ3VpLnNpemVpZnJhbWUodmFsLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSAxMykgeyAvL0lmIHRoZSBFbnRlciBrZXkgaXMgaGl0XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBndWkuc2l6ZWlmcmFtZSh2YWwpOyAvL1NpemUgSWZyYW1lIHRvIHZhbHVlIG9mIHRleHQgYm94XG4gICAgICAgICAgICBlLnRhcmdldC5ibHVyKCk7XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgLm9uKCdrZXl1cCcsICcuc2ctc2l6ZS1weCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciB2YWwgPSBwYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApO1xuICAgICAgICBndWkudXBkYXRlU2l6ZVJlYWRpbmcodmFsLCAncHgnLCAndXBkYXRlRW1JbnB1dCcpO1xuICAgIH0pXG5cbiAgICAvL0VtIGlucHV0XG4gICAgLm9uKCdrZXlkb3duJywgJy5zZy1zaXplLWVtJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIHZhbCA9IHBhcnNlRmxvYXQoZS50YXJnZXQudmFsdWUpO1xuXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDM4KSB7IC8vSWYgdGhlIHVwIGFycm93IGtleSBpcyBoaXRcbiAgICAgICAgICAgIHZhbCsrO1xuICAgICAgICAgICAgZ3VpLnNpemVpZnJhbWUoTWF0aC5mbG9vcih2YWwgKiBjb25maWcuYm9keVNpemUpLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSA0MCkgeyAvL0lmIHRoZSBkb3duIGFycm93IGtleSBpcyBoaXRcbiAgICAgICAgICAgIHZhbC0tO1xuICAgICAgICAgICAgZ3VpLnNpemVpZnJhbWUoTWF0aC5mbG9vcih2YWwgKiBjb25maWcuYm9keVNpemUpLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSAxMykgeyAvL0lmIHRoZSBFbnRlciBrZXkgaXMgaGl0XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBndWkuc2l6ZWlmcmFtZShNYXRoLmZsb29yKHZhbCAqIGNvbmZpZy5ib2R5U2l6ZSkpOyAvL1NpemUgSWZyYW1lIHRvIHZhbHVlIG9mIHRleHQgYm94XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgLm9uKCdrZXl1cCcsICcuc2ctc2l6ZS1lbScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciB2YWwgPSBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgZ3VpLnVwZGF0ZVNpemVSZWFkaW5nKHZhbCwgJ2VtJywgJ3VwZGF0ZVB4SW5wdXQnKTtcbiAgICB9KVxuXG4gICAgLy8gaGFuZGxlIHRoZSBNUSBjbGlja1xuICAgIC5vbignY2xpY2snLCAnI3NnLW1xIGEnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciB2YWwgICAgID0gZS50YXJnZXQuaW5uZXJIVE1MLFxuICAgICAgICAgICAgdHlwZSAgICA9IHBhcnNlSW50KCh2YWwuaW5kZXhPZigncHgnKSAhPT0gLTEgPyAncHgnIDogJ2VtJyksIDEwKTtcblxuICAgICAgICB2YWwgPSB2YWwucmVwbGFjZSh0eXBlLCAnJyk7XG5cbiAgICAgICAgZ3VpLnNpemVpZnJhbWUoKHR5cGUgPT09ICdweCcgPyB2YWwgOiB2YWwgKiBjb25maWcuYm9keVNpemUpLCB0cnVlKTtcbiAgICB9KVxuXG4gICAgLy8gdXBkYXRlIHRoZSBpZnJhbWUgd2l0aCB0aGUgc291cmNlIGZyb20gY2xpY2tlZCBlbGVtZW50IGluIHB1bGwgZG93biBtZW51LiBhbHNvIGNsb3NlIHRoZSBtZW51XG4gICAgLy8gaGF2aW5nIGl0IG91dHNpZGUgZml4ZXMgYW4gYXV0by1jbG9zZSBidWcgaSByYW4gaW50b1xuICAgIC5vbignY2xpY2snLCAnLnNnLW5hdiBhJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUudGFyZ2V0Lm1hdGNoZXMoJy5zZy1hY2MtaGFuZGxlJykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBpZnJhbWUgdmlhIHRoZSBoaXN0b3J5IGFwaSBoYW5kbGVyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZy12aWV3cG9ydCcpLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJ3BhdGgnOiB1cmxIYW5kbGVyLmdldEZpbGVOYW1lKGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXR0ZXJucGFydGlhbCcpKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVybEhhbmRsZXIudGFyZ2V0T3JpZ2luXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gY2xvc2UgdXAgdGhlIG1lbnVcbiAgICAgICAgX3BhcmVudHMoZS50YXJnZXQsICcuc2ctYWNjLXBhbmVsJywgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIF9zaWJsaW5ncyhlbCwgJy5zZy1hY2MtaGFuZGxlJywgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KVxuXG4gICAgLm9uKCdjbGljaycsICcjc2ctdnAtd3JhcCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZ3VpLmNsb3NlUGFuZWxzKCk7XG4gICAgfSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uZmlnLnN3ID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDtcbiAgICBjb25maWcuc2ggPSBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodDtcbn0sIGZhbHNlKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiByZWNlaXZlSWZyYW1lTWVzc2FnZShldmVudCkge1xuICAgIC8vIGRvZXMgdGhlIG9yaWdpbiBzZW5kaW5nIHRoZSBtZXNzYWdlIG1hdGNoIHRoZSBjdXJyZW50IGhvc3Q/IGlmIG5vdCBkZXYvbnVsbCB0aGUgcmVxdWVzdFxuICAgIGlmICgod2luZG93LmxvY2F0aW9uLnByb3RvY29sICE9PSAnZmlsZTonKSAmJiAoZXZlbnQub3JpZ2luICE9PSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgd2luZG93LmxvY2F0aW9uLmhvc3QpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZXZlbnQuZGF0YS5ib2R5Y2xpY2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBndWkuY2xvc2VQYW5lbHMoKTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGEucGF0dGVybnBhcnRpYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoIXVybEhhbmRsZXIuc2tpcEJhY2spIHtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuaGlzdG9yeS5zdGF0ZSA9PT0gbnVsbCB8fCB3aW5kb3cuaGlzdG9yeS5zdGF0ZS5wYXR0ZXJuICE9PSBldmVudC5kYXRhLnBhdHRlcm5wYXJ0aWFsKSB7XG4gICAgICAgICAgICAgICAgdXJsSGFuZGxlci5wdXNoUGF0dGVybihldmVudC5kYXRhLnBhdHRlcm5wYXJ0aWFsLCBldmVudC5kYXRhLnBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHdpbmRvdy53c25Db25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd3NuJyk7XG4gICAgICAgICAgICAgICAgdmFyIGlGcmFtZVBhdGggPSB1cmxIYW5kbGVyLmdldEZpbGVOYW1lKGV2ZW50LmRhdGEucGF0dGVybnBhcnRpYWwpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy53c24uc2VuZCgne1widXJsXCI6IFwiJyArIGlGcmFtZVBhdGggKyAnXCIsIFwicGF0dGVybnBhcnRpYWxcIjogXCInICsgZXZlbnQuZGF0YS5wYXR0ZXJucGFydGlhbCArICdcIiB9Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmRhdGEubGluZWFnZSk7XG5cbiAgICAgICAgLy8gcmVzZXQgdGhlIGRlZmF1bHRzXG4gICAgICAgIHVybEhhbmRsZXIuc2tpcEJhY2sgPSBmYWxzZTtcbiAgICB9XG59LCBmYWxzZSk7IiwidmFyIGd1aSAgICAgID0gcmVxdWlyZSgnLi9ndWknKTtcblxucmVxdWlyZSgnLi9oYW5kbGVycycpO1xuXG5ndWkuaW5pdCgpOyIsIi8qIVxuICogVVJMIEhhbmRsZXIgLSB2MC4xXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEzIERhdmUgT2xzZW4sIGh0dHA6Ly9kbW9sc2VuLmNvbVxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKlxuICogSGVscHMgaGFuZGxlIHRoZSBpbml0aWFsIGlGcmFtZSBzb3VyY2UuIFBhcnNlcyBhIHN0cmluZyB0byBzZWUgaWYgaXQgbWF0Y2hlc1xuICogYW4gZXhwZWN0ZWQgcGF0dGVybiBpbiBQYXR0ZXJuIExhYi4gU3VwcG9ydHMgUGF0dGVybiBMYWJzIGZ1enp5IHBhdHRlcm4gcGFydGlhbFxuICogbWF0Y2hpbmcgc3R5bGUuXG4gKlxuICovXG5cbnZhciB1cmxIYW5kbGVyID0ge1xuICAgIFxuICAgIC8vIHNldC11cCBzb21lIGRlZmF1bHQgdmFyc1xuICAgIHNraXBCYWNrOiBmYWxzZSxcbiAgICB0YXJnZXRPcmlnaW46ICh3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT0gXCJmaWxlOlwiKSA/IFwiKlwiIDogd2luZG93LmxvY2F0aW9uLnByb3RvY29sK1wiLy9cIit3aW5kb3cubG9jYXRpb24uaG9zdCxcbiAgICBcbiAgICAvKipcbiAgICAqIGdldCB0aGUgcmVhbCBmaWxlIG5hbWUgZm9yIGEgZ2l2ZW4gcGF0dGVybiBuYW1lXG4gICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAgIHRoZSBzaG9ydGhhbmQgcGFydGlhbHMgc3ludGF4IGZvciBhIGdpdmVuIHBhdHRlcm5cbiAgICAqXG4gICAgKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgIHRoZSByZWFsIGZpbGUgcGF0aFxuICAgICovXG4gICAgZ2V0RmlsZU5hbWU6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgYmFzZURpciAgICAgPSBcInBhdHRlcm5zXCI7XG4gICAgICAgIHZhciBmaWxlTmFtZSAgICA9IFwiXCI7XG4gICAgICAgIFxuICAgICAgICBpZiAobmFtZSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWxlTmFtZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKG5hbWUgPT0gXCJhbGxcIikge1xuICAgICAgICAgICAgcmV0dXJuIFwic3R5bGVndWlkZS9odG1sL3N0eWxlZ3VpZGUuaHRtbFwiO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgcGF0aHMgPSAobmFtZS5pbmRleE9mKFwidmlld2FsbC1cIikgIT0gLTEpID8gdmlld0FsbFBhdGhzIDogcGF0dGVyblBhdGhzO1xuICAgICAgICBuYW1lQ2xlYW4gPSBuYW1lLnJlcGxhY2UoXCJ2aWV3YWxsLVwiLFwiXCIpO1xuICAgICAgICBcbiAgICAgICAgLy8gbG9vayBhdCB0aGlzIGFzIGEgcmVndWxhciBwYXR0ZXJuXG4gICAgICAgIHZhciBiaXRzICAgICAgICA9IHRoaXMuZ2V0UGF0dGVybkluZm8obmFtZUNsZWFuLCBwYXRocyk7XG4gICAgICAgIHZhciBwYXR0ZXJuVHlwZSA9IGJpdHNbMF07XG4gICAgICAgIHZhciBwYXR0ZXJuICAgICA9IGJpdHNbMV07XG4gICAgICAgIFxuICAgICAgICBpZiAoKHBhdGhzW3BhdHRlcm5UeXBlXSAhPSB1bmRlZmluZWQpICYmIChwYXRoc1twYXR0ZXJuVHlwZV1bcGF0dGVybl0gIT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmaWxlTmFtZSA9IHBhdGhzW3BhdHRlcm5UeXBlXVtwYXR0ZXJuXTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2UgaWYgKHBhdGhzW3BhdHRlcm5UeXBlXSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChwYXR0ZXJuTWF0Y2hLZXkgaW4gcGF0aHNbcGF0dGVyblR5cGVdKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhdHRlcm5NYXRjaEtleS5pbmRleE9mKHBhdHRlcm4pICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gcGF0aHNbcGF0dGVyblR5cGVdW3BhdHRlcm5NYXRjaEtleV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChmaWxlTmFtZSA9PSBcIlwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsZU5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciByZWdleCA9IC9cXC8vZztcbiAgICAgICAgaWYgKChuYW1lLmluZGV4T2YoXCJ2aWV3YWxsLVwiKSAhPSAtMSkgJiYgKGZpbGVOYW1lICE9IFwiXCIpKSB7XG4gICAgICAgICAgICBmaWxlTmFtZSA9IGJhc2VEaXIrXCIvXCIrZmlsZU5hbWUucmVwbGFjZShyZWdleCxcIi1cIikrXCIvaW5kZXguaHRtbFwiO1xuICAgICAgICB9IGVsc2UgaWYgKGZpbGVOYW1lICE9IFwiXCIpIHtcbiAgICAgICAgICAgIGZpbGVOYW1lID0gYmFzZURpcitcIi9cIitmaWxlTmFtZS5yZXBsYWNlKHJlZ2V4LFwiLVwiKStcIi9cIitmaWxlTmFtZS5yZXBsYWNlKHJlZ2V4LFwiLVwiKStcIi5odG1sXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBmaWxlTmFtZTtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICogYnJlYWsgdXAgYSBwYXR0ZXJuIGludG8gaXRzIHBhcnRzLCBwYXR0ZXJuIHR5cGUgYW5kIHBhdHRlcm4gbmFtZVxuICAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgICB0aGUgc2hvcnRoYW5kIHBhcnRpYWxzIHN5bnRheCBmb3IgYSBnaXZlbiBwYXR0ZXJuXG4gICAgKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgIHRoZSBwYXRocyB0byBiZSBjb21wYXJlZFxuICAgICpcbiAgICAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgdGhlIHBhdHRlcm4gdHlwZSBhbmQgcGF0dGVybiBuYW1lXG4gICAgKi9cbiAgICBnZXRQYXR0ZXJuSW5mbzogZnVuY3Rpb24gKG5hbWUsIHBhdGhzKSB7XG4gICAgICAgIHZhciBwYXR0ZXJuQml0cyA9IG5hbWUuc3BsaXQoXCItXCIpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGkgPSAxO1xuICAgICAgICB2YXIgYyA9IHBhdHRlcm5CaXRzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIHZhciBwYXR0ZXJuVHlwZSA9IHBhdHRlcm5CaXRzWzBdO1xuICAgICAgICB3aGlsZSAoKHBhdGhzW3BhdHRlcm5UeXBlXSA9PSB1bmRlZmluZWQpICYmIChpIDwgYykpIHtcbiAgICAgICAgICAgIHBhdHRlcm5UeXBlICs9IFwiLVwiK3BhdHRlcm5CaXRzW2ldO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwYXR0ZXJuID0gbmFtZS5zbGljZShwYXR0ZXJuVHlwZS5sZW5ndGgrMSxuYW1lLmxlbmd0aCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW3BhdHRlcm5UeXBlLCBwYXR0ZXJuXTtcbiAgICAgICAgXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAqIHNlYXJjaCB0aGUgcmVxdWVzdCB2YXJzIGZvciBhIHBhcnRpY3VsYXIgaXRlbVxuICAgICpcbiAgICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgYSBzZWFyY2ggb2YgdGhlIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggdmFyc1xuICAgICovXG4gICAgZ2V0UmVxdWVzdFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICBcbiAgICAgICAgLy8gdGhlIGZvbGxvd2luZyBpcyB0YWtlbiBmcm9tIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS93aW5kb3cubG9jYXRpb25cbiAgICAgICAgdmFyIG9HZXRWYXJzID0gbmV3IChmdW5jdGlvbiAoc1NlYXJjaCkge1xuICAgICAgICAgIGlmIChzU2VhcmNoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGFJdEtleSwgbktleUlkID0gMCwgYUNvdXBsZXMgPSBzU2VhcmNoLnN1YnN0cigxKS5zcGxpdChcIiZcIik7IG5LZXlJZCA8IGFDb3VwbGVzLmxlbmd0aDsgbktleUlkKyspIHtcbiAgICAgICAgICAgICAgYUl0S2V5ID0gYUNvdXBsZXNbbktleUlkXS5zcGxpdChcIj1cIik7XG4gICAgICAgICAgICAgIHRoaXNbdW5lc2NhcGUoYUl0S2V5WzBdKV0gPSBhSXRLZXkubGVuZ3RoID4gMSA/IHVuZXNjYXBlKGFJdEtleVsxXSkgOiBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSkod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gb0dldFZhcnM7XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgKiBwdXNoIGEgcGF0dGVybiBvbnRvIHRoZSBjdXJyZW50IGhpc3RvcnkgYmFzZWQgb24gYSBjbGlja1xuICAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgICB0aGUgc2hvcnRoYW5kIHBhcnRpYWxzIHN5bnRheCBmb3IgYSBnaXZlbiBwYXR0ZXJuXG4gICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICAgIHRoZSBwYXRoIGdpdmVuIGJ5IHRoZSBsb2FkZWQgaWZyYW1lXG4gICAgKi9cbiAgICBwdXNoUGF0dGVybjogZnVuY3Rpb24gKHBhdHRlcm4sIGdpdmVuUGF0aCkge1xuICAgICAgICB2YXIgZGF0YSAgICAgICAgID0geyBcInBhdHRlcm5cIjogcGF0dGVybiB9O1xuICAgICAgICB2YXIgZmlsZU5hbWUgICAgID0gdXJsSGFuZGxlci5nZXRGaWxlTmFtZShwYXR0ZXJuKTtcbiAgICAgICAgdmFyIGV4cGVjdGVkUGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCtcIi8vXCIrd2luZG93LmxvY2F0aW9uLmhvc3Qrd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoXCJwdWJsaWMvaW5kZXguaHRtbFwiLFwicHVibGljL1wiKStmaWxlTmFtZTtcbiAgICAgICAgaWYgKGdpdmVuUGF0aCAhPSBleHBlY3RlZFBhdGgpIHtcbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0byB1cGRhdGUgdGhlIGlmcmFtZSBiZWNhdXNlIHRoZXJlIHdhcyBhIGNsaWNrXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNnLXZpZXdwb3J0XCIpLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoIHsgXCJwYXRoXCI6IGZpbGVOYW1lIH0sIHVybEhhbmRsZXIudGFyZ2V0T3JpZ2luKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGFkZCB0byB0aGUgaGlzdG9yeVxuICAgICAgICAgICAgdmFyIGFkZHJlc3NSZXBsYWNlbWVudCA9ICh3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT0gXCJmaWxlOlwiKSA/IG51bGwgOiB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wrXCIvL1wiK3dpbmRvdy5sb2NhdGlvbi5ob3N0K3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKFwiaW5kZXguaHRtbFwiLFwiXCIpK1wiP3A9XCIrcGF0dGVybjtcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKGRhdGEsIG51bGwsIGFkZHJlc3NSZXBsYWNlbWVudCk7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdGxlXCIpLmlubmVySFRNTCA9IFwiUGF0dGVybiBMYWIgLSBcIitwYXR0ZXJuO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZy1yYXdcIikuc2V0QXR0cmlidXRlKFwiaHJlZlwiLHVybEhhbmRsZXIuZ2V0RmlsZU5hbWUocGF0dGVybikpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAqIGJhc2VkIG9uIGEgY2xpY2sgZm9yd2FyZCBvciBiYWNrd2FyZCBtb2RpZnkgdGhlIHVybCBhbmQgaWZyYW1lIHNvdXJjZVxuICAgICogQHBhcmFtICB7T2JqZWN0fSAgICAgIGV2ZW50IGluZm8gbGlrZSBzdGF0ZSBhbmQgcHJvcGVydGllcyBzZXQgaW4gcHVzaFN0YXRlKClcbiAgICAqL1xuICAgIHBvcFBhdHRlcm46IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgc3RhdGUgPSBlLnN0YXRlO1xuICAgICAgICBcbiAgICAgICAgaWYgKHN0YXRlID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2tpcEJhY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgcGF0dGVybk5hbWUgPSBzdGF0ZS5wYXR0ZXJuO1xuICAgICAgICB9IFxuICAgICAgICBcbiAgICAgICAgdmFyIGlGcmFtZVBhdGggPSBcIlwiO1xuICAgICAgICBpRnJhbWVQYXRoID0gdGhpcy5nZXRGaWxlTmFtZShwYXR0ZXJuTmFtZSk7XG4gICAgICAgIGlmIChpRnJhbWVQYXRoID09IFwiXCIpIHtcbiAgICAgICAgICAgIGlGcmFtZVBhdGggPSBcInN0eWxlZ3VpZGUvaHRtbC9zdHlsZWd1aWRlLmh0bWxcIjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZy12aWV3cG9ydFwiKS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKCB7IFwicGF0aFwiOiBpRnJhbWVQYXRoIH0sIHVybEhhbmRsZXIudGFyZ2V0T3JpZ2luKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXRsZVwiKS5pbm5lckhUTUwgPSBcIlBhdHRlcm4gTGFiIC0gXCIrcGF0dGVybk5hbWU7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2ctcmF3XCIpLnNldEF0dHJpYnV0ZShcImhyZWZcIix1cmxIYW5kbGVyLmdldEZpbGVOYW1lKHBhdHRlcm5OYW1lKSk7XG4gICAgICAgIFxuICAgICAgICBpZiAod3NuQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICB3c24uc2VuZCggJ3tcInVybFwiOiBcIicraUZyYW1lUGF0aCsnXCIsIFwicGF0dGVybnBhcnRpYWxcIjogXCInK3BhdHRlcm5OYW1lKydcIiB9JyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbn1cblxuLyoqXG4qIGhhbmRsZSB0aGUgb25wb3BzdGF0ZSBldmVudFxuKi9cbndpbmRvdy5vbnBvcHN0YXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdXJsSGFuZGxlci5za2lwQmFjayA9IHRydWU7XG4gICAgdXJsSGFuZGxlci5wb3BQYXR0ZXJuKGV2ZW50KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cudXJsSGFuZGxlciA9IHVybEhhbmRsZXI7Il19
