'use strict';

const _ = require('lodash');
const path = require('path');
const patternEngines = require('./pattern_engines');

// prefixMatcher is intended to match the leading maybe-underscore,
// zero or more digits, and maybe-dash at the beginning of a pattern file name we can hack them
// off and get at the good part.
const prefixMatcher = /^_?(\d+-)?/;

/**
 * Pattern constructor / Pattern properties
 *
 * Before changing functionalities of the pattern object please read the following pull requests
 * to get more details about the behavior of the folder structure
 * https://github.com/pattern-lab/patternlab-node/pull/992
 * https://github.com/pattern-lab/patternlab-node/pull/1016
 * https://github.com/pattern-lab/patternlab-node/pull/1143
 *
 * @param {String} relPath relative directory
 * @param {Object} jsonFileData The JSON used to render values in the pattern.
 * @param {Patternlab} patternlab The actual patternlab instance
 * @param {Boolean} isUnsubRun specifies if the pattern needs to be removed from its subfolder
 */
const Pattern = function(relPath, jsonFileData, patternlab, isUnsubRun) {
  this.relPath = path.normalize(relPath); // '00-atoms/00-global/00-colors.mustache'

  /**
   * We expect relPath to be the path of the pattern template, relative to the
   * root of the pattern tree. Parse out the path parts and save the useful ones.
   */
  const pathObj = path.parse(this.relPath);

  const info = this.getPatternInfo(pathObj, patternlab, isUnsubRun);

  this.fileName = pathObj.name; // '00-colors'
  this.subdir = pathObj.dir; // '00-atoms/00-global'
  this.fileExtension = pathObj.ext; // '.mustache'

  // TODO: Remove if when droping ordering by prefix and keep else code
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

  // strip leading "00-" from the file name and flip tildes to dashes
  this.patternBaseName = this.fileName
    .replace(prefixMatcher, '')
    .replace('~', '-'); // 'colors'

  // Fancy name - Uppercase letters of pattern name partials.
  // global-colors -> 'Global Colors'
  // this is the display name for the ui. strip numeric + hyphen prefixes
  this.patternName = _.startCase(this.patternBaseName);

  //00-atoms if needed
  this.patternType = this.getDirLevel(0, info);

  // the top-level pattern group this pattern belongs to. 'atoms'
  this.patternGroup = this.patternType.replace(prefixMatcher, '');

  //00-colors if needed
  this.patternSubType = this.getDirLevel(1, info);

  // the sub-group this pattern belongs to.
  this.patternSubGroup = this.patternSubType.replace(prefixMatcher, ''); // 'global'

  // the joined pattern group and subgroup directory
  this.flatPatternPath = info.shortNotation; // '00-atoms-00-global'

  // calculated path from the root of the public directory to the generated
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
   *  flatpattern
   * --- OR That ---
   * root
   *  molecules
   *   flatpattern
   */
  this.isFlatPattern =
    this.patternGroup === this.patternSubGroup || !this.patternSubGroup;

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
  this.engine = patternEngines.getEngineForPattern(this);

  /**
   * Determines if this pattern needs to be recompiled.
   *
   * @ee {@link CompileState}*/
  this.compileState = null;

  /**
   * Timestamp in milliseconds when the pattern template or auxilary file (e.g. json) were modified.
   * If multiple files are affected, this is the timestamp of the most recent change.
   *
   * @see {@link pattern}
   */
  this.lastModified = null;
};

// Pattern methods

Pattern.prototype = {
  // render function - acts as a proxy for the PatternEngine's
  render: function(data, partials) {
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
        .then(results => {
          return results;
        })
        .catch(reason => {
          return Promise.reject(reason);
        });
    }
    return Promise.reject('where is the engine?');
  },

  registerPartial: function() {
    if (this.engine && typeof this.engine.registerPartial === 'function') {
      this.engine.registerPartial(this);
    }
  },

  /**
   * calculated path from the root of the public directory to the generated html
   * file for this pattern.
   *
   * Should look something like '00-atoms-00-global-00-colors/00-atoms-00-global-00-colors.html'
   *
   * @param {Patternlab} patternlab Current patternlab instance
   * @param {String} suffixType File suffix
   * @param {String} customfileExtension Custom extension
   */
  getPatternLink: function(patternlab, suffixType, customfileExtension) {
    // if no suffixType is provided, we default to rendered
    const suffixConfig = patternlab.config.outputFileSuffixes;
    const suffix = suffixType
      ? suffixConfig[suffixType]
      : suffixConfig.rendered;

    if (suffixType === 'rawTemplate') {
      return this.name + path.sep + this.name + suffix + this.fileExtension;
    }

    if (suffixType === 'custom') {
      return this.name + path.sep + this.name + customfileExtension;
    }

    return this.name + path.sep + this.name + suffix + '.html';
  },

  /**
   * The finders all delegate to the PatternEngine, which also
   * encapsulates all appropriate regexes
   */
  findPartials: function() {
    return this.engine.findPartials(this);
  },

  findPartialsWithStyleModifiers: function() {
    return this.engine.findPartialsWithStyleModifiers(this);
  },

  findPartialsWithPatternParameters: function() {
    return this.engine.findPartialsWithPatternParameters(this);
  },

  findListItems: function() {
    return this.engine.findListItems(this);
  },

  findPartial: function(partialString) {
    return this.engine.findPartial(partialString);
  },

  /**
   * Get a directory on a specific level of the pattern path
   *
   * @param {Number} level Level of folder to get
   * @param {Object} pInfo general information about the pattern
   */
  getDirLevel: function(level, pInfo) {
    const items = this.subdir.split(path.sep);
    pInfo && pInfo.patternHasOwnDir && items.pop();

    if (items[level]) {
      return items[level];
    } else if (level >= 1) {
      return '';
    } else {
      // Im Not quite shure about that but its better than empty node
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
  resetSubbing: function(patternlab) {
    const p = new Pattern(this.relPath, this.jsonFileData, patternlab, true);
    // Only reset the specific fields, not everything
    Object.assign(this, {
      name: p.name,
      patternLink: p.patternLink,
      patternGroup: p.patternGroup,
      patternType: p.patternType,
      patternSubGroup: p.patternSubGroup,
      patternSubType: p.patternSubType,
      isFlatPattern: p.isFlatPattern,
      flatPatternPath: p.flatPatternPath,
      patternPartial: p.patternPartial,
      verbosePartial: p.verbosePartial,
    });
  },

  /**
   * Info contains information about pattern structure if it is a nested pattern
   * or if it just a subfolder structure. Its just used for internal purposes.
   * Remember every pattern infomarion based on "this.*" will be used by other functions
   *
   * @param pathObj path.parse() object containing usefull path information
   */
  getPatternInfo: (pathObj, patternlab, isUnsubRun) => {
    const info = {
      // 00-colors(.mustache) is subfolder in 00-atoms-/00-global/00-colors
      patternlab: patternlab,
      patternHasOwnDir: !isUnsubRun
        ? path.basename(pathObj.dir).replace(prefixMatcher, '') ===
            pathObj.name.replace(prefixMatcher, '') ||
          path.basename(pathObj.dir).replace(prefixMatcher, '') ===
            pathObj.name.split('~')[0].replace(prefixMatcher, '')
        : false,
    };

    info.dir = info.patternHasOwnDir ? pathObj.dir.split(path.sep).pop() : '';
    info.dirLevel = pathObj.dir.split(path.sep).filter(s => !!s).length;

    if (info.dirLevel === 0 || (info.dirLevel === 1 && info.patternHasOwnDir)) {
      // -> ./
      info.shortNotation = 'root';
    } else if (info.dirLevel === 2 && info.patternHasOwnDir) {
      // -> ./folder
      info.shortNotation = path.dirname(pathObj.dir);
    } else {
      // -> ./folder/folder
      info.shortNotation = pathObj.dir
        .split(/\/|\\/, 2)
        .join('-')
        .replace(new RegExp(`-${info.dir}$`), '');
      info.verbosePartial = pathObj.dir
        .split(/\/|\\/, 2)
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
Pattern.createEmpty = function(customProps, patternlab) {
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
 * factory: creates an Pattern object on-demand from a hash; the hash accepts
 * parameters that replace the positional parameters that the Pattern
 * constructor takes.
 */
Pattern.create = function(relPath, data, customProps, patternlab) {
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
