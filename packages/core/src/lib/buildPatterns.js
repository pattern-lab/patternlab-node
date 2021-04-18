'use strict';

const { concat, map } = require('lodash');
const copy = require('recursive-copy');
const path = require('path');

const cleanBuildDirectory = require('./cleanBuildDirectory');
const compose = require('./compose');
const events = require('./events');
const loadPatternGraph = require('./loadPatternGraph');
const logger = require('./log');
const PatternGraph = require('./pattern_graph').PatternGraph;
const CompileState = require('./object_factory').CompileState;
const processMetaPattern = require('./processMetaPattern');
const pe = require('./pattern_exporter');
const lh = require('./lineage_hunter');
const pm = require('./plugin_manager');
const pluginManager = new pm();
const markModifiedPatterns = require('./markModifiedPatterns');
const parseAllLinks = require('./parseAllLinks');
const render = require('./render');
const Pattern = require('./object_factory').Pattern;

let fs = require('fs-extra'); // eslint-disable-line
let pattern_exporter = new pe(); // eslint-disable-line

const lineage_hunter = new lh();

module.exports = async (deletePatternDir, patternlab, additionalData) => {
  await pluginManager.raiseEvent(
    patternlab,
    events.PATTERNLAB_BUILD_START,
    patternlab
  );

  const paths = patternlab.config.paths;

  //
  // CHECK INCREMENTAL BUILD GRAPH
  //
  const graph = (patternlab.graph = loadPatternGraph(
    patternlab,
    patternlab.config.cleanPublic
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
    patternlab.config.cleanPublic ||
    graphNeedsUpgrade ||
    deletePatternDir
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
      .then(async () => {
        await pluginManager.raiseEvent(
          patternlab,
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
            //take the user defined head and foot and process any data and patterns that apply

            //todo this need to be made aware of multiple ui kits
            //perhaps we can check for a convention like [uikitname]_00-head.mustache, and if found, add them to patternlab.uikits[uikitname].userFoot
            //then, if present, use those during compose()
            const headPatternPromise = processMetaPattern(
              `_head.${patternlab.config.patternExtension}`,
              'userHead',
              patternlab
            );
            const footPatternPromise = processMetaPattern(
              `_foot.${patternlab.config.patternExtension}`,
              'userFoot',
              patternlab
            );

            return Promise.all([headPatternPromise, footPatternPromise])
              .then(() => {
                //cascade any patternStates
                lineage_hunter.cascade_pattern_states(patternlab);

                //set the pattern-specific header by compiling the general-header with data, and then adding it to the meta header
                return render(
                  Pattern.createEmpty({
                    // todo should this be uikit.header?
                    extendedTemplate: patternlab.header,
                  }),
                  {
                    cacheBuster: patternlab.cacheBuster,
                  }
                )
                  .then((results) => {
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
                      patternlab.graph.sync().forEach((n) => {
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
                    const allPatternsPromise = patternsToBuild.map(
                      async (pattern) => await compose(pattern, patternlab)
                    );
                    //copy non-pattern files like JavaScript
                    const allJS = patternsToBuild.map((pattern) => {
                      const { name, patternPartial, subdir } = pattern;
                      const {
                        source: { patterns: sourceDir },
                        public: { patterns: publicDir },
                      } = patternlab.config.paths;
                      const src = path.join(sourceDir, subdir);
                      const dest = path.join(publicDir, name);
                      return map(patternlab.uikits, (uikit) => {
                        return copy(
                          src,
                          path.resolve(process.cwd(), uikit.outputDir, dest),
                          {
                            overwrite: true,
                            filter: ['*.js'],
                            rename: () => {
                              return `${patternPartial}.js`;
                            },
                          }
                        ).on(copy.events.COPY_FILE_COMPLETE, () => {
                          logger.debug(
                            `Copied JavaScript files from ${src} to ${dest}`
                          );
                        });
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
                              patternlab.config.paths.public.root,
                              'dependencyGraph.dot'
                            )}`
                          );
                        }

                        //export patterns if necessary
                        pattern_exporter.export_patterns(patternlab);
                      })
                      .catch((reason) => {
                        console.log(reason);
                        logger.error('Error rendering patterns');
                      });
                  })
                  .catch((reason) => {
                    console.log(reason);
                    logger.error('Error rendering pattern lab header');
                  });
              })
              .catch((reason) => {
                console.log(reason);
                logger.error('Error processing meta patterns');
              });
          })
          .catch((reason) => {
            console.log(reason);
            logger.error('Error processing patterns recursively');
          });
      })
      .catch((reason) => {
        console.log(reason);
        logger.error('Error in buildPatterns()');
      });
  });
};
