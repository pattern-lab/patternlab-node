"use strict";

/**
 * Allows lookups for patterns via a central registry.
 * @constructor
 */
// Future idea:
var PatternRegistry = function() {
  this.key2pattern = new Map();
  /** For lookups by {Pattern#partialKey} */
  this.partials = new Map();
};

//noinspection JSUnusedLocalSymbols
PatternRegistry.prototype = {

  allPatterns: function() {
    return Array.from(this.key2pattern.values())
  },

  has: function(name) {
    return this.key2pattern.has(name);
  },

  get: function(name) {
    return this.key2pattern.get(name);
  },

  /**
   * Adds the given pattern to the registry. If a pattern with the same key exists, it is replaced.
   * @param pattern {Pattern|*}
   */
  put: function (pattern) {
    var name = PatternRegistry.partialName(pattern);
    this.partials.set(name, pattern);
    var key = PatternRegistry.patternKey(pattern);
    this.key2pattern.set(key, pattern);
  },

  remove: function (name) {
    this.key2pattern.delete(name);
  },

  getPartial: function (partialName) {
    /*
     Code in here has been moved from pattern_assembler.getPartial() to prepare for some refactoring.
     There are a few advantages to this method:
     - use a map lookup instead of interating through all patterns
     - get rid of dependency to the patternlab object
     - make code more readable
     */

    // This previously has been a for loop over an array in pattern_
    let byPartialName = this.partials.get(partialName);
    if (this.partials.has(partialName)) {
      return byPartialName;
    }


    let patterns = this.allPatterns();
    //else look by verbose syntax
    for (let thisPattern of patterns) {
      switch (partialName) {
        case thisPattern.relPath:
        case thisPattern.subdir + '/' + thisPattern.fileName:
          return thisPattern;
      }
    }

    //return the fuzzy match if all else fails
    for (let thisPattern of patterns) {
      var partialParts = partialName.split('-'),
        partialType = partialParts[0],
        partialNameEnd = partialParts.slice(1).join('-');

      var patternPartial = thisPattern.patternPartial;
      if (patternPartial.split('-')[0] === partialType
        && patternPartial.indexOf(partialNameEnd) > -1) {
        return thisPattern;
      }
    }
    return undefined;
  }
};

PatternRegistry.patternKey = function (pattern) {
  return pattern.relPath;
};

/**
 * Defines how the partial key of a pattern is resolved.
 *
 * @param pattern {Pattern}
 * @return {string}
 */
PatternRegistry.partialName = function (pattern) {
  return pattern.patternPartial;
};

module.exports = PatternRegistry;
