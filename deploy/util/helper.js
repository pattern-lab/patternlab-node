var
  through2 = require('through2'),
  util = require('gulp-util');

function isDevMode() {
  if (!process.argv[2] || process.argv[2] === 'test') return true;
  if (process.argv[2] === '--color' && !process.argv[5]) return true;
  if (process.argv[5] === 'default' || process.argv[5] === 'test') return true;
  return false;
}

function getTargetDir(path) {
  return 'public/' + path;
}

function handleError(error) {
  util.log(error.toString());
  onEnd()
}

function onEnd() {
  if (!isDevMode()) {
    process.exit(-1);
  }
}

module.exports = {
  getTargetDir: getTargetDir,
  isDevMode: isDevMode,
  handleError: handleError,
  onEnd: onEnd
};
