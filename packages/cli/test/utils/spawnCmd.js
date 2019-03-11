const path = require('path');
const spawn = require('execa');
const wrapAsync = require('../../bin/utils').wrapAsync;
const cli = path.resolve(__dirname, '../../bin/patternlab.js');

const spawnCmd = (args, endFn) =>
  wrapAsync(function*() {
    const fn = endFn || function() {};
    yield spawn('node', [cli].concat(args));
    fn();
  });

module.exports = spawnCmd;
