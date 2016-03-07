/*
 * patternlab-node - v1.1.3 - 2016
 *
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

"use strict";

var parameter_hunter = function () {

  var extend = require('util')._extend,
    pa = require('./pattern_assembler'),
    smh = require('./style_modifier_hunter'),
    style_modifier_hunter = new smh(),
    pattern_assembler = new pa();

  function paramToJson(pString) {
    var colonPos;
    var delimitPos;
    var paramKey;
    var paramString = pString;
    var paramStringWellFormed = '';
    var paramStringTmp;
    var quotePos;

    do {

      //move param key to paramStringWellFormed var.
      colonPos = paramString.indexOf(':');

      //except to prevent infinite loops.
      if (colonPos === -1) {
        colonPos = paramString.length - 1;
      } else {
        colonPos += 1;
      }

      paramKey = paramString.substring(0, colonPos);

      //if param key is wrapped in single quotes, replace with double quotes.
      paramKey = paramKey.replace(/(^\s*[\{|\,]\s*)'([^']+)'(\s*\:)/, '$1"$2"$3');

      //if params key is not wrapped in any quotes, wrap in double quotes.
      paramKey = paramKey.replace(/(^\s*[\{|\,]\s*)([^\s"'\:]+)(\s*\:)/, '$1"$2"$3');

      //this is just here to match the escaping scheme in Pattern Lab PHP.
      paramKey = paramKey.replace(/\\/g, '');

      paramStringWellFormed += paramKey;
      paramString = paramString.substring(colonPos, paramString.length).trim();

      //if param value is wrapped in single quotes, replace with double quotes.
      if (paramString[0] === '\'') {
        quotePos = paramString.search(/[^\\]'/);

        //except for unclosed quotes to prevent infinite loops.
        if (quotePos === -1) {
          quotePos = paramString.length - 1;
        } else {
          quotePos += 2;
        }

        //prepare param value for move to paramStringWellFormed var.
        paramStringTmp = paramString.substring(0, quotePos);

        //unescape any escaped single quotes.
        paramStringTmp = paramStringTmp.replace(/\\'/g, '\'');

        //escape any double quotes.
        paramStringTmp = paramStringTmp.replace(/"/g, '\\"');

        //replace the delimiting single quotes with double quotes.
        paramStringTmp = paramStringTmp.replace(/^'/, '"');
        paramStringTmp = paramStringTmp.replace(/'$/, '"');

        //move param key to paramStringWellFormed var.
        paramStringWellFormed += paramStringTmp;
        paramString = paramString.substring(quotePos, paramString.length).trim();

      //if param value is wrapped in double quotes, just move to paramStringWellFormed var.
      } else if (paramString[0] === '"') {
        quotePos = paramString.search(/[^\\]"/);

        //except for unclosed quotes to prevent infinite loops.
        if (quotePos === -1) {
          quotePos = paramString.length - 1;
        } else {
          quotePos += 2;
        }

        //move param key to paramStringWellFormed var.
        paramStringWellFormed += paramString.substring(0, quotePos);
        paramString = paramString.substring(quotePos, paramString.length).trim();

      //if param value is not wrapped in quotes, move everthing up to the delimiting comma to paramStringWellFormed var.
      } else {
        delimitPos = paramString.indexOf(',');

        //except to prevent infinite loops.
        if (delimitPos === -1) {
          delimitPos = paramString.length - 1;
        }

        paramStringWellFormed += paramString.substring(0, delimitPos);
        paramString = paramString.substring(delimitPos, paramString.length).trim();
      }

      //break at the end.
      if (paramString.length <= 1) {
        paramStringWellFormed += paramString.trim();
        paramString = '';
        break;
      }

    } while (paramString);

    return paramStringWellFormed;
  }

  function findparameters(pattern, patternlab, parameteredPartials) {

    //the reason for rendering at this point is to eliminate the unwanted
    //recursion paths that would remain if irrelevant conditional tags persisted.
    //however, we only want to render the parameter data, so we need to identify
    //those tags, switch them to ERB syntax, and render for ERB syntax.
//    var tmpTemplate = pattern.tmpTemplate;

    //evaluate parameteredPartials within tmpTemplate
//    pattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(tmpTemplate);

//    if (pattern.parameteredPartials && pattern.parameteredPartials.length) {

      //iterate through most recently evaluated parameteredPartials
//      pattern.parameteredPartials.forEach(function (pMatch) {
      for (var i = 0; i < parameteredPartials.length; i++) {
        //find the partial's name and retrieve it
        var partialName = parameteredPartials[i].match(/([\w\-\.\/~]+)/g)[0];
        var partialPattern = pattern_assembler.get_pattern_by_key(partialName, patternlab);

        //if we retrieved a pattern we should make sure that its tmpTemplate is reset. looks to fix #190
        partialPattern.tmpTemplate = partialPattern.template;

        if (patternlab.config.debug) {
          console.log('found patternParameters for ' + partialName);
        }

        //strip out the additional data, convert string to JSON.
        var leftParen = parameteredPartials[i].indexOf('(');
        var rightParen = parameteredPartials[i].indexOf(')');
        var paramData = {};
        var paramString = '{' + parameteredPartials[i].substring(leftParen + 1, rightParen) + '}';
        var paramStringWellFormed = '{}';
        paramStringWellFormed = paramToJson(paramString);

        try {
          paramData = JSON.parse(paramStringWellFormed);
        } catch (e) {
          console.log(e);
        }

        //if partial has style modifier data, replace the styleModifier value
        if (pattern.stylePartials && pattern.stylePartials.length) {
          style_modifier_hunter.consume_style_modifier(partialPattern, parameteredPartials[i], patternlab);
        }

/*
        var allData = pattern_assembler.merge_data(startPattern.jsonFileData, paramData);

        //extend pattern data links into link for pattern link shortcuts to work. we do this locally and globally
        allData.link = extend({}, patternlab.data.link);
*/

        var regex;
        var escapedKey;
        for (var j in paramData) {
          if (paramData.hasOwnProperty(j) && (typeof paramData[j] === 'boolean' || typeof paramData[j] === 'number' || typeof paramData[j] === 'string')) {
            //escape regex special characters as per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
            escapedKey = j.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');

            //apply replacement based on allowable characters from lines 78 and 79 of mustache.js
            //of the Mustache for JS project.
            regex = new RegExp('\\{\\{([\\{#\\^\\/&]?\\s*' + escapedKey + '\\s*\\}?)\\}\\}', 'g');
            partialPattern.tmpTemplate = partialPattern.tmpTemplate.replace(regex, '<%$1%>');
          }
        }

        //then set the new delimiter at the beginning of the extended template
        partialPattern.tmpTemplate = '{{=<% %>=}}' + partialPattern.tmpTemplate;

        //the reason for rendering at this point is to eliminate the unwanted
        //recursion paths that would remain if irrelevant conditional tags persisted.
        partialPattern.tmpTemplate = pattern_assembler.renderPattern(partialPattern.tmpTemplate, paramData);

        //replace parameteredPartials with their rendered values.
        var pMatch = parameteredPartials[i].replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
        regex = new RegExp(pMatch, 'g');
        pattern.tmpTemplate = pattern.tmpTemplate.replace(regex, partialPattern.tmpTemplate);
