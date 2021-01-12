'use strict';

/**
 * All Pattern Lab Events
 * @module Events
 */

/**
 * @alias module:Events
 */
const EVENTS = Object.freeze({
  /**
   * @desc Emitted before any logic run inside `build()`, which is the entry point for single builds, pattern-only builds, run singly or when watched.
   * @property {object} patternlab - global data store
   *
   */
  PATTERNLAB_BUILD_START: 'patternlab-build-start',

  /**
   * @desc Emitted after all logic run inside `build()`, which is the entry point for single builds, pattern-only builds, run singly or when watched.
   * @property {object} patternlab - global data store
   *
   */
  PATTERNLAB_BUILD_END: 'patternlab-build-end',

  /**
   * @desc Emitted after patterns are iterated over to gather data about them. Right before Pattern Lab processes and renders patterns into HTML
   * @property {object} patternlab - global data store
   */
  PATTERNLAB_PATTERN_ITERATION_END: 'patternlab-pattern-iteration-end',

  /**
   * @desc Emitted after global `data.json` and `listitems.json` are read, and the supporting Pattern Lab templates are loaded into memory (header, footer, patternSection, patternSectionSubgroup, viewall). Right before patterns are iterated over to gather data about them.
   * @property {object} patternlab - global data store
   */
  PATTERNLAB_BUILD_GLOBAL_DATA_END: 'patternlab-build-global-data-end',

  /**
   * @desc Emitted before all data is merged prior to a Pattern's render. Global `data.json` is merged with any pattern `.json`. Global `listitems.json` is merged with any pattern `.listitems.json`.
   * @property {object} patternlab - global data store
   * @property {Pattern} pattern - current pattern
   * @see {@link https://github.com/pattern-lab/patternlab-node/blob/master/packages/core/src/lib/object_factory.js#L16|Pattern}
   */
  PATTERNLAB_PATTERN_BEFORE_DATA_MERGE: 'patternlab-pattern-before-data-merge',

  /**
   * @desc Emitted before a pattern's template, HTML, and encoded HTML files are written to their output location
   * @property {object} patternlab - global data store
   * @property {Pattern} pattern - current pattern
   * @see {@link https://github.com/pattern-lab/patternlab-node/blob/master/packages/core/src/lib/object_factory.js#L16|Pattern}
   */
  PATTERNLAB_PATTERN_WRITE_BEGIN: 'patternlab-pattern-write-begin',

  /**
   * @desc Emitted after a pattern's template, HTML, and encoded HTML files are written to their output location
   * @property {object} patternlab - global data store
   * @property {Pattern} pattern - current pattern
   * @see {@link https://github.com/pattern-lab/patternlab-node/blob/master/packages/core/src/lib/object_factory.js#L16|Pattern}
   */
  PATTERNLAB_PATTERN_WRITE_END: 'patternlab-pattern-write-end',

  /**
   * @desc Invoked when a watched asset changes. Assets include anything in `source/` that is not under `['root', 'patterns', 'data', 'meta', 'annotations', 'patternlabFiles']` which are blacklisted for specific copying.
   * @property {object} fileInfo - `{file: 'path/to/file.css', dest: 'path/to/destination'}`
   */
  PATTERNLAB_PATTERN_ASSET_CHANGE: 'patternlab-pattern-asset-change',

  /**
   * @desc Invoked when a watched global file changes. These are files within the directories specified in `['data', 'meta']`paths.
   * @property {object} fileInfo - `{file: 'path/to/file.ext'}`
   */
  PATTERNLAB_GLOBAL_CHANGE: 'patternlab-global-change',

  /**
   * @desc Invoked when a pattern changes.
   * @property {object} fileInfo - `{file: 'path/to/file.ext'}`
   */
  PATTERNLAB_PATTERN_CHANGE: 'patternlab-pattern-change',
});

module.exports = EVENTS;
