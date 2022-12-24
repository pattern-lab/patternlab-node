/**
 * get the classes from pattern markdown and/or json
 * @param {PatternLab} patternlab
 * @param {Pattern} pattern
 * @return {string}
 */
function getPatternWrapClasses(patternlab, pattern) {
  const { patternWrapClassesEnable, patternWrapClassesKey } = patternlab.config;
  if (
    !patternWrapClassesEnable ||
    !patternWrapClassesKey ||
    patternWrapClassesKey.length === 0
  ) {
    return '';
  }

  const classes = [];
  patternWrapClassesKey.forEach((key) => {
    const { allMarkdown, jsonFileData } = pattern;

    if (allMarkdown && allMarkdown[key]) {
      classes.push(allMarkdown[key]);
    }

    if (jsonFileData && jsonFileData[key]) {
      classes.push(jsonFileData[key]);
    }
  });

  return classes.join(' ');
}

/**
 * change pattern template and wrap with classes pattern wrapper
 * @param {PatternLab} patternlab
 * @param {Pattern} pattern
 */
function patternWrapClassesChangePatternTemplate(patternlab, pattern) {
  const classes = getPatternWrapClasses(patternlab, pattern);
  if (classes.length !== 0) {
    pattern.patternPartialCode = `<div class="pl-pattern-wrapper-element ${classes}">${pattern.patternPartialCode}</div>`;
  }
}

module.exports = patternWrapClassesChangePatternTemplate;
