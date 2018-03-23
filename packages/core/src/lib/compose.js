'use strict';

const _ = require('lodash');

const events = require('./events');
const jsonCopy = require('./json_copy');
const logger = require('./log');
const parseLink = require('./parseLink');
const render = require('./render');

const Pattern = require('./object_factory').Pattern;
const CompileState = require('./object_factory').CompileState;

module.exports = function(pattern) {
  // Pattern does not need to be built and recompiled more than once
  if (!pattern.isPattern || pattern.compileState === CompileState.CLEAN) {
    return Promise.resolve(false);
  }

  // Allows serializing the compile state
  this.graph.node(pattern).compileState = pattern.compileState =
    CompileState.BUILDING;

  //todo move this into lineage_hunter
  pattern.patternLineages = pattern.lineage;
  pattern.patternLineageExists = pattern.lineage.length > 0;
  pattern.patternLineagesR = pattern.lineageR;
  pattern.patternLineageRExists = pattern.lineageR.length > 0;
  pattern.patternLineageEExists =
    pattern.patternLineageExists || pattern.patternLineageRExists;

  this.events.emit(events.PATTERNLAB_PATTERN_BEFORE_DATA_MERGE, this, pattern);

  //render the pattern, but first consolidate any data we may have
  let allData;

  let allListItems = _.merge({}, this.listitems, pattern.listitems);
  allListItems = parseLink(
    this,
    allListItems,
    'listitems.json + any pattern listitems.json'
  );

  allData = _.merge({}, this.data, pattern.jsonFileData);
  allData = _.merge({}, allData, allListItems);
  allData.cacheBuster = this.cacheBuster;
  allData.patternPartial = pattern.patternPartial;

  ///////////////
  // HEADER
  ///////////////

  //re-rendering the headHTML each time allows pattern-specific data to influence the head of the pattern
  let headPromise;
  if (this.userHead) {
    headPromise = render(this.userHead, allData);
  } else {
    headPromise = render(
      Pattern.createEmpty({ extendedTemplate: this.header }),
      allData
    );
  }

  ///////////////
  // PATTERN
  ///////////////

  //render the extendedTemplate with all data
  const patternPartialPromise = render(pattern, allData, this.partials);

  ///////////////
  // FOOTER
  ///////////////

  // stringify this data for individual pattern rendering and use on the styleguide
  // see if patternData really needs these other duped values

  // construct our extraOutput dump
  const extraOutput = Object.assign(
    {},
    pattern.extraOutput,
    pattern.allMarkdown
  );
  delete extraOutput.title;
  delete extraOutput.state;
  delete extraOutput.markdown;

  pattern.patternData = JSON.stringify({
    cssEnabled: false,
    patternLineageExists: pattern.patternLineageExists,
    patternLineages: pattern.patternLineages,
    lineage: pattern.patternLineages,
    patternLineageRExists: pattern.patternLineageRExists,
    patternLineagesR: pattern.patternLineagesR,
    lineageR: pattern.patternLineagesR,
    patternLineageEExists:
      pattern.patternLineageExists || pattern.patternLineageRExists,
    patternDesc: pattern.patternDescExists ? pattern.patternDesc : '',
    patternBreadcrumb:
      pattern.patternGroup === pattern.patternSubGroup
        ? {
            patternType: pattern.patternGroup,
          }
        : {
            patternType: pattern.patternGroup,
            patternSubtype: pattern.patternSubGroup,
          },
    patternExtension: pattern.fileExtension.substr(1), //remove the dot because styleguide asset default adds it for us
    patternName: pattern.patternName,
    patternPartial: pattern.patternPartial,
    patternState: pattern.patternState,
    patternEngineName: pattern.engine.engineName,
    extraOutput: extraOutput,
  });

  //set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer
  const footerPartialPromise = render(
    Pattern.createEmpty({ extendedTemplate: this.footer }),
    {
      isPattern: pattern.isPattern,
      patternData: pattern.patternData,
      cacheBuster: this.cacheBuster,
    }
  );

  const self = this;

  return Promise.all([headPromise, patternPartialPromise, footerPartialPromise])
    .then(intermediateResults => {
      // retrieve results of promises
      const headHTML = intermediateResults[0]; //headPromise
      pattern.patternPartialCode = intermediateResults[1]; //patternPartialPromise
      const footerPartial = intermediateResults[2]; //footerPartialPromise

      //finish up our footer data
      let allFooterData;
      try {
        allFooterData = jsonCopy(
          self.data,
          'config.paths.source.data global data'
        );
      } catch (err) {
        logger.info('There was an error parsing JSON for ' + pattern.relPath);
        logger.info(err);
      }
      allFooterData = _.merge(allFooterData, pattern.jsonFileData);
      allFooterData.patternLabFoot = footerPartial;

      return render(self.userFoot, allFooterData).then(footerHTML => {
        ///////////////
        // WRITE FILES
        ///////////////

        self.events.emit(events.PATTERNLAB_PATTERN_WRITE_BEGIN, self, pattern);

        //write the compiled template to the public patterns directory
        self.writePatternFiles(headHTML, pattern, footerHTML);

        self.events.emit(events.PATTERNLAB_PATTERN_WRITE_END, self, pattern);

        // Allows serializing the compile state
        self.graph.node(pattern).compileState = pattern.compileState =
          CompileState.CLEAN;
        logger.info('Built pattern: ' + pattern.patternPartial);
      });
    })
    .catch(reason => {
      console.log(reason);
    });
};
