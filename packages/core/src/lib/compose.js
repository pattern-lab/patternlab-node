'use strict';

const _ = require('lodash');

const events = require('./events');
const jsonCopy = require('./json_copy');
const logger = require('./log');
const parseLink = require('./parseLink');
const render = require('./render');
const uikitExcludePattern = require('./uikitExcludePattern');
const pm = require('./plugin_manager');
const dataMerger = require('./dataMerger');
const patternWrapClassesChangePatternTemplate = require('./patternWrapClasses');
const pluginManager = new pm();

const Pattern = require('./object_factory').Pattern;
const CompileState = require('./object_factory').CompileState;

module.exports = async function (pattern, patternlab) {
  // Pattern does not need to be built and recompiled more than once
  if (!pattern.isPattern || pattern.compileState === CompileState.CLEAN) {
    return Promise.resolve(false);
  }

  // Allows serializing the compile state
  patternlab.graph.node(pattern).compileState = pattern.compileState =
    CompileState.BUILDING;

  //todo move this into lineage_hunter
  pattern.patternLineages = pattern.lineage;
  pattern.patternLineageExists = pattern.lineage.length > 0;
  pattern.patternLineagesR = pattern.lineageR;
  pattern.patternLineageRExists = pattern.lineageR.length > 0;
  pattern.patternLineageEExists =
    pattern.patternLineageExists || pattern.patternLineageRExists;

  await pluginManager.raiseEvent(
    patternlab,
    events.PATTERNLAB_PATTERN_BEFORE_DATA_MERGE,
    patternlab,
    pattern
  );

  return Promise.all(
    _.map(patternlab.uikits, (uikit) => {
      // exclude pattern from uikit rendering
      if (uikitExcludePattern(pattern, uikit)) {
        return Promise.resolve();
      }

      //render the pattern, but first consolidate any data we may have
      let allData;

      let allListItems = _.merge({}, patternlab.listitems, pattern.listitems);
      allListItems = parseLink(
        patternlab,
        allListItems,
        'listitems.json + any pattern listitems.json'
      );

      allData = dataMerger(
        patternlab.data,
        pattern.jsonFileData,
        patternlab.config
      );
      // _.merge({}, patternlab.data, pattern.jsonFileData);
      allData = dataMerger(allData, allListItems, patternlab.config);
      // _.merge({}, allData, allListItems);
      allData.cacheBuster = patternlab.cacheBuster;
      allData.patternPartial = pattern.patternPartial;

      ///////////////
      // HEADER
      ///////////////

      //re-rendering the headHTML each time allows pattern-specific data to influence the head of the pattern
      let headPromise;
      if (patternlab.userHead) {
        headPromise = render(patternlab.userHead, allData);
      } else {
        headPromise = render(
          Pattern.createEmpty({ extendedTemplate: uikit.header }),
          allData
        );
      }

      ///////////////
      // PATTERN
      ///////////////

      //render the extendedTemplate with all data
      const patternPartialPromise = render(
        pattern,
        allData,
        patternlab.partials
      );

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
          pattern.patternGroup === pattern.patternSubgroup
            ? {
                patternGroup: pattern.patternGroup,
              }
            : {
                patternGroup: pattern.patternGroup,
                patternSubgroup: pattern.patternSubgroup,
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
        Pattern.createEmpty({ extendedTemplate: uikit.footer }),
        {
          isPattern: pattern.isPattern,
          patternData: pattern.patternData,
          cacheBuster: patternlab.cacheBuster,
        }
      );

      return Promise.all([
        headPromise,
        patternPartialPromise,
        footerPartialPromise,
      ])
        .then((intermediateResults) => {
          // retrieve results of promises
          const headHTML = intermediateResults[0]; //headPromise
          pattern.patternPartialCode = intermediateResults[1]; //patternPartialPromise
          const footerPartial = intermediateResults[2]; //footerPartialPromise
          patternWrapClassesChangePatternTemplate(patternlab, pattern);

          //finish up our footer data
          let allFooterData;
          try {
            allFooterData = jsonCopy(
              patternlab.data,
              'config.paths.source.data global data'
            );
          } catch (err) {
            logger.error(
              'There was an error parsing JSON for ' + pattern.relPath
            );
            logger.error(err);
          }
          allFooterData = _.merge(allFooterData, pattern.jsonFileData);
          allFooterData.cacheBuster = patternlab.cacheBuster;
          allFooterData.patternLabFoot = footerPartial;

          return render(patternlab.userFoot, allFooterData).then(
            async (footerHTML) => {
              ///////////////
              // WRITE FILES
              ///////////////
              await pluginManager.raiseEvent(
                patternlab,
                events.PATTERNLAB_PATTERN_WRITE_BEGIN,
                patternlab,
                pattern
              );

              //write the compiled template to the public patterns directory
              patternlab.writePatternFiles(
                headHTML,
                pattern,
                footerHTML,
                uikit.outputDir
              );

              await pluginManager.raiseEvent(
                patternlab,
                events.PATTERNLAB_PATTERN_WRITE_END,
                patternlab,
                pattern
              );

              // Allows serializing the compile state
              patternlab.graph.node(pattern).compileState =
                pattern.compileState = CompileState.CLEAN;
              logger.info('Built pattern: ' + pattern.patternPartial);
            }
          );
        })
        .catch((reason) => {
          console.log(reason);
        });
    })
  );
};
