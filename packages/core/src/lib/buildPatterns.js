'use strict';

const { concat } = require('lodash');
const copy = require('recursive-copy');
const path = require('path');

const cleanBuildDirectory = require('./cleanBuildDirectory');
const compose = require('./compose');
const events = require('./events');
const loadPatternGraph = require('./loadPatternGraph');
const logger = require('./log');
const PatternGraph = require('./pattern_graph').PatternGraph;
const CompileState = require('./object_factory').CompileState;
const pe = require('./pattern_exporter');
const lh = require('./lineage_hunter');
const markModifiedPatterns = require('./markModifiedPatterns');
const parseAllLinks = require('./parseAllLinks');
const render = require('./render');
const Pattern = require('./object_factory').Pattern;

let fs = require('fs-extra'); // eslint-disable-line
let ui_builder = require('./ui_builder'); // eslint-disable-line
let copier = require('./copier'); // eslint-disable-line
let pattern_exporter = new pe(); // eslint-disable-line
let serve = require('./serve'); // eslint-disable-line

const lineage_hunter = new lh();

module.exports = (deletePatternDir, patternlab, additionalData) => {
  patternlab.events.emit(events.PATTERNLAB_BUILD_PATTERN_START, patternlab);

  const paths = patternlab.config.paths;

  //
  // CHECK INCREMENTAL BUILD GRAPH
  //
  const graph = (patternlab.graph = loadPatternGraph(
    patternlab,
    deletePatternDir
  ));
  const graphNeedsUpgrade = !PatternGraph.checkVersion(graph);
  if (graphNeedsUpgrade) {
    logger.info(
      'Due to an upgrade, a complete rebuild is required and the public/patterns directory was deleted. ' +
        'Incremental build is available again on the next successful run.'
    );

    // Ensure that the freshly built graph has the latest version again.
    patternlab.graph.upgradeVersion();
  }

  // Flags
  patternlab.incrementalBuildsEnabled = !(
    deletePatternDir || graphNeedsUpgrade
  );

  //
  // CLEAN BUILD DIRECTORY, maybe
  //
  return cleanBuildDirectory(
    patternlab.incrementalBuildsEnabled,
    patternlab
  ).then(() => {
    patternlab.buildGlobalData(additionalData);

    return patternlab
      .processAllPatternsIterative(paths.source.patterns)
      .then(() => {
        patternlab.events.emit(
          events.PATTERNLAB_PATTERN_ITERATION_END,
          patternlab
        );

        //now that all the main patterns are known, look for any links that might be within data and expand them
        //we need to do this before expanding patterns & partials into extendedTemplates, otherwise we could lose the data -> partial reference
        parseAllLinks(patternlab);

        //dive again to recursively include partials, filling out the
        //extendedTemplate property of the patternlab.patterns elements

        return patternlab
          .processAllPatternsRecursive(paths.source.patterns)
          .then(() => {
            //cascade any patternStates
            lineage_hunter.cascade_pattern_states(patternlab);

            //set the pattern-specific header by compiling the general-header with data, and then adding it to the meta header
            return render(
              Pattern.createEmpty({
                extendedTemplate: patternlab.header,
              }),
              {
                cacheBuster: patternlab.cacheBuster,
              }
            )
              .then(results => {
                patternlab.data.patternLabHead = results;

                // If deletePatternDir == true or graph needs to be updated
                // rebuild all patterns
                let patternsToBuild = null;

                // If deletePatternDir == true or graph needs to be updated
                // rebuild all patterns
                patternsToBuild = null;

                if (patternlab.incrementalBuildsEnabled) {
                  // When the graph was loaded from file, some patterns might have been moved/deleted between runs
                  // so the graph data become out of sync
                  patternlab.graph.sync().forEach(n => {
                    logger.info('[Deleted/Moved] ' + n);
                  });

                  // TODO Find created or deleted files
                  const now = new Date().getTime();
                  markModifiedPatterns(now, patternlab);
                  patternsToBuild = patternlab.graph.compileOrder();
                } else {
                  // build all patterns, mark all to be rebuilt
                  patternsToBuild = patternlab.patterns;
                  for (const p of patternsToBuild) {
                    p.compileState = CompileState.NEEDS_REBUILD;
                  }
                }
                //render all patterns last, so lineageR works
                const allPatternsPromise = patternsToBuild.map(pattern =>
                  compose(pattern)
                );
                //copy non-pattern files like JavaScript
                const allJS = patternsToBuild.map(pattern => {
                  const { name, patternPartial, subdir } = pattern;
                  const {
                    source: { patterns: sourceDir },
                    public: { patterns: publicDir },
                  } = patternlab.config.paths;
                  const src = path.join(sourceDir, subdir);
                  const dest = path.join(publicDir, name);
                  return copy(src, dest, {
                    overwrite: true,
                    filter: ['*.js'],
                    rename: () => {
                      return `${patternPartial}.js`;
                    },
                  }).on(copy.events.COPY_FILE_COMPLETE, () => {
                    logger.debug(
                      `Copied JavaScript files from ${src} to ${dest}`
                    );
                  });
                });
                return Promise.all(concat(allPatternsPromise, allJS))
                  .then(() => {
                    // Saves the pattern graph when all files have been compiled
                    PatternGraph.storeToFile(patternlab);
                    if (patternlab.config.exportToGraphViz) {
                      PatternGraph.exportToDot(
                        patternlab,
                        'dependencyGraph.dot'
                      );
                      logger.info(
                        `Exported pattern graph to ${path.join(
                          config.paths.public.root,
                          'dependencyGraph.dot'
                        )}`
                      );
                    }

                    //export patterns if necessary
                    pattern_exporter.export_patterns(patternlab);
                  })
                  .catch(reason => {
                    console.log(reason);
                    logger.error('Error rendering patterns');
                  });
              })
              .catch(reason => {
                console.log(reason);
                logger.error('Error rendering pattern lab header');
              });
          })
          .catch(reason => {
            console.log(reason);
            logger.error('Error processing patterns recursively');
          });
      })
      .catch(reason => {
        console.log(reason);
        logger.error('Error in buildPatterns()');
      });
  });
};
