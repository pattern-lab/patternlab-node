"use strict";

var partial_hunter = function () {

  var lih = require('./list_item_hunter'),
    smh = require('./style_modifier_hunter'),
    list_item_hunter = new lih(),
    style_modifier_hunter = new smh();

  function replacePartials(pattern, patternlab) {
    var i,
      j,
      dataKeys = pattern.dataKeys,
      isMatch,
      newTemplate = pattern.extendedTemplate,
      partialContent,
      partialsAfter,
      partialsBefore = pattern.findPartials() || [],
      pMatch,
      regex,
      regexStr,
      tag,
      tmpPattern,
      tmpTemplate;

    //escape data keys so they are not erased by a render
    for (i = 0; i < dataKeys.length; i++) {
      regex = new RegExp('\\{\\{(\\S?\\s*' + dataKeys[i] + '\\s*\\}?\\}\\})', 'g');
      newTemplate = newTemplate.replace(regex, '\u0002$1');
    }

    //escape partial includes so they are not erased by a render
    newTemplate = newTemplate.replace(/\{\{>/g, '\u0002>');

    //render this pattern immediately, so as to delete blocks not keyed to allData
    newTemplate = pattern.engine.renderPattern(newTemplate, pattern.allData);

    //unescape data keys and partial includes
    newTemplate = newTemplate.replace(/\u0002/g, '{{');
if (pattern.relPath === '02-organisms/social/social-quiz.mustache') {
//  console.info(patternlab.partials);
//process.exit();
  console.info(pattern.relPath);
  console.info(newTemplate);
}

    //render this pattern immediately, so as to delete false conditions
//    tmpTemplate = pattern.engine.renderPattern(tmpTemplate, pattern.allData);

    //unescape partial includes
//    newTemplate = newTemplate.replace(/\u0002/g, '{{>');
    partialsAfter = pattern.engine.findPartials(newTemplate) || [];

    //delete partials within false conditions
    /*
    for (i = 0; i < partialsBefore.length; i++) {
      isMatch = false;

      for (j = 0; j < partialsAfter.length; j++) {
        if (partialsBefore[i] === partialsAfter[j]) {
          isMatch = true;
          break;
        }
      }

      if (!isMatch) {
        newTemplate = newTemplate.replace(partialsBefore[i], '');
      }
    }
    */

    //replace remaining partials with their content
    for (i = 0; i < partialsAfter.length; i++) {
      pMatch = partialsAfter[i];

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

            newTemplate = newTemplate.replace(tag, partialContent);
          }
        }
      }
    }
    return newTemplate;
  }

  return {
    replace_partials: function (pattern, patternlab) {
      return replacePartials(pattern, patternlab);
    }
  };
};

module.exports = partial_hunter;
