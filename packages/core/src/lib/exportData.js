'use strict';

const path = require('path');
const eol = require('os').EOL;

const ae = require('./annotationExporter');

let fs = require('fs-extra'); //eslint-disable-line prefer-const

/**
 * Write out our pattern information for use by the front end
 * @param patternlab - global data store
 */
module.exports = function (patternlab, uikit) {
  const annotationExporter = new ae(patternlab);

  const paths = patternlab.config.paths;

  //write out the data
  let output = '';

  //config
  output += 'var config = ' + JSON.stringify(patternlab.config) + ';\n';

  //ishControls
  output +=
    'var ishControls = {"ishControlsHide":' +
    JSON.stringify(patternlab.config.ishControlsHide) +
    '};' +
    eol;

  //navItems
  output +=
    'var navItems = {"patternGroups": ' +
    JSON.stringify(patternlab.patternGroups) +
    ', "ishControlsHide": ' +
    JSON.stringify(patternlab.config.ishControlsHide) +
    '};' +
    eol;

  //patternPaths
  output +=
    'var patternPaths = ' + JSON.stringify(patternlab.patternPaths) + ';' + eol;

  //viewAllPaths
  output +=
    'var viewAllPaths = ' + JSON.stringify(patternlab.viewAllPaths) + ';' + eol;

  //plugins
  output +=
    'var plugins = ' + JSON.stringify(patternlab.plugins || []) + ';' + eol;

  //smaller config elements
  output +=
    'var defaultShowPatternInfo = ' +
    (patternlab.config.defaultShowPatternInfo
      ? patternlab.config.defaultShowPatternInfo
      : 'false') +
    ';' +
    eol;
  output +=
    'var defaultPattern = "' +
    (patternlab.config.defaultPattern
      ? patternlab.config.defaultPattern
      : 'all') +
    '";' +
    eol;

  //annotations
  const annotationsJSON = annotationExporter.gather();
  const annotations =
    'var comments = { "comments" : ' + JSON.stringify(annotationsJSON) + '};';
  fs.outputFileSync(
    path.resolve(
      path.join(
        process.cwd(),
        uikit.outputDir,
        paths.public.annotations,
        'annotations.js'
      )
    ),
    annotations
  );

  // add module.export to the Nodejs-specific file generated.
  const exportedOutput =
    output +
    'module.exports = { config, ishControls, navItems, patternPaths, viewAllPaths, plugins, defaultShowPatternInfo, defaultPattern };';

  //write all output to patternlab-data
  fs.outputFileSync(
    path.resolve(
      path.join(process.cwd(), uikit.outputDir, paths.public.data),
      'patternlab-data.js'
    ),
    output
  );
  fs.outputFileSync(
    path.resolve(
      path.join(process.cwd(), uikit.outputDir, paths.public.data),
      'patternlab-data.cjs.js'
    ),
    exportedOutput
  );

  return output;
};
