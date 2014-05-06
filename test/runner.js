var runner = require('../node_modules/grunt-contrib-qunit/tasks/qunit.js');
var plnode = require('plnode');

runner.run({
    code: "../builder/patternlab.js",
    tests: "tests.js"
}, callback);