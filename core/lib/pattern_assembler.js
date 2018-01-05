"use strict";

const path = require('path');

const Pattern = require('./object_factory').Pattern;
const mp = require('./markdown_parser');
const logger = require('./log');
const patternEngines = require('./pattern_engines');
const ch = require('./changes_hunter');
const da = require('./data_loader');
const addPattern = require('./addPattern');
const buildListItems = require('./buildListItems');
const readDocumentation = require('./readDocumentation');

const markdown_parser = new mp();
const changes_hunter = new ch();
const dataLoader = new da();

//this is mocked in unit tests
let fs = require('fs-extra'); //eslint-disable-line prefer-const

const pattern_assembler = function () {

  // loads a pattern from disk, creates a Pattern object from it and
  // all its associated files, and records it in patternlab.patterns[]
  function loadPatternIterative(relPath, patternlab) {

    var relativeDepth = (relPath.match(/\w(?=\\)|\w(?=\/)/g) || []).length;
    if (relativeDepth > 2) {
      logger.warning('');
      logger.warning('Warning:');
      logger.warning('A pattern file: ' + relPath + ' was found greater than 2 levels deep from ' + patternlab.config.paths.source.patterns + '.');
      logger.warning('It\'s strongly suggested to not deviate from the following structure under _patterns/');
      logger.warning('[patternType]/[patternSubtype]/[patternName].[patternExtension]');
      logger.warning('');
      logger.warning('While Pattern Lab may still function, assets may 404 and frontend links may break. Consider yourself warned. ');
      logger.warning('Read More: http://patternlab.io/docs/pattern-organization.html');
      logger.warning('');
    }

    //check if the found file is a top-level markdown file
    var fileObject = path.parse(relPath);
    if (fileObject.ext === '.md') {
      try {
        var proposedDirectory = path.resolve(patternlab.config.paths.source.patterns, fileObject.dir, fileObject.name);
        var proposedDirectoryStats = fs.statSync(proposedDirectory);
        if (proposedDirectoryStats.isDirectory()) {
          var subTypeMarkdownFileContents = fs.readFileSync(proposedDirectory + '.md', 'utf8');
          var subTypeMarkdown = markdown_parser.parse(subTypeMarkdownFileContents);
          var subTypePattern = new Pattern(relPath, null, patternlab);
          subTypePattern.patternSectionSubtype = true;
          subTypePattern.patternLink = subTypePattern.name + '/index.html';
          subTypePattern.patternDesc = subTypeMarkdown.markdown;
          subTypePattern.flatPatternPath = subTypePattern.flatPatternPath + '-' + subTypePattern.fileName;
          subTypePattern.isPattern = false;
          subTypePattern.engine = null;

          patternlab.subtypePatterns[subTypePattern.patternPartial] = subTypePattern;

          return subTypePattern;
        }
      } catch (err) {
        // no file exists, meaning it's a pattern markdown file
        if (err.code !== 'ENOENT') {
          logger.warning(err);
        }
      }
    }


    //extract some information
    var filename = fileObject.base;
    var ext = fileObject.ext;
    var patternsPath = patternlab.config.paths.source.patterns;

    // skip non-pattern files
    if (!patternEngines.isPatternFile(filename, patternlab)) { return null; }

    //make a new Pattern Object
    var currentPattern = new Pattern(relPath, null, patternlab);

    //if file is named in the syntax for variants
    if (patternEngines.isPseudoPatternJSON(filename)) {
      return currentPattern;
    }

    //can ignore all non-supported files at this point
    if (patternEngines.isFileExtensionSupported(ext) === false) {
      return currentPattern;
    }

    //look for a json file for this template
    try {
      var jsonFilename = path.resolve(patternsPath, currentPattern.subdir, currentPattern.fileName);
      const patternData = dataLoader.loadDataFromFile(jsonFilename, fs);

      if (patternData) {
        currentPattern.jsonFileData = patternData;
        logger.debug(`found pattern-specific data for ${currentPattern.patternPartial}`);
      }
    }
    catch (err) {
      logger.warning(`There was an error parsing sibling JSON for ${currentPattern.relPath}`);
      logger.warning(err);
    }

    //look for a listitems.json file for this template
    try {
      var listJsonFileName = path.resolve(patternsPath, currentPattern.subdir, currentPattern.fileName + ".listitems");
      const listItemsData = dataLoader.loadDataFromFile(listJsonFileName, fs);

      if (listItemsData) {
        logger.debug(`found pattern-specific listitems data for ${currentPattern.patternPartial}`);
        currentPattern.listitems = listItemsData;
        buildListItems(currentPattern);
      }
    }
    catch (err) {
      logger.warning(`There was an error parsing sibling listitem JSON for ${currentPattern.relPath}`);
      logger.warning(err);
    }

    //look for a markdown file for this template
    readDocumentation(currentPattern, patternlab);

    //add the raw template to memory
    var templatePath = path.resolve(patternsPath, currentPattern.relPath);

    currentPattern.template = fs.readFileSync(templatePath, 'utf8');

    //find any stylemodifiers that may be in the current pattern
    currentPattern.stylePartials = currentPattern.findPartialsWithStyleModifiers();

    //find any pattern parameters that may be in the current pattern
    currentPattern.parameteredPartials = currentPattern.findPartialsWithPatternParameters();

    [templatePath, jsonFilename, listJsonFileName].forEach(file => {
      changes_hunter.checkLastModified(currentPattern, file);
    });

    changes_hunter.checkBuildState(currentPattern, patternlab);

    //add currentPattern to patternlab.patterns array
    addPattern(currentPattern, patternlab);

    return currentPattern;
  }

  return {
    load_pattern_iterative: function (file, patternlab) {
      return loadPatternIterative(file, patternlab);
    }
  };

};

module.exports = pattern_assembler;
