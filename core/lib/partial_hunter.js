"use strict";

var partial_hunter = function () {

  var lih = require('./list_item_hunter'),
    smh = require('./style_modifier_hunter'),
    list_item_hunter = new lih(),
    style_modifier_hunter = new smh();

  function replacePartials(pattern, patternlab) {
    var i,
      j,
      isMatch,
      newTemplate = pattern.extendedTemplate,
      partialContent,
      partials,
      partialsUnique,
      pMatch,
      regex,
      regexStr,
      tag,
      tmpPattern,
      tmpTemplate;

    //escape global data keys so they are not erased by a render
    for (i = 0; i < patternlab.dataKeys.length; i++) {
      regex = new RegExp('\\{\\{(\\S?\\s*' + patternlab.dataKeys[i] + '\\s*\\}?\\}\\})', 'g');
      newTemplate = newTemplate.replace(regex, '\u0002$1');
    }

    //escape local data keys so they are not erased by a render
    for (i = 0; i < pattern.dataKeys.length; i++) {
      regex = new RegExp('\\{\\{(\\S?\\s*' + pattern.dataKeys[i] + '\\s*\\}?\\}\\})', 'g');
      newTemplate = newTemplate.replace(regex, '\u0002$1');
    }

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
            regexStr = pattern.engine.escapeReservedRegexChars(tag);
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
