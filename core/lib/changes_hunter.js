"use strict";
const fs = require("fs-extra"),
  CompileState = require('./object_factory').CompileState;

/**
 * For detecting changed patterns.
 * @constructor
 */
let ChangesHunter = function () {
};

ChangesHunter.prototype = {

  /**
   * Checks the build state of a pattern by comparing the modification date of the rendered output
   * file with the {@link Pattern.lastModified}. If the pattern was modified after the last
   * time it has been rendered, it is flagged for rebuilding via {@link CompileState.NEEDS_REBUILD}.
   *
   * @param {Pattern} pattern
   * @param patternlab
   *
   * @see {@link CompileState}
   */
  checkBuildState: function (pattern, patternlab) {

    //write the compiled template to the public patterns directory
    let renderedTemplatePath =
      patternlab.config.paths.public.patterns + pattern.getPatternLink(patternlab, 'rendered');

    if (!pattern.compileState) {
      pattern.compileState = CompileState.NEEDS_REBUILD;
    }

    try {
      // Prevent error message if file does not exist
      fs.accessSync(renderedTemplatePath, fs.F_OK);
      let outputLastModified = fs.statSync(renderedTemplatePath).mtime.getTime();

      if (pattern.lastModified && outputLastModified > pattern.lastModified) {
        pattern.compileState = CompileState.CLEAN;
      }
    } catch (e) {
      // Output does not exist yet, needs recompile
    }

    let node = patternlab.graph.node(pattern);

    // Make the pattern known to the PatternGraph and remember its compileState
    if (!node) {
      patternlab.graph.add(pattern);
    } else {
      // Works via object reference, so we directly manipulate the node data here
      node.compileState = pattern.compileState;
    }


  },

  /**
   * Updates {Pattern#lastModified} to the files modification date if the file was modified
   * after {Pattern#lastModified}.
   *
   * @param {Pattern} currentPattern
   * @param {string} file
   */
  checkLastModified: function (currentPattern, file) {
    if (file) {
      try {
        let stat = fs.statSync(file);

        // Needs recompile whenever one of the patterns files (template, json, pseudopatterns) changed
        currentPattern.lastModified =
          Math.max(stat.mtime.getTime(), currentPattern.lastModified || 0);
      } catch (e) {
        // Ignore, not a regular file
      }
    }
  }
};

module.exports = ChangesHunter;