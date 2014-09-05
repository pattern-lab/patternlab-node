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