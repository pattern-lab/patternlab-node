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