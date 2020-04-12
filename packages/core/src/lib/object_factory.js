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
 *
 * @constructor
 */
const Pattern = function(relPath, data, patternlab) {
  this.relPath = path.normalize(relPath); // '00-atoms/00-global/00-colors.mustache'

  /**
   * We expect relPath to be the path of the pattern template, relative to the
   * root of the pattern tree. Parse out the path parts and save the useful ones.
   * @param {relPath} relative directory
   * @param {data} The JSON used to render values in the pattern.
   * @param {patternlab} rendered html files for the pattern
   */
  const pathObj = path.parse(this.relPath);

  const info = this.getPatternInfo(pathObj);

  this.fileName = pathObj.name; // '00-colors'
  this.subdir = pathObj.dir; // '00-atoms/00-global'
  this.fileExtension = pathObj.ext; // '.mustache'

  // this is the unique name, subDir + fileName (sans extension)
  // '00-atoms-00-global-00-colors'
  this.name = `${info.shortNotation}-${this.fileName.replace('~', '-')}`;

  // the JSON used to render values in the pattern
  this.jsonFileData = data || {};

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
  this.verbosePartial = `${info.shortNotation.split('-').join('/')}/${
    this.fileName
  }`;

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
  this.isFlatPattern = this.patternGroup === this.patternSubGroup;

  this.isPattern = true;
  this.patternState = '';
  this.template = '';
  this.patternPartialCode = '';
  this.lineage = [];
  this.lineageIndex = [];
  this.lineageR = [];
  this.lineageRIndex = [];
  this.isPseudoPattern = false;
  this.order = Number.MAX_SAFE_INTEGER;
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

  // calculated path from the root of the public directory to the generated html
  // file for this pattern.
  // Should look something like '00-atoms-00-global-00-colors/00-atoms-00-global-00-colors.html'
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

  // the finders all delegate to the PatternEngine, which also encapsulates all
  // appropriate regexes
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

  getDirLevel: function(level, pathInfo) {
    const items = this.subdir.split(path.sep);
    pathInfo.patternHasOwnDir && items.pop();

    if (items[level]) {
      return items[level];
    } else if (items[level - 1]) {
      return items[level - 1];
    } else {
      // Im Not quite shure about that but its better than empty node
      return 'root';
    }
  },

  /**
   * Info contains information about pattern structure if it is a nested pattern
   * or if it just a subbed folder structure. Its just used for internal purposes.
   * Remember every pattern infomarion based on "this.*" will be used by other functions
   *
   * @param pathObj path.parse() object containing usefull path information
   */
  getPatternInfo: pathObj => {
    const info = {
      // 00-colors(.mustache) is subbed in 00-atoms-/00-global/00-colors
      patternHasOwnDir:
        path.basename(pathObj.dir).replace(prefixMatcher, '') ===
          pathObj.name.replace(prefixMatcher, '') ||
        path.basename(pathObj.dir).replace(prefixMatcher, '') ===
          pathObj.name.split('~')[0].replace(prefixMatcher, ''),
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
    }

    return info;
  },
};

// Pattern static methods

// factory: creates an empty Pattern for miscellaneous internal use, such as
// by list_item_hunter
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

// factory: creates an Pattern object on-demand from a hash; the hash accepts
// parameters that replace the positional parameters that the Pattern
// constructor takes.
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
