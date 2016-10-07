"use strict";

var partial_hunter = function () {

  var smh = require('./style_modifier_hunter');
  var style_modifier_hunter = new smh();

  function replacePartials(pattern, patternlab) {
    var dataKey;
    var dataKeysRegex;
    var escapedKeys = '';
    var i;
    var j;
    var newTemplate = pattern.extendedTemplate;
    var partialContent;
    var partials;
    var partialsUnique;
    var pMatch;
    var regex;
    var regexStr;
    var tag;
    var tmpPattern;

    if (!pattern.engine) {
      return;
    }

    //escape all tags that match keys in the JSON data.
    //it can be significantly faster to process large dataKey arrays in one read
    //with a large regex than to read many times and process with small regexes.
    //this is especially true with large templates.
    //escape global data keys
    escapedKeys = patternlab.dataKeysEscape;

    //escape local data keys
    for (i = 0; i < pattern.dataKeys.length; i++) {
      dataKey = pattern.dataKeys[i];
      if (typeof pattern.engine.escapeReservedRegexChars === 'function') {
        dataKey = pattern.engine.escapeReservedRegexChars(dataKey);
      }
      if (i === 0) {
        escapedKeys += '|';
      }
      escapedKeys += dataKey;
      if (i < pattern.dataKeys.length - 1) {
        escapedKeys += '|';
      }
    }

    escapedKeys += ')';

    //apply replacement based on allowable characters from lines 78 and 79 of mustache.js
    //of the Mustache for JS project.
    dataKeysRegex = new RegExp('\\{\\{([\\{#\\^\\/&]?(\\s*|[^\\}]*\\.)(' + escapedKeys + '\\s*)\\}\\}', 'g');

    newTemplate = newTemplate.replace(dataKeysRegex, '\u0002$1}}');

    //removing empty lines for some reason reduces rendering time considerably.
    newTemplate = newTemplate.replace(/^\s*$\n/gm, '');

    //escape partial includes so they are not erased by a render
    newTemplate = newTemplate.replace(/\{\{>/g, '\u0002>');

    //render this pattern immediately, so as to delete blocks not keyed to allData
    newTemplate = pattern.engine.renderPattern(newTemplate, pattern.allData);

    //unescape data keys and partial includes
    newTemplate = newTemplate.replace(/\u0002/g, '{{');

    //find all remaining partial tags
    partials = pattern.engine.findPartials(newTemplate) || [];

    //create array of unique elements so the tags can be use for global replace
    partialsUnique = partials.filter(function (value, index, thisArray) {
      return thisArray.indexOf(value) === index;
    });

    //replace remaining partials with their content
    for (i = 0; i < partialsUnique.length; i++) {
      pMatch = partialsUnique[i];

      for (j in patternlab.partials) {
        if (patternlab.partials.hasOwnProperty(j)) {
          tag = j;
          partialContent = patternlab.partials[j].content;

          if (pMatch === tag) {

            //check if this tag has any style modifiers
            if (tag.search(pattern.engine.findPartialsWithStyleModifiersRE) > -1) {
              //if so, add the style modifiers to partialContent
              tmpPattern = {extendedTemplate: partialContent};
              style_modifier_hunter.consume_style_modifier(tmpPattern, tag, patternlab);
              partialContent = tmpPattern.extendedTemplate;
            }

            //we want to globally replace instances of this tag in case it was
            //included within a partial from within this for loop
            if (typeof pattern.engine.escapeReservedRegexChars === 'function') {
              regexStr = pattern.engine.escapeReservedRegexChars(tag);
            } else {
              regexStr = tag;
            }
            regex = new RegExp(regexStr, 'g');
            newTemplate = newTemplate.replace(regex, partialContent);
          }
        }
      }
    }

    pattern.extendedTemplate = newTemplate;
  }

  return {
    replace_partials: function (pattern, patternlab) {
      replacePartials(pattern, patternlab);
    }
  };
};

module.exports = partial_hunter;
