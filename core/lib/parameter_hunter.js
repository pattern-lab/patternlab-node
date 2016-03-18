/* 
 * patternlab-node - v1.2.0 - 2016 
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
    JSON = require('json5'),
    pa = require('./pattern_assembler'),
    smh = require('./style_modifier_hunter'),
    pattern_assembler = new pa(),
    style_modifier_hunter = new smh();

  function paramToJson(pString) {
    var colonPos;
    var keyCandidate = '';
    var keys = [];
    var paramString;
    var paramStringWellFormed;
    var regex;
    var values = [];
    var wrapper;

    //replace all escaped double-quotes with escaped unicode
    paramString = pString.replace(/\\"/g, '\\u0022');

    //replace all escaped single-quotes with escaped unicode
    paramString = paramString.replace(/\\'/g, '\\u0027');

    //with escaped quotes out of the way, crawl through paramString looking for
    //keys and values
    do {

      //check if searching for a key
      if (paramString[0] === '{' || paramString[0] === ',' || keyCandidate) {
        paramString = paramString.substring([1], paramString.length).trim();

        //find what, if any, type of quote wraps the key
        switch (paramString[0]) {
          case '"':
            wrapper = '"';
            break;
          case '\'':
            wrapper = '\'';
            break;
          default:
            wrapper = '';
        }

        //find index of next colon. try to determine if that delimits a key
        colonPos = paramString.indexOf(':');

        if (colonPos) {
          if (keyCandidate) {
            keyCandidate += ':' + paramString.substring(0, colonPos).trim();
          } else {
            keyCandidate = paramString.substring(0, colonPos).trim();
          }

          if (keyCandidate[keyCandidate.length - 1] === wrapper) {
            keys.push(keyCandidate);
            keyCandidate = '';
          } else if (wrapper === '' && keyCandidate[keyCandidate.length - 1] !== '"' && keyCandidate[keyCandidate.length - 1] !== '\'') {
            keys.push(keyCandidate);
            keyCandidate = '';
          }

          //if we have a persistent keyCandidate, continue looking for a key
          if (keyCandidate) {
            continue;

          //truncate the beginning from paramString and continue looking
          //for a value
          } else {
            paramString = paramString.substring(colonPos, paramString.length);
          }

        //if there are no more colons, and we're looking for a key, there is
        //probably a problem. stop any further processing.
        } else {
          paramString = '';
          break;
        }
      }

      //now, search for a value
      if (paramString[0] === ':' && !keyCandidate) {
        paramString = paramString.substring([1], paramString.length).trim();

        //since a quote of same type as its wrappers would be escaped, and we
        //escaped those even further with their unicode, it is safe to look for
        //wrapper pairs and conclude that their contents are values
        switch (paramString[0]) {
          case '"':
            regex = /^"(.|\s)*?"/;
            break;
          case '\'':
            regex = /^'(.|\s)*?'/;
            break;

          //if there is no value wrapper, regex for alphanumerics
          default:
            regex = /^\w*/;
        }
        values.push(paramString.match(regex)[0].trim());

        //truncate the beginning from paramString and continue either
        //looking for a key, or returning 
        paramString = paramString.replace(regex, '').trim();

        //exit do while if the final char is '}'
        if (paramString === '}') {
          paramString = '';
          break;
        }

      //if there are no more colons, and we're looking for a value, there is
      //probably a problem. stop any further processing.
      } else {
        paramString = '';
        break;
      }
    } while (paramString);

    //build paramStringWellFormed string for JSON parsing
    paramStringWellFormed = '{';
    for (var i = 0; i < keys.length; i++) {

      //keys
      //replace single-quote wrappers with double-quotes
      if (keys[i][0] === '\'' && keys[i][keys[i].length - 1] === '\'') {
        paramStringWellFormed += '"';

        //any enclosed double-quotes must be escaped
        paramStringWellFormed += keys[i].substring(1, keys[i].length - 1).replace(/"/g, '\\"');
        paramStringWellFormed += '"';
      } else {

        //open wrap with double-quotes if no wrapper
        if (keys[i][0] !== '"' && keys[i][0] !== '\'') {
          paramStringWellFormed += '"';

          //this is to clean up vestiges from Pattern Lab PHP's escaping scheme
          keys[i] = keys[i].replace(/\\/g, '');
        }

        paramStringWellFormed += keys[i];

        //close wrap with double-quotes if no wrapper
        if (keys[i][keys[i].length - 1] !== '"' && keys[i][keys[i].length - 1] !== '\'') {
          paramStringWellFormed += '"';
        }
      }

      //colon delimiter.
      paramStringWellFormed += ':'; + values[i];

      //values
      //replace single-quote wrappers with double-quotes
      if (values[i][0] === '\'' && values[i][values[i].length - 1] === '\'') {
        paramStringWellFormed += '"';

        //any enclosed double-quotes must be escaped
        paramStringWellFormed += values[i].substring(1, values[i].length - 1).replace(/"/g, '\\"');
        paramStringWellFormed += '"';

      //for everything else, just add the colon and the value however it's wrapped
      } else {
        paramStringWellFormed += values[i];
      }

      //comma delimiter
      if (i < keys.length - 1) {
        paramStringWellFormed += ',';
      }
    }
    paramStringWellFormed += '}';

    //unescape unicodes for double-quotes
    paramString = pString.replace(/\\u0022/g, '\u0022');

    //unescape unicodes for single-quotes
    paramString = paramString.replace(/\\u0027/g, '\u0027');

    return paramStringWellFormed;
  }

  function findparameters(pattern, patternlab) {

    if (pattern.parameteredPartials && pattern.parameteredPartials.length > 0) {

      //compile this partial immeadiately, essentially consuming it.
      pattern.parameteredPartials.forEach(function (pMatch) {
        //find the partial's name and retrieve it
        var partialName = pMatch.match(/([\w\-\.\/~]+)/g)[0];
        var partialPattern = pattern_assembler.get_pattern_by_key(partialName, patternlab);

        //if we retrieved a pattern we should make sure that its extendedTemplate is reset. looks to fix #190
        partialPattern.extendedTemplate = partialPattern.template;

        if (patternlab.config.debug) {
          console.log('found patternParameters for ' + partialName);
        }

        //strip out the additional data, convert string to JSON.
        var leftParen = pMatch.indexOf('(');
        var rightParen = pMatch.lastIndexOf(')');
        var paramString = '{' + pMatch.substring(leftParen + 1, rightParen) + '}';
        var paramStringWellFormed = paramToJson(paramString);

        var paramData = {};
        var globalData = {};
        var localData = {};

        try {
          paramData = JSON.parse(paramStringWellFormed);
          globalData = JSON.parse(JSON.stringify(patternlab.data));
          localData = JSON.parse(JSON.stringify(pattern.jsonFileData || {}));
        } catch (err) {
          console.log('There was an error parsing JSON for ' + pattern.abspath);
          console.log(err);
        }

        var allData = pattern_assembler.merge_data(globalData, localData);
        allData = pattern_assembler.merge_data(allData, paramData);

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
        patternlab.partials[pattern.key] = pattern.extendedTemplate;
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
