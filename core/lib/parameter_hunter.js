/*
 * patternlab-node - v1.2.1 - 2016
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
    plutils = require('./utilities'),
    style_modifier_hunter = new smh(),
    pattern_assembler = new pa();

  function paramToJson(pString) {
    var paramStringWellFormed = '';
    var paramStringTmp;
    var colonPos;
    var delimitPos;
    var quotePos;
    var paramString = pString;

    do {

      //if param partial is wrapped in single quotes, replace with double quotes.
      paramString = paramString.replace(/(^\s*[\{|\,]\s*)'([^']+)'(\s*\:)/, '$1"$2"$3');

      //if params partial is not wrapped in any quotes, wrap in double quotes.
      paramString = paramString.replace(/(^\s*[\{|\,]\s*)([^\s"'\:]+)(\s*\:)/, '$1"$2"$3');

      //move param partial to paramStringWellFormed var.
      colonPos = paramString.indexOf(':');

      //except to prevent infinite loops.
      if (colonPos === -1) {
        colonPos = paramString.length - 1;
      }
      else {
        colonPos += 1;
      }
      paramStringWellFormed += paramString.substring(0, colonPos);
      paramString = paramString.substring(colonPos, paramString.length).trim();

      //if param value is wrapped in single quotes, replace with double quotes.
      if (paramString[0] === '\'') {
        quotePos = paramString.search(/[^\\]'/);

        //except for unclosed quotes to prevent infinite loops.
        if (quotePos === -1) {
          quotePos = paramString.length - 1;
        }
        else {
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

        //move param partial to paramStringWellFormed var.
        paramStringWellFormed += paramStringTmp;
        paramString = paramString.substring(quotePos, paramString.length).trim();
      }

      //if param value is wrapped in double quotes, just move to paramStringWellFormed var.
      else if (paramString[0] === '"') {
        quotePos = paramString.search(/[^\\]"/);

        //except for unclosed quotes to prevent infinite loops.
        if (quotePos === -1) {
          quotePos = paramString.length - 1;
        }
        else {
          quotePos += 2;
        }

        //move param partial to paramStringWellFormed var.
        paramStringWellFormed += paramString.substring(0, quotePos);
        paramString = paramString.substring(quotePos, paramString.length).trim();
      }

      //if param value is not wrapped in quotes, move everthing up to the delimiting comma to paramStringWellFormed var.
      else {
        delimitPos = paramString.indexOf(',');

        //except to prevent infinite loops.
        if (delimitPos === -1) {
          delimitPos = paramString.length - 1;
        }
        else {
          delimitPos += 1;
        }
        paramStringWellFormed += paramString.substring(0, delimitPos);
        paramString = paramString.substring(delimitPos, paramString.length).trim();
      }

      //break at the end.
      if (paramString.length === 1) {
        paramStringWellFormed += paramString.trim();
        paramString = '';
        break;
      }

    } while (paramString);

    return paramStringWellFormed;
  }

  function findparameters(pattern, patternlab) {

    if (pattern.parameteredPartials && pattern.parameteredPartials.length > 0) {

      //compile this partial immeadiately, essentially consuming it.
      pattern.parameteredPartials.forEach(function (pMatch) {
        //find the partial's name and retrieve it
        var partialName = pMatch.match(/([\w\-\.\/~]+)/g)[0];
        var partialPattern = pattern_assembler.findPartial(partialName, patternlab);

        //if we retrieved a pattern we should make sure that its extendedTemplate is reset. looks to fix #190
        partialPattern.extendedTemplate = partialPattern.template;

        if (patternlab.config.debug) {
          console.log('found patternParameters for ' + partialName);
        }

        //strip out the additional data, convert string to JSON.
        var leftParen = pMatch.indexOf('(');
        var rightParen = pMatch.indexOf(')');
        var paramString = '{' + pMatch.substring(leftParen + 1, rightParen) + '}';
        var paramStringWellFormed = paramToJson(paramString);

        var paramData = {};
        var globalData = {};
        var localData = {};

        try {
          paramData = JSON.parse(paramStringWellFormed);
          globalData = JSON.parse(JSON.stringify(patternlab.data));
          localData = JSON.parse(JSON.stringify(pattern.jsonFileData || {}));
        } catch (e) {
          console.log(e);
        }

        var allData = plutils.mergeData(globalData, localData);
        allData = plutils.mergeData(allData, paramData);

        //if partial has style modifier data, replace the styleModifier value
        if (pattern.stylePartials && pattern.stylePartials.length > 0) {
          style_modifier_hunter.consume_style_modifier(partialPattern, pMatch, patternlab);
        }

        //extend pattern data links into link for pattern link shortcuts to work. we do this locally and globally
        allData.link = extend({}, patternlab.data.link);

        var renderedPartial = pattern_assembler.renderPattern(partialPattern.extendedTemplate, allData, patternlab.partials);

        //remove the parameter from the partial and replace it with the rendered partial + paramData
        pattern.extendedTemplate = pattern.extendedTemplate.replace(pMatch, renderedPartial);

        //update the extendedTemplate in the partials object in case this pattern is consumed later
        patternlab.partials[pattern.patternPartial] = pattern.extendedTemplate;
      });
    }
  }

  return {
    find_parameters: function (pattern, patternlab) {
      findparameters(pattern, patternlab);
    }
  };

};

module.exports = parameter_hunter;
