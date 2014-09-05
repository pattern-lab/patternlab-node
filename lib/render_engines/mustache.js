/*jslint indent:4*/
'use strict';
var mustache = require('mustache');

function render(name, data, partials) {
    if (partials) {
        return mustache.render(name, data, partials);
    }
    return mustache.render(name, data);
}

module.exports = {
    render: render
};