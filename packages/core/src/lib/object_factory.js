'use strict';

const _ = require('lodash');
const path = require('path');
const logger = require('./log');
const patternEngines = require('./pattern_engines');

// prefixMatcher is intended to match the leading maybe-underscore,
// zero or more digits, and maybe-dash at the beginning of a pattern file name we can hack them
// off and get at the good part.
const prefixMatcher = /^_?(\d+-)?/;
const prefixMatcherDeprecationCheckOrder = /^(\d+-).+/;
const prefixMatcherDeprecationCheckHidden = /^_.+/;

/**
 * Pattern constructor / Pattern properties
 *
 * Before changing functionalities of the pattern object please read the following pull requests
 * to get more details about the behavior of the folder structure
 * https://patternlab.io/docs/overview-of-patterns/#heading-deeper-nesting
 * https://github.com/pattern-lab/patternlab-node/pull/992
 * https://github.com/pattern-lab/patternlab-node/pull/1016
 * https://github.com/pattern-lab/patternlab-node/pull/1143
 *
 * @param {string} relPath relative directory
 * @param {Object} jsonFileData The JSON used to render values in the pattern.
 * @param {Patternlab} patternlab The actual pattern lab instance
 * @param {boolean} isPromoteToFlatPatternRun specifies if the pattern needs to be removed from its deep nesting folder
 */
const Pattern = function (
  relPath,
  jsonFileData,
  patternlab,
  isPromoteToFlatPatternRun
) {
  this.relPath = path.normalize(relPath); // 'atoms/global/colors.mustache'

  /**
   * We expect relPath to be the path of the pattern template, relative to the
   * root of the pattern tree. Parse out the path parts and save the useful ones.
   */
  const pathObj = path.parse(this.relPath);

  const info = this.getPatternInfo(
    pathObj,
    patternlab,
    isPromoteToFlatPatternRun ||
      (patternlab &&
        patternlab.config &&
        patternlab.config.allPatternsAreDeeplyNested)
  );

  this.fileName = pathObj.name; // 'colors'
  this.subdir = pathObj.dir; // 'atoms/global'
  this.fileExtension = pathObj.ext; // '.mustache'

  // TODO: Remove if block when dropping ordering by prefix and keep else code
  // (When we drop the info about the old ordering is deprecated)
  if (
    (prefixMatcherDeprecationCheckOrder.test(this.getDirLevel(0, info)) ||
      prefixMatcherDeprecationCheckOrder.test(this.getDirLevel(1, info)) ||
      prefixMatcherDeprecationCheckOrder.test(this.fileName)) &&
    patternlab &&
    patternlab.config &&
    !patternlab.config.disableDeprecationWarningForOrderPatterns
  ) {
    logger.warning(
      `${info.shortNotation}-${this.fileName} "Pattern", "Group" and "Subgroup" ordering by number prefix (##-) will be deprecated in the future.\n See https://patternlab.io/docs/reorganizing-patterns/`
    );
  }

  if (
    (prefixMatcherDeprecationCheckHidden.test(this.getDirLevel(0, info)) ||
      prefixMatcherDeprecationCheckHidden.test(this.getDirLevel(1, info)) ||
      prefixMatcherDeprecationCheckHidden.test(this.fileName)) &&
    !info.isMetaPattern &&
    patternlab &&
    patternlab.config &&
    !patternlab.config.disableDeprecationWarningForHiddenPatterns
  ) {
    logger.warning(
      `${info.shortNotation}/${this.fileName} "Pattern", "Group" and "Subgroup" hiding by underscore prefix (_*) will be deprecated in the future.\n See https://patternlab.io/docs/hiding-patterns-in-the-navigation/`
    );
  }

  // TODO: Remove if when dropping ordering by prefix and keep else code
  if (info.patternHasOwnDir) {
    // Since there is still the requirement of having the numbers provided for sorting
    // this will be required to keep the folder prefix and the variant name
    // /00-atoms/00-global/00-colors/colors~variant.hbs
    // -> 00-atoms-00-global-00-colors-variant
    this.name = `${info.shortNotation}-${path.parse(pathObj.dir).base}${
      this.fileName.indexOf('~') !== -1 ? '-' + this.fileName.split('~')[1] : ''
    }`;
  } else {
    // this is the unique name, subDir + fileName (sans extension)
    this.name = `${info.shortNotation}-${this.fileName.replace('~', '-')}`;
  }

  // the JSON used to render values in the pattern
  this.jsonFileData = jsonFileData || {};

  // flip tildes to dashes
  this.patternBaseName = this.fileName
    .replace(prefixMatcher, '')
    .replace('~', '-'); // 'colors'

  // Fancy name - Uppercase letters of pattern name partials.
  // global-colors -> 'Global Colors'
  // this is the display name for the ui. strip numeric + hyphen prefixes
  this.patternName = _.startCase(this.patternBaseName);

  // the top-level pattern group this pattern belongs to. 'atoms'
  this.patternGroup = this.getDirLevel(0, info).replace(prefixMatcher, '');

  // the sub-group this pattern belongs to.
  this.patternSubgroup = this.getDirLevel(1, info).replace(prefixMatcher, ''); // 'global'

  // the joined pattern group and subgroup directory
  this.flatPatternPath = info.shortNotation; // 'atoms-global'

  // Calculated path from the root of the public directory to the generated
  // (rendered!) html file for this pattern, to be shown in the iframe
  this.patternLink = patternlab
    ? this.getPatternLink(patternlab, 'rendered')
    : null;

  // The canonical "key" by which this pattern is known. This is the callable
  // name of the pattern. UPDATE: this.key is now known as this.patternPartial
  this.patternPartial = this.patternGroup + '-' + this.patternBaseName;

  // Let's calculate the verbose name ahead of time! We don't use path.sep here
  // on purpose. This isn't a file name!
  this.verbosePartial = `${info.shortNotation}/${this.fileName}`;

  /**
   * Definition of flat pattern:
   * The flat pattern is a high level pattern which is attached directly to
   * the main root folder or to a root directory.
   * --- This ---
   * root
   *  flatPattern
   * --- OR That ---
   * root
   *  molecules
   *   flatPattern
   */
  this.isFlatPattern =
    this.patternGroup === this.patternSubgroup || !this.patternSubgroup;

  this.isPattern = true;
  this.patternState = '';
  this.template = '';
  this.patternPartialCode = '';
  this.lineage = [];
  this.lineageIndex = [];
  this.lineageR = [];
  this.lineageRIndex = [];
  this.isPseudoPattern = false;
  this.order = 0;
  this.variantOrder = 0;
  this.engine = patternEngines.getEngineForPattern(this);

  // TODO: Remove the following when ordering by file prefix gets obsolete
  this.patternGroupData = this.patternGroupData || {};
  if (!this.patternGroupData.order && info.patternGroupOrder) {
    this.patternGroupData.order = info.patternGroupOrder;
  }

  // TODO: Remove the following when ordering by file prefix gets obsolete
  this.patternSubgroupData = this.patternSubgroupData || {};
  if (!this.patternSubgroupData.order && info.patternSubgroupOrder) {
    this.patternGroupData.order = info.patternSubgroupOrder;
  }

  // TODO: Remove the following when ordering by file prefix gets obsolete
  if (prefixMatcherDeprecationCheckOrder.test(this.fileName)) {
    if (this.fileName.indexOf('~') === -1) {
      this.order = this.setPatternOrderDataForInfo(this.fileName);
    } else {
      this.variantOrder = this.setPatternOrderDataForInfo(this.fileName);
    }
  }

  /**
   * Determines if this pattern needs to be recompiled.
   *
   * @see {@link CompileState}*/
  this.compileState = null;

  /**
   * Timestamp in milliseconds when the pattern template or auxiliary file (e.g. json) were modified.
   * If multiple files are affected, this is the timestamp of the most recent change.
   *
   * @see {@link pattern}
   */
  this.lastModified = null;
};

// Pattern methods

Pattern.prototype = {
  // render function - acts as a proxy for the PatternEngine's
  render: function (data, partials) {
    if (!this.extendedTemplate) {
      this.extendedTemplate = this.template;
    }

    if (this.engine) {
      const promise = this.engine.renderPattern(
        this,
        data || this.jsonFileData,
        partials
      );
      return promise
        .then((results) => {
          return results;
        })
        .catch((reason) => {
          return Promise.reject(reason);
        });
    }
    return Promise.reject('where is the engine?');
  },

  registerPartial: function () {
    if (this.engine && typeof this.engine.registerPartial === 'function') {
      this.engine.registerPartial(this);
    }
  },

  /**
   * calculated path from the root of the public directory to the generated html
   * file for this pattern.
   *
   * Should look something like 'atoms-global-colors/atoms-global-colors.html'
   *
   * @param {Patternlab} patternlab Current patternlab instance
   * @param {string} suffixType File suffix
   * @param {string} customFileExtension Custom extension
   */
  getPatternLink: function (patternlab, suffixType, customFileExtension) {
    // if no suffixType is provided, we default to rendered
    const suffixConfig = patternlab.config.outputFileSuffixes;
    const suffix = suffixType
      ? suffixConfig[suffixType]
      : suffixConfig.rendered;

    if (suffixType === 'rawTemplate') {
      return this.name + path.sep + this.name + suffix + this.fileExtension;
    }

    if (suffixType === 'custom') {
      return this.name + path.sep + this.name + customFileExtension;
    }

    return this.name + path.sep + this.name + suffix + '.html';
  },

  /**
   * The finders all delegate to the PatternEngine, which also
   * encapsulates all appropriate regex's
   */
  findPartials: function () {
    return this.engine.findPartials(this);
  },

  findPartialsWithPatternParameters: function () {
    return this.engine.findPartialsWithPatternParameters(this);
  },

  findListItems: function () {
    return this.engine.findListItems(this);
  },

  findPartial: function (partialString) {
    return this.engine.findPartial(partialString);
  },

  /**
   * Get a directory on a specific level of the pattern path
   *
   * @param {Number} level Level of folder to get
   * @param {Object} pInfo general information about the pattern
   */
  getDirLevel: function (level, pInfo) {
    const items = this.subdir.split(path.sep);
    pInfo && pInfo.patternHasOwnDir && items.pop();

    if (items[level]) {
      return items[level];
    } else if (level >= 1) {
      return '';
    } else {
      // I'm not quite sure about that but its better than empty node
      // TODO: verify
      return 'root';
    }
  },

  /**
   * Reset the information that the pattern has it's own directory,
   * so that this pattern will not be handled as flat pattern if it
   * is located on a top level folder.
   *
   * @param {Patternlab} patternlab Current patternlab instance
   */
  promoteFromDirectoryToFlatPattern: function (patternlab) {
    const p = new Pattern(this.relPath, this.jsonFileData, patternlab, true);
    // Only reset the specific fields, not everything
    Object.assign(this, {
      name: p.name,
      patternLink: p.patternLink,
      patternGroup: p.patternGroup,
      patternSubgroup: p.patternSubgroup,
      isFlatPattern: p.isFlatPattern,
      flatPatternPath: p.flatPatternPath,
      patternPartial: p.patternPartial,
      verbosePartial: p.verbosePartial,
    });
  },

  /**
   * Retrieves the number prefix, which later is used for sorting.
   * (Can be removed when sorting by number prefix becomes obsolete)
   * @param {*} pathStr the path that needs to be checked for number prefixes
   * @returns the order number or 0 when no prefix is available
   */
  setPatternOrderDataForInfo: (pathStr) => {
    const match = pathStr.match(prefixMatcherDeprecationCheckOrder);
    return match && match.length >= 1
      ? pathStr.match(prefixMatcherDeprecationCheckOrder)[1].replace('-', '')
      : 0;
  },

  /**
   * The "info" object contains information about pattern structure if it is
   * a nested pattern or if it just a sub folder structure. It's just used for
   * internal purposes. Remember every pattern information based on "this.*"
   * will be used by other functions
   *
   * @param pathObj path.parse() object containing useful path information
   */
  getPatternInfo: (pathObj, patternlab, isPromoteToFlatPatternRun) => {
    const info = {
      // colors(.mustache) is deeply nested in atoms-/global/colors
      patternlab: patternlab,
      patternHasOwnDir: isPromoteToFlatPatternRun
        ? path.basename(pathObj.dir).replace(prefixMatcher, '') ===
            pathObj.name.replace(prefixMatcher, '') ||
          path.basename(pathObj.dir).replace(prefixMatcher, '') ===
            pathObj.name.split('~')[0].replace(prefixMatcher, '')
        : false,
    };

    info.dir = info.patternHasOwnDir ? pathObj.dir.split(path.sep).pop() : '';
    info.dirLevel = pathObj.dir.split(path.sep).filter((s) => !!s).length;

    // Only relevant for deprecation check and message
    if (path.parse(pathObj.dir).base === '_meta') {
      info.isMetaPattern = true;
    }

    if (info.dirLevel === 0 || (info.dirLevel === 1 && info.patternHasOwnDir)) {
      // -> ./
      info.shortNotation = 'root';
    } else if (info.dirLevel === 2 && info.patternHasOwnDir) {
      // -> ./folder
      info.shortNotation = path.dirname(pathObj.dir).replace(prefixMatcher, '');
      info.patternGroupOrder = Pattern.prototype.setPatternOrderDataForInfo(
        path.dirname(pathObj.dir)
      );
    } else {
      // -> ./folder/folder
      info.shortNotation = pathObj.dir
        .split(/\/|\\/, 2)
        .map((o, i) => {
          if (i === 0) {
            // TODO: Remove when prefix gets deprecated
            info.patternGroupOrder =
              Pattern.prototype.setPatternOrderDataForInfo(o);
          }

          if (i === 1) {
            // TODO: Remove when prefix gets deprecated
            info.patternSubgroupOrder =
              Pattern.prototype.setPatternOrderDataForInfo(o);
          }

          return o.replace(prefixMatcher, '');
        })
        .join('-')
        .replace(new RegExp(`-${info.dir}$`), '');
      info.verbosePartial = pathObj.dir
        .split(/\/|\\/, 2)
        .map((o) => o.replace(prefixMatcher, ''))
        .join('/')
        .replace(new RegExp(`-${info.dir}$`), '');
    }

    return info;
  },
};

// Pattern static methods

/**
 * factory: creates an empty Pattern for miscellaneous internal use, such as
 * by list_item_hunter
 *
 * @param {Object} customProps Properties to apply to new pattern
 * @param {Patternlab} patternlab Current patternlab instance
 */
Pattern.createEmpty = function (customProps, patternlab) {
  let relPath = '';
  if (customProps) {
    if (customProps.relPath) {
      relPath = customProps.relPath;
    } else if (customProps.subdir && customProps.filename) {
      relPath = path.join(customProps.subdir, customProps.filename);
    }
  }

  const pattern = new Pattern(relPath, null, patternlab);
  return Object.assign(pattern, customProps);
};

/**
 * factory: creates a Pattern object on-demand from a hash; the hash accepts
 * parameters that replace the positional parameters that the Pattern
 * constructor takes.
 */
Pattern.create = function (relPath, data, customProps, patternlab) {
  const newPattern = new Pattern(relPath || '', data || null, patternlab);
  return Object.assign(newPattern, customProps);
};

const CompileState = {
  NEEDS_REBUILD: 'needs rebuild',
  BUILDING: 'building',
  CLEAN: 'clean',
};

module.exports = {
  Pattern: Pattern,
  CompileState: CompileState,
};
