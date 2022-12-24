'use strict';

const path = require('path');

const Pattern = require('./object_factory').Pattern;
const logger = require('./log');
const patternEngines = require('./pattern_engines');
const ch = require('./changes_hunter');
const da = require('./data_loader');
const addPattern = require('./addPattern');
const buildListItems = require('./buildListItems');
const readDocumentation = require('./readDocumentation');

const changes_hunter = new ch();
const dataLoader = new da();

//this is mocked in unit tests
let fs = require('fs-extra'); //eslint-disable-line prefer-const

// loads a pattern from disk, creates a Pattern object from it and
// all its associated files, and records it in patternlab.patterns[]
module.exports = function (relPath, patternlab) {
  const fileObject = path.parse(relPath);

  //extract some information
  const filename = fileObject.base;
  const ext = fileObject.ext;
  const patternsPath = patternlab.config.paths.source.patterns;

  // skip non-pattern files
  if (!patternEngines.isPatternFile(filename, patternlab)) {
    return null;
  }

  // Determine patterns nested too deep and show a warning
  const relativeDepth = (relPath.match(/\w(?=\\)|\w(?=\/)/g) || []).length;
  if (relativeDepth > 3) {
    logger.warning('');
    logger.warning('Warning:');
    logger.warning(
      'A pattern file: ' +
        relPath +
        ' was found greater than 3 levels deep from ' +
        patternlab.config.paths.source.patterns +
        '.'
    );
    logger.warning(
      "It's strongly suggested to not deviate from the following structure under _patterns/"
    );
    logger.warning(
      '[patternGroup]/[patternSubgroup]/[patternName].[patternExtension]'
    );
    logger.warning('or');
    logger.warning(
      '[patternGroup]/[patternSubgroup]/[patternName]/[patternName].[patternExtension]'
    );
    logger.warning('');
    logger.warning(
      'While Pattern Lab may still function, assets may 404 and frontend links may break. Consider yourself warned. '
    );
    logger.warning(
      'Read More: https://patternlab.io/docs/overview-of-patterns/'
    );
    logger.warning('');
  }

  //make a new Pattern Object
  const currentPattern = new Pattern(relPath, null, patternlab);

  //if file is named in the syntax for variants
  if (patternEngines.isPseudoPatternJSON(filename)) {
    return currentPattern;
  }

  //can ignore all non-supported files at this point
  if (patternEngines.isFileExtensionSupported(ext) === false) {
    return currentPattern;
  }

  //look for a json file for this template
  let jsonFilename;
  try {
    jsonFilename = path.resolve(
      patternsPath,
      currentPattern.subdir,
      currentPattern.fileName
    );
    const patternData = dataLoader.loadDataFromFile(jsonFilename, fs);

    if (patternData) {
      currentPattern.jsonFileData = patternData;
      logger.debug(
        `found pattern-specific data for ${currentPattern.patternPartial}`
      );
    }
  } catch (err) {
    logger.error(
      `There was an error parsing sibling JSON for ${currentPattern.relPath}`
    );
    logger.error(err);
  }

  //look for a listitems.json file for this template
  let listJsonFileName;
  try {
    listJsonFileName = path.resolve(
      patternsPath,
      currentPattern.subdir,
      `${currentPattern.fileName}.listitems`
    );
    const listItemsData = dataLoader.loadDataFromFile(listJsonFileName, fs);

    if (listItemsData) {
      logger.debug(
        `found pattern-specific listitems data for ${currentPattern.patternPartial}`
      );
      currentPattern.listitems = listItemsData;
      buildListItems(currentPattern);
    }
  } catch (err) {
    logger.error(
      `There was an error parsing sibling listitem JSON for ${currentPattern.relPath}`
    );
    logger.error(err);
  }

  //look for a markdown file for this template
  readDocumentation(currentPattern, patternlab);

  //add the raw template to memory
  const templatePath = path.resolve(patternsPath, currentPattern.relPath);

  currentPattern.template = fs.readFileSync(templatePath, 'utf8');

  //find any pattern parameters that may be in the current pattern
  currentPattern.parameteredPartials =
    currentPattern.findPartialsWithPatternParameters();

  [
    templatePath,
    `${jsonFilename}.json`,
    `${jsonFilename}.yml`,
    `${jsonFilename}.yaml`,
    `${listJsonFileName}.json`,
    `${listJsonFileName}.yml`,
    `${listJsonFileName}.yaml`,
  ].forEach((file) => {
    changes_hunter.checkLastModified(currentPattern, file);
  });

  changes_hunter.checkBuildState(currentPattern, patternlab);

  //add currentPattern to patternlab.patterns array
  addPattern(currentPattern, patternlab);

  return currentPattern;
};