if (pattern.abspath.indexOf('04-pages/00-homepage.mustache') > -1) {
if(j.indexOf('02_global_header') > -1) {
  console.log(escapedKey);
  console.log(pattern.tmpTemplate);
}
}
        pattern.tmpTemplate = pattern.tmpTemplate.replace(/^$\n/gm, '');
//        return tmpTemplate;
if (pattern.abspath.indexOf('01-molecules/sections/title-synopsis.mustache') > -1) {
  if (pMatch === '{{> 03-templates/field/field(title_synopsis\\?: true) }}') {
    /*
  console.log(pMatch);
  console.log('tmpTemplate after');
  console.log(tmpTemplate);
  */
  }
}
      }
//    }

    //after iterating through parameteredPartials, reassign the current pattern's
    //stylePartials, parameteredPartials, and tmpTemplate properties based on
    //the most recent evaluation of tmpTemplate.
/*
    pattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(tmpTemplate);
*/
//    pattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(tmpTemplate);
//    pattern.tmpTemplate = tmpTemplate;
if (pattern.abspath.indexOf('01-molecules/components/user-menu.mustache') > -1) {
//  console.log(tmpTemplate);
}

    //recurse if tmpTemplate still has parametered partials.
    if (pattern.parameteredPartials && pattern.parameteredPartials.length) {
//      findparameters(pattern, patternlab);
    }
  }

  /**
   * Reset the tmpTemplate on each pattern corresponding to the parametered
   * partial. This is to start fresh in case the pattern had been processed by
   * findparameters or processPatternRecursive before.
   *
   * @param {object} currentPattern
   * @param {array} parameteredPartials
   * @param {object} patternlab
   */
  function resetTmpTemplates(parameteredPartials, patternlab) {
    if (parameteredPartials && parameteredPartials.length) {
      for (var i = 0; i < parameteredPartials.length; i++) {

        //find the partial's name and retrieve it
        var partialName = parameteredPartials[i].match(/([\w\-\.\/~]+)/g)[0];
        var partialPattern = pattern_assembler.get_pattern_by_key(partialName, patternlab);

        //reset tmpTemplate for this partialPattern before recursing
        partialPattern.tmpTemplate = partialPattern.template;
      }
    }
  }

  return {
    find_parameters: function (pattern, patternlab, parameteredPartials, tmpTemplate) {
      findparameters(pattern, patternlab, parameteredPartials, tmpTemplate);
    },
    reset_tmp_templates: function(parameteredPartials, patternlab) {
      resetTmpTemplates(parameteredPartials, patternlab);
    }
  };

};

module.exports = parameter_hunter;
