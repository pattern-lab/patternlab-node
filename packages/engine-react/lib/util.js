const path = require('path');
const process = require('process');

function getAbsolutePatternDir(pattern, patternLabConfig) {
  return path.join(
    process.cwd(),
    patternLabConfig.paths.source.patterns,
    pattern.subdir
  );
}
function getAbsolutePatternPath(pattern, patternLabConfig) {
  return path.join(
    process.cwd(),
    patternLabConfig.paths.source.patterns,
    pattern.relPath
  );
}
function getAbsolutePatternOutputPath(pattern, patternLabConfig) {
  return path.join(
    process.cwd(),
    patternLabConfig.paths.public.patterns,
    pattern.patternLink
  );
}
function getAbsolutePatternOutputDir(pattern, patternLabConfig) {
  return path.dirname(getAbsolutePatternOutputPath(pattern, patternLabConfig));
}

function getModuleCodeString(pattern) {
  return pattern.template || pattern.extendedTemplate;
}

module.exports = {
  getAbsolutePatternDir,
  getAbsolutePatternPath,
  getAbsolutePatternOutputPath,
  getAbsolutePatternOutputDir,
  getModuleCodeString,
};
