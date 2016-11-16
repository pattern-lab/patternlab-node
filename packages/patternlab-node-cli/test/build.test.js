const proxyquire = require('proxyquire');
const tap = require('tap');
const config = require('../bin/generator').defaultPatternlabConfig;
const patternLabMock = require('./mocks/patternlab.mock');

// Require build and mock patternlab.build() so that we only test the build module behavior
const build = proxyquire('../bin/build', {'patternlab-node': patternLabMock});
const opts = {patternsOnly: true};
tap.throws(() => { build() }, {}, 'build throws when config is empty');
tap.throws(() => { build(123) }, {}, 'build throws when config is not of type object');
tap.throws(() => { build(undefined, opts) }, {}, 'build --patterns-only throws when config is empty');
tap.throws(() => { build(undefined, opts) }, {}, 'build --patterns-only throws when config is not of type object');
tap.type(build(config), 'boolean', 'build returns a bool');
tap.type(build(config, opts), 'boolean', 'build --patterns-only returns a bool');
