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