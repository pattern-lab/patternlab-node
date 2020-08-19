'use strict';

const path = require('path');
const _ = require('lodash');

const Pattern = require('./object_factory').Pattern;
const logger = require('./log');
const uikitExcludePattern = require('./uikitExcludePattern');

// these are mocked in unit tests, so let them be overridden
let render = require('./render'); //eslint-disable-line prefer-const
let fs = require('fs-extra'); //eslint-disable-line prefer-const
let buildFooter = require('./buildFooter'); //eslint-disable-line prefer-const
let exportData = require('./exportData'); //eslint-disable-line prefer-const

const ui_builder = function() {
  /**
   * Registers the pattern to the patternPaths object for the appropriate patternGroup and basename
   * patternGroup + patternBaseName are what comprise the patternPartial (atoms-colors)
   * @param patternlab - global data store
   * @param pattern - the pattern to add
   */
  function addToPatternPaths(patternlab, pattern) {
    if (!patternlab.patternPaths[pattern.patternGroup]) {
      patternlab.patternPaths[pattern.patternGroup] = {};
    }

    // only add real patterns
    if (pattern.isPattern && !pattern.isDocPattern) {
      patternlab.patternPaths[pattern.patternGroup][pattern.patternBaseName] =
        pattern.name;
    }
  }

  /**
   * Registers the pattern with the viewAllPaths object for the appropriate patternGroup and patternSubgroup
   * @param patternlab - global data store
   * @param pattern -  the pattern to add
   */
  function addToViewAllPaths(patternlab, pattern) {
    if (!patternlab.viewAllPaths[pattern.patternGroup]) {
      patternlab.viewAllPaths[pattern.patternGroup] = {};
    }

    if (
      !patternlab.viewAllPaths[pattern.patternGroup][pattern.patternSubgroup] &&
      pattern.patternSubgroup
    ) {
      // note these retain any number prefixes if present, because these paths match the filesystem
      patternlab.viewAllPaths[pattern.patternGroup][
        pattern.patternSubgroup
      ] = `${pattern.patternGroup}-${pattern.patternSubgroup}`;
    }

    // add all if it does not exist yet
    if (!patternlab.viewAllPaths[pattern.patternGroup].all) {
      patternlab.viewAllPaths[pattern.patternGroup].all = pattern.patternGroup;
    }
  }

  /**
   * Returns whether or not the pattern should be excluded from direct rendering or navigation on the front end
   * @param pattern - the pattern to test for inclusion/exclusion
   * @param patternlab - global data store
   * @param uikit - the current uikit being built
   * @returns boolean - whether or not the pattern is excluded
   */
  function isPatternExcluded(pattern, patternlab, uikit) {
    let isOmitted;

    // skip patterns that the uikit does not want to render
    isOmitted = uikitExcludePattern(pattern, uikit);
    if (isOmitted) {
      logger.info(
        `Omitting ${pattern.patternPartial} from styleguide patterns because its pattern state or tag is excluded within ${uikit.name}.`
      );
      return true;
    }

    // skip underscore-prefixed files
    isOmitted = pattern.isPattern && pattern.fileName.charAt(0) === '_';
    if (isOmitted) {
      logger.info(
        `Omitting ${pattern.patternPartial} from styleguide patterns because it has an underscore prefix.`
      );
      return true;
    }

    // this is meant to be a homepage that is not present anywhere else
    isOmitted = pattern.patternPartial === patternlab.config.defaultPattern;
    if (isOmitted) {
      logger.info(
        `Omitting ${pattern.patternPartial} from styleguide patterns because it is defined as a defaultPattern.`
      );
      patternlab.defaultPattern = pattern;
      return true;
    }

    // this pattern is contained with a directory prefixed with an underscore (a handy way to hide whole directories from the nav
    isOmitted =
      pattern.relPath.charAt(0) === '_' ||
      pattern.relPath.indexOf(path.sep + '_') > -1;
    if (isOmitted) {
      logger.info(
        `Omitting ${pattern.patternPartial} from styleguide patterns because its contained within an underscored directory.`
      );
      return true;
    }

    // this pattern is a head or foot pattern
    isOmitted = pattern.isMetaPattern;
    if (isOmitted) {
      logger.info(
        `Omitting ${pattern.patternPartial} from styleguide patterns because its a meta pattern.`
      );
      return true;
    }

    // yay, let's include this on the front end
    return isOmitted;
  }

  /**
   * For the given pattern, find or construct the view-all pattern block for the group
   * @param pattern - the pattern to derive our documentation pattern from
   * @param patternlab - global data store
   * @param isSubgroupPattern - whether or not this is a subgroupPattern or a typePattern (groupedPatterns not supported yet)
   * @returns the found or created pattern object
   */
  function injectDocumentationBlock(pattern, patternlab, isSubgroupPattern) {
    // first see if loadPattern processed one already
    let docPattern =
      patternlab.subgroupPatterns[
        pattern.patternGroup +
          (isSubgroupPattern ? '-' + pattern.patternSubgroup : '')
      ];
    if (docPattern) {
      docPattern.isDocPattern = true;
      docPattern.order = Number.MIN_SAFE_INTEGER;
      return docPattern;
    }

    // if not, create one now
    docPattern = new Pattern.createEmpty(
      {
        name: pattern.flatPatternPath,
        patternName: _.startCase(
          isSubgroupPattern ? pattern.patternSubgroup : pattern.patternGroup
        ),
        patternDesc: '',
        patternPartial: `viewall-${pattern.patternGroup}-${
          isSubgroupPattern ? pattern.patternSubgroup : 'all'
        }`,
        patternSectionSubgroup: true,
        patternLink: path.join(
          isSubgroupPattern ? pattern.flatPatternPath : pattern.patternGroup,
          'index.html'
        ),
        isPattern: false,
        engine: null,
        flatPatternPath: pattern.flatPatternPath,
        isDocPattern: true,
        order: Number.MIN_SAFE_INTEGER,
      },
      patternlab
    );
    return docPattern;
  }

  /**
   * Registers flat patterns with the patternGroups object
   * This is a new menu group like atoms
   * @param patternlab - global data store
   * @param pattern - the pattern to register
   */
  function addPatternGroup(patternlab, pattern) {
    patternlab.patternGroups.push({
      patternGroupLC: _.kebabCase(pattern.patternGroup),
      patternGroupUC: _.startCase(pattern.patternGroup),
      patternGroup: pattern.patternGroup,
      patternGroupDash: pattern.patternGroup, //todo verify
      patternGroupItems: [],
    });
  }

  /**
   * Return the patternGroup object for the given pattern. Exits application if not found.
   * @param patternlab - global data store
   * @param pattern - the pattern to derive the pattern Type from
   * @returns the found pattern type object
   */
  function getPatternGroup(patternlab, pattern) {
    const patternGroup = _.find(patternlab.patternGroups, [
      'patternGroup',
      pattern.patternGroup,
    ]);

    if (!patternGroup) {
      logger.error(
        `Could not find patternGroup ${pattern.patternGroup}. This is a critical error.`
      );
    }

    return patternGroup;
  }

  /**
   * Return the patternSubgroup object for the given pattern. Exits application if not found.
   * @param patternlab - global data store
   * @param pattern - the pattern to derive the pattern subgroup from
   * @returns the found patternSubgroup object
   */
  function getPatternSubgroup(patternlab, pattern) {
    const patternGroup = getPatternGroup(patternlab, pattern);
    const patternSubgroup = _.find(patternGroup.patternGroupItems, [
      'patternSubgroup',
      pattern.patternSubgroup,
    ]);

    if (!patternSubgroup) {
      logger.error(
        `Could not find patternGroup ${pattern.patternGroup}-${pattern.patternGroup}. This is a critical error.`
      );
    }

    return patternSubgroup;
  }

  /**
   * Registers the pattern with the appropriate patternGroup.patternGroupItems object
   * This is a new menu group like atoms/global
   * @param patternlab - global data store
   * @param pattern - the pattern to register
   */
  function addPatternSubgroup(patternlab, pattern) {
    const newSubgroup = {
      patternSubgroupLC: _.kebabCase(pattern.patternSubgroup),
      patternSubgroupUC: _.startCase(pattern.patternSubgroup),
      patternSubgroup: pattern.patternSubgroup,
      patternSubgroupDash: pattern.patternSubgroup, //todo verify
      patternSubgroupItems: [],
    };
    const patternGroup = getPatternGroup(patternlab, pattern);
    // TODO: Add order here and sort by order
    const insertIndex = _.sortedIndexBy(
      patternGroup.patternGroupItems,
      newSubgroup,
      'patternSubgroup'
    );
    patternGroup.patternGroupItems.splice(insertIndex, 0, newSubgroup);
  }

  /**
   * Creates a patternSubgroupItem object from a pattern
   * This is a menu item you click on
   * @param pattern - the pattern to derive the subgroupitem from
   * @returns {{patternPartial: string, patternName: (*|string), patternState: string, patternPath: string}}
   */
  function createPatternSubgroupItem(pattern) {
    return {
      patternPartial: pattern.patternPartial,
      patternName: pattern.patternName,
      patternState: pattern.patternState,
      patternPath: pattern.patternLink,
      name: pattern.name,
      isDocPattern: false,
      order: Number(pattern.order) || 0, // Failsafe is someone entered a string
    };
  }

  /**
   * Registers the pattern with the appropriate patternGroup.patternSubgroup.patternSubgroupItems array
   * These are the actual menu items you click on
   * @param patternlab - global data store
   * @param pattern - the pattern to derive the subgroupitem from
   * @param createViewAllVariant - whether or not to create the special view all item
   */
  function addPatternSubgroupItem(
    patternlab,
    pattern,
    createSubgroupViewAllVariant
  ) {
    let newSubgroupItem;

    if (createSubgroupViewAllVariant) {
      newSubgroupItem = {
        patternPartial:
          'viewall-' + pattern.patternGroup + '-' + pattern.patternSubgroup,
        patternName: `View All`,
        patternPath: encodeURI(pattern.flatPatternPath + '/index.html'),
        patternGroup: pattern.patternGroup,
        patternSubgroup: pattern.patternSubgroup,
        name: pattern.flatPatternPath,
        isDocPattern: true,
        order: Number.MAX_SAFE_INTEGER,
      };
    } else {
      newSubgroupItem = createPatternSubgroupItem(pattern);
    }

    const patternSubgroup = getPatternSubgroup(patternlab, pattern);
    patternSubgroup.patternSubgroupItems.push(newSubgroupItem);
    patternSubgroup.patternSubgroupItems = _.sortBy(
      patternSubgroup.patternSubgroupItems,
      ['order', 'name']
    );
  }

  /**
   * Registers flat patterns to the appropriate type
   * @param patternlab - global data store
   * @param pattern - the pattern to add
   */
  function addPatternItem(patternlab, pattern, isViewAllVariant) {
    const patternGroup = getPatternGroup(patternlab, pattern);
    if (!patternGroup) {
      logger.error(
        `Could not find patternGroup ${pattern.patternGroup}. This is a critical error.`
      );
    }

    patternGroup.patternItems = patternGroup.patternItems || [];
    if (isViewAllVariant) {
      patternGroup.patternItems.push({
        patternPartial: `viewall-${pattern.patternGroup}-all`,
        patternName: `View all ${_.startCase(pattern.patternGroup)}`,
        patternPath: encodeURI(pattern.patternGroup + '/index.html'),
        name: pattern.patternGroup,
        isDocPattern: true,
        order: Number.MAX_SAFE_INTEGER, // Or pattern.groupData.order
      });
    } else {
      patternGroup.patternItems.push(createPatternSubgroupItem(pattern));
    }
    patternGroup.patternItems = _.sortBy(patternGroup.patternItems, [
      'order',
      'name',
    ]);
  }

  /**
   * Sorts patterns based on order property found within pattern markdown, falling back on name.
   * @param patternsArray - patterns to sort
   * @returns sorted patterns
   */
  function sortPatterns(patternsArray) {
    return patternsArray.sort(function(a, b) {
      let aOrder = parseInt(a.order, 10);
      const bOrder = parseInt(b.order, 10);

      if (aOrder === NaN) {
        aOrder = Number.MAX_SAFE_INTEGER;
      }

      if (bOrder === NaN) {
        aOrder = Number.MAX_SAFE_INTEGER;
      }

      // always return a docPattern first
      if (a.isDocPattern && !b.isDocPattern) {
        return -1;
      }

      if (!a.isDocPattern && b.isDocPattern) {
        return 1;
      }

      // use old alphabetical ordering if we have nothing else to use
      // pattern.order will be Number.MAX_SAFE_INTEGER if never defined by markdown, or markdown parsing fails
      if (
        aOrder === Number.MAX_SAFE_INTEGER &&
        bOrder === Number.MAX_SAFE_INTEGER
      ) {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
      }

      // if we get this far, we can sort safely
      if (aOrder && bOrder) {
        if (aOrder > bOrder) {
          return 1;
        }
        if (aOrder < bOrder) {
          return -1;
        }
      }
      return 0;
    });
  }

  /**
   * Returns an object representing how the front end styleguide and navigation is structured
   * @param patternlab - global data store
   * @param uikit - the current uikit being built
   * @returns patterns grouped by type -> subgroup like atoms -> global -> pattern, pattern, pattern
   */
  function groupPatterns(patternlab, uikit) {
    const groupedPatterns = {
      patternGroups: {},
    };

    _.forEach(patternlab.patterns, function(pattern) {
      // ignore patterns we can omit from rendering directly
      pattern.omitFromStyleguide = isPatternExcluded(
        pattern,
        patternlab,
        uikit
      );
      if (pattern.omitFromStyleguide) {
        return;
      }

      if (!groupedPatterns.patternGroups[pattern.patternGroup]) {
        groupedPatterns.patternGroups[pattern.patternGroup] = {};
        pattern.isSubgroupPattern = false;
        addPatternGroup(patternlab, pattern);
        if (
          !pattern.isFlatPattern ||
          patternlab.config.renderFlatPatternsOnViewAllPages
        ) {
          addPatternItem(patternlab, pattern, true);
        }
        addToViewAllPaths(patternlab, pattern);
      }

      // continue building navigation for nested patterns
      if (!pattern.isFlatPattern) {
        if (
          !groupedPatterns.patternGroups[pattern.patternGroup][
            pattern.patternSubgroup
          ]
        ) {
          addPatternSubgroup(patternlab, pattern);

          pattern.isSubgroupPattern = !pattern.isPattern;
          groupedPatterns.patternGroups[pattern.patternGroup][
            pattern.patternSubgroup
          ] = {};
          groupedPatterns.patternGroups[pattern.patternGroup][
            pattern.patternSubgroup
          ][
            'viewall-' + pattern.patternGroup + '-' + pattern.patternSubgroup
          ] = injectDocumentationBlock(pattern, patternlab, true);

          addToViewAllPaths(patternlab, pattern);
          addPatternSubgroupItem(patternlab, pattern, true);
        }

        groupedPatterns.patternGroups[pattern.patternGroup][
          pattern.patternSubgroup
        ][pattern.patternBaseName] = pattern;

        addToPatternPaths(patternlab, pattern);
        addPatternSubgroupItem(patternlab, pattern);
      } else {
        addPatternItem(patternlab, pattern);
        addToPatternPaths(patternlab, pattern);
      }
    });

    return groupedPatterns;
  }

  /**
   * Search all flat patterns of a specific pattern type
   *
   * @param {Patternlab} patternlab Current patternlab instance
   * @param {string} patternGroup indicator which patterns to search for
   */
  function getFlatPatternItems(patternlab, patternGroup) {
    const patterns = _.filter(
      patternlab.patterns,
      pattern => pattern.patternGroup === patternGroup && pattern.isFlatPattern
    );
    if (patterns) {
      return sortPatterns(patterns);
    }
    return [];
  }

  /**
   * Takes a set of patterns and builds a viewall HTML page for them
   * Used by the type and subgroup viewall sets
   * @param patternlab - global data store
   * @param patterns - the set of patterns to build the viewall page for
   * @param patternPartial - a key used to identify the viewall page
   * @returns A promise which resolves with the HTML
   */
  function buildViewAllHTML(patternlab, patterns, patternPartial, uikit) {
    return render(
      Pattern.createEmpty({ extendedTemplate: uikit.viewAll }, patternlab),
      {
        // data
        partials: patterns,
        patternPartial: 'viewall-' + patternPartial,
        cacheBuster: patternlab.cacheBuster,
      },
      {
        // templates
        patternSection: uikit.patternSection,
        patternSectionSubgroup: uikit.patternSectionSubgroup,
      }
    ).catch(reason => {
      console.log(reason);
      logger.error('Error building buildViewAllHTML');
    });
  }

  /**
   * Constructs viewall pages for each set of grouped patterns
   * @param mainPageHeadHtml - the already built main page HTML
   * @param patternlab - global data store
   * @param styleguidePatterns - the grouped set of patterns
   * @returns every built pattern and set of viewall patterns, so the styleguide can use it
   */
  function buildViewAllPages(
    mainPageHeadHtml,
    patternlab,
    styleguidePatterns,
    uikit
  ) {
    const paths = patternlab.config.paths;
    let patterns = [];

    // loop through the grouped styleguide patterns, building at each level
    const allPatternGroupPromises = _.map(
      styleguidePatterns.patternGroups,
      (patternGroup, patternGroupName) => {
        let groupedPatterns = [];
        let styleguideGroupedPatterns = [];
        const styleGuideExcludes = patternlab.config.styleGuideExcludes || [];

        /**
         * View all pages for subgroups
         */
        const subgroupPromises = _.map(
          _.values(patternGroup),
          (patternSubgroups, patternSubgroup, originalPatternGroup) => {
            let p;
            const samplePattern = _.find(
              patternSubgroups,
              st => !st.patternPartial.startsWith('viewall-')
            );
            const patternName = Object.keys(
              _.values(originalPatternGroup)[patternSubgroup]
            )[1];
            const patternPartial =
              patternGroupName + '-' + samplePattern.patternSubgroup;

            // do not create a viewall page for flat patterns
            if (patternGroupName === patternName) {
              logger.debug(
                `skipping ${patternGroupName} as flat patterns do not have view all pages`
              );
              return Promise.resolve();
            }

            // render the footer needed for the viewall template
            return buildFooter(patternlab, `viewall-${patternPartial}`, uikit)
              .then(footerHTML => {
                // render the viewall template by finding these smallest subgroup-grouped patterns
                const subgroupPatterns = sortPatterns(
                  _.values(patternSubgroups)
                );

                // determine if we should write at this time by checking if these are flat patterns or grouped patterns
                p = _.find(subgroupPatterns, function(pat) {
                  return pat.isDocPattern;
                });

                // determine if we should omit this subpatternGroup completely from the viewall page
                const omitPatternGroup =
                  styleGuideExcludes &&
                  styleGuideExcludes.length &&
                  _.some(
                    styleGuideExcludes,
                    exclude => exclude === `${patternGroupName}/${patternName}`
                  );
                if (omitPatternGroup) {
                  logger.debug(
                    `Omitting ${patternGroupName}/${patternName} from  building a viewall page because its patternSubgroup is specified in styleguideExcludes.`
                  );
                } else {
                  styleguideGroupedPatterns = styleguideGroupedPatterns.concat(
                    subgroupPatterns
                  );
                }

                groupedPatterns = groupedPatterns.concat(subgroupPatterns);

                // render the viewall template for the subgroup
                return buildViewAllHTML(
                  patternlab,
                  subgroupPatterns,
                  patternPartial,
                  uikit
                )
                  .then(viewAllHTML => {
                    return fs.outputFile(
                      path.join(
                        process.cwd(),
                        uikit.outputDir,
                        path.join(
                          `${paths.public.patterns}${p.flatPatternPath}`,
                          'index.html'
                        )
                      ),
                      mainPageHeadHtml + viewAllHTML + footerHTML
                    );
                  })
                  .catch(reason => {
                    console.log(reason);
                    logger.error('Error building ViewAllHTML');
                  });
              })
              .catch(reason => {
                console.log(reason);
                logger.error('Error building footer HTML');
              });
          }
        );

        /**
         * View all pages for groups
         */
        return Promise.all(subgroupPromises)
          .then(() => {
            // render the footer needed for the viewall template
            return buildFooter(
              patternlab,
              `viewall-${patternGroupName}-all`,
              uikit
            )
              .then(footerHTML => {
                const sortedFlatPatterns = getFlatPatternItems(
                  patternlab,
                  patternGroupName
                );

                if (patternlab.config.renderFlatPatternsOnViewAllPages) {
                  // Check if this is a flat pattern group
                  groupedPatterns = sortedFlatPatterns.concat(groupedPatterns);
                }

                // get the appropriate patternGroup
                const anyPatternOfType = _.find(groupedPatterns, function(pat) {
                  return pat.patternGroup && pat.patternGroup !== '';
                });

                if (!anyPatternOfType || !groupedPatterns.length) {
                  logger.debug(
                    `skipping ${patternGroupName} as flat patterns do not have view all pages`
                  );
                  return Promise.resolve([]);
                }

                // render the viewall template for the type
                return buildViewAllHTML(
                  patternlab,
                  groupedPatterns,
                  patternGroupName,
                  uikit
                )
                  .then(viewAllHTML => {
                    fs.outputFileSync(
                      path.join(
                        process.cwd(),
                        uikit.outputDir,
                        path.join(
                          `${paths.public.patterns}${patternGroupName}`,
                          'index.html'
                        )
                      ),
                      mainPageHeadHtml + viewAllHTML + footerHTML
                    );

                    // determine if we should omit this patternGroup completely from the viewall page
                    const omitPatternGroup =
                      styleGuideExcludes &&
                      styleGuideExcludes.length &&
                      _.some(styleGuideExcludes, function(exclude) {
                        return exclude === patternGroupName;
                      });
                    if (omitPatternGroup) {
                      logger.debug(
                        `Omitting ${patternGroupName} from  building a viewall page because its patternGroup is specified in styleguideExcludes.`
                      );
                    } else {
                      if (patternlab.config.renderFlatPatternsOnViewAllPages) {
                        patterns = sortedFlatPatterns;
                        patterns = patterns.concat(styleguideGroupedPatterns);
                      } else {
                        patterns = styleguideGroupedPatterns;
                      }
                    }
                    return Promise.resolve(patterns);
                  })
                  .catch(reason => {
                    console.log(reason);
                    logger.error('Error building ViewAllHTML');
                  });
              })
              .catch(reason => {
                console.log(reason);
                logger.error('Error building footerHTML');
              });
          })
          .catch(reason => {
            console.log(reason);
            logger.error('Error during buildViewAllPages');
          });
      }
    );

    return Promise.all(allPatternGroupPromises)
      .then(allPatterns =>
        Promise.resolve(_.filter(allPatterns, p => p.length))
      )
      .catch(reason => {
        console.log(reason);
        logger.error('Error during buildViewAllPages');
      });
  }

  /**
   * Reset any global data we use between builds to guard against double adding things
   *
   * @param {Patternlab} patternlab Actual patternlab instance
   */
  function resetUIBuilderState(patternlab) {
    patternlab.patternPaths = {};
    patternlab.viewAllPaths = {};
    patternlab.patternGroups = [];
  }

  /**
   * Uniques all generated patterns and groups, also adds a group document pattern before
   * each group. Used for generating view all page and all its pattern.
   *
   * @param {[Pattern[]]} allPatterns All generated patterns
   * @param {Patternlab} patternlab Actual patternlab instance
   */
  function uniqueAllPatterns(allPatterns, patternlab) {
    return _.uniq(
      _.flatMapDeep(
        _.map(allPatterns, patterns => [
          injectDocumentationBlock(
            _.find(patterns, p => !p.patternPartial.startsWith('viewall-')),
            patternlab,
            false
          ),
          ...patterns,
        ]),
        pattern => pattern
      )
    );
  }

  /**
   * The main entry point for ui_builder
   *
   * @param patternlab - global data store
   * @returns {Promise} a promise fulfilled when build is complete
   */
  function buildFrontend(patternlab) {
    resetUIBuilderState(patternlab);

    const paths = patternlab.config.paths;

    const uikitPromises = _.map(patternlab.uikits, uikit => {
      // determine which patterns should be included in the front-end rendering
      const styleguidePatterns = groupPatterns(patternlab, uikit);

      return new Promise(resolve => {
        // set the pattern-specific header by compiling the general-header with data, and then adding it to the meta header
        const headerPromise = render(
          Pattern.createEmpty({ extendedTemplate: uikit.header }, patternlab),
          {
            cacheBuster: patternlab.cacheBuster,
          }
        )
          .then(headerPartial => {
            const headFootData = patternlab.data;
            headFootData.patternLabHead = headerPartial;
            headFootData.cacheBuster = patternlab.cacheBuster;
            return render(patternlab.userHead, headFootData);
          })
          .catch(reason => {
            console.log(reason);
            logger.error('error during header render()');
          });

        // set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer
        const footerPromise = render(
          Pattern.createEmpty({ extendedTemplate: uikit.footer }, patternlab),
          {
            patternData: '{}',
            cacheBuster: patternlab.cacheBuster,
          }
        )
          .then(footerPartial => {
            const headFootData = patternlab.data;
            headFootData.patternLabFoot = footerPartial;
            return render(patternlab.userFoot, headFootData);
          })
          .catch(reason => {
            console.log(reason);
            logger.error('error during footer render()');
          });

        return Promise.all([headerPromise, footerPromise]).then(
          headFootPromiseResults => {
            // build the viewall pages

            return buildViewAllPages(
              headFootPromiseResults[0],
              patternlab,
              styleguidePatterns,
              uikit
            )
              .then(allPatterns => {
                // todo track down why we need to make this unique in the first place
                const uniquePatterns = uniqueAllPatterns(
                  allPatterns,
                  patternlab
                );

                // add the defaultPattern if we found one
                if (patternlab.defaultPattern) {
                  uniquePatterns.push(patternlab.defaultPattern);
                  addToPatternPaths(patternlab, patternlab.defaultPattern);
                }

                // build the main styleguide page
                return render(
                  Pattern.createEmpty(
                    {
                      extendedTemplate: uikit.viewAll,
                    },
                    patternlab
                  ),
                  {
                    partials: uniquePatterns,
                  },
                  {
                    patternSection: uikit.patternSection,
                    patternSectionSubgroup: uikit.patternSectionSubgroup,
                  }
                )
                  .then(styleguideHtml => {
                    fs.outputFileSync(
                      path.resolve(
                        path.join(
                          process.cwd(),
                          uikit.outputDir,
                          paths.public.styleguide,
                          'html/styleguide.html'
                        )
                      ),
                      headFootPromiseResults[0] +
                        styleguideHtml +
                        headFootPromiseResults[1]
                    );

                    logger.info('Built Pattern Lab front end');

                    // move the index file from its asset location into public root
                    let patternlabSiteHtml;
                    try {
                      patternlabSiteHtml = fs.readFileSync(
                        path.resolve(
                          path.join(
                            uikit.modulePath,
                            paths.source.styleguide,
                            'index.html'
                          )
                        ),
                        'utf8'
                      );
                    } catch (err) {
                      logger.error(
                        `Could not load one or more styleguidekit assets from ${paths.source.styleguide}`
                      );
                    }
                    fs.outputFileSync(
                      path.resolve(
                        path.join(
                          process.cwd(),
                          uikit.outputDir,
                          paths.public.root,
                          'index.html'
                        )
                      ),
                      patternlabSiteHtml
                    );

                    // write out patternlab.data object to be read by the client
                    exportData(patternlab);
                    resolve();
                  })
                  .catch(reason => {
                    console.log(reason);
                    logger.error('error during buildFrontend()');
                  });
              })
              .catch(reason => {
                console.log(reason);
                logger.error('error during buildViewAllPages()');
              });
          }
        );
      });
    });
    return Promise.all(uikitPromises);
  }

  return {
    buildFrontend: buildFrontend,
    isPatternExcluded: isPatternExcluded,
    groupPatterns: groupPatterns,
    resetUIBuilderState: resetUIBuilderState,
    uniqueAllPatterns: uniqueAllPatterns,
    buildViewAllPages: buildViewAllPages,
  };
};

module.exports = ui_builder;
