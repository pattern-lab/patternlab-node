'use strict';
const patternEngines = require('./pattern_engines');
const path = require('path');

// patternPrefixMatcher is intended to match the leading maybe-underscore,
// zero or more digits, and maybe-dash at the beginning of a pattern file name we can hack them
// off and get at the good part.
const patternPrefixMatcher = /^_?(\d+-)?/;

// Pattern properties
/**
 * Pattern constructor
 * @constructor
 */
const Pattern = function(relPath, data, patternlab) {
  /**
   * We expect relPath to be the path of the pattern template, relative to the
   * root of the pattern tree. Parse out the path parts and save the useful ones.
   * @param {relPath} relative directory
   * @param {data} The JSON used to render values in the pattern.
   * @param {patternlab} rendered html files for the pattern
   */
  const pathObj = path.parse(path.normalize(relPath));
  const info = {};
  // 00-colors(.mustache) is subbed in 00-atoms-/00-global/00-colors
  info.hasDir =
    path.basename(pathObj.dir).replace(patternPrefixMatcher, '') ===
      pathObj.name.replace(patternPrefixMatcher, '') ||
    path.basename(pathObj.dir).replace(patternPrefixMatcher, '') ===
      pathObj.name.split('~')[0].replace(patternPrefixMatcher, '');

  info.dir = info.hasDir ? pathObj.dir.split(path.sep).pop() : '';
  info.dirLevel = pathObj.dir.split(path.sep).length;

  this.relPath = path.normalize(relPath); // '00-atoms/00-global/00-colors.mustache'
  this.fileName = pathObj.name; // '00-colors'
  this.subdir = pathObj.dir; // '00-atoms/00-global'
  if ((this.subdir.match(/\w(?=\\)|\w(?=\/)/g) || []).length > 1) {
    this.subdir = this.subdir.split(/\/|\\/, 2).join(path.sep); // '00-atoms/03-controls/00-button' -> '00-atoms/03-controls'
  }
  this.fileExtension = pathObj.ext; // '.mustache'

  // this is the unique name, subDir + fileName (sans extension)
  this.name = '';
  if (info.hasDir) {
    let variant = '';

    if (this.fileName.indexOf('~') !== -1) {
      variant = '-' + this.fileName.split('~')[1];
    }
    this.name = this.subdir.replace(/[\/\\]/g, '-') + variant;
  } else {
    this.name =
      this.subdir.replace(/[\/\\]/g, '-') +
      '-' +
      this.fileName.replace('~', '-'); // '00-atoms-00-global-00-colors'
  }

  // the JSON used to render values in the pattern
  this.jsonFileData = data || {};

  // strip leading "00-" from the file name and flip tildes to dashes
  this.patternBaseName = this.fileName
    .replace(patternPrefixMatcher, '')
    .replace('~', '-'); // 'colors'

  // Fancy name. No idea how this works. 'Colors'
  this.patternName = this.patternBaseName
    .split('-')
    .reduce(function(val, working) {
      return (
        val.charAt(0).toUpperCase() +
        val.slice(1) +
        ' ' +
        working.charAt(0).toUpperCase() +
        working.slice(1)
      );
    }, '')
    .trim(); //this is the display name for the ui. strip numeric + hyphen prefixes

  //00-atoms if needed
  this.patternType = this.getDirLevel(0, info);

  // the top-level pattern group this pattern belongs to. 'atoms'
  this.patternGroup = this.patternType.replace(patternPrefixMatcher, '');

  //00-colors if needed
  this.patternSubType = this.getDirLevel(1, info);

  // the sub-group this pattern belongs to.
  this.patternSubGroup = this.patternSubType.replace(patternPrefixMatcher, ''); // 'global'

  // the joined pattern group and subgroup directory
  this.flatPatternPath = info.hasDir
    ? this.subdir
        .replace(/[/\\]/g, '-')
        .replace(new RegExp('-' + info.dir + '$'), '')
    : this.subdir.replace(/[\/\\]/g, '-'); // '00-atoms-00-global'

  // calculated path from the root of the public directory to the generated
  // (rendered!) html file for this pattern, to be shown in the iframe
  this.patternLink = this.patternSectionSubtype
    ? `$${this.name}/index.html`
    : patternlab ? this.getPatternLink(patternlab, 'rendered') : null;

  // The canonical "key" by which this pattern is known. This is the callable
  // name of the pattern. UPDATE: this.key is now known as this.patternPartial
  this.patternPartial = this.patternGroup + '-' + this.patternBaseName;

  // Let's calculate the verbose name ahead of time! We don't use path.sep here
  // on purpose. This isn't a file name!
  this.verbosePartial =
    this.subdir.split(path.sep).join('/') + '/' + this.fileName;

  this.isPattern = true;
  this.isFlatPattern = this.patternGroup === this.patternSubGroup;
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

  getDirLevel: function(level, info) {
    const items = this.subdir.split(path.sep);
    if (info.hasDir) {
      items.pop();
    }

    if (items[level]) {
      return items[level];
    } else if (items[level - 1]) {
      return items[level - 1];
    } else {
      return '';
    }
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
      relPath = customProps.subdir + path.sep + customProps.filename;
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
