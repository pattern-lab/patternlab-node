"use strict";

var parameter_hunter = function () {

  var extend = require('util')._extend,
    JSON5 = require('json5'),
    pa = require('./pattern_assembler'),
    smh = require('./style_modifier_hunter'),
    plutils = require('./utilities'),
    style_modifier_hunter = new smh(),
    pattern_assembler = new pa();

  /**
   * This function is really to accommodate the lax JSON-like syntax allowed by
   * Pattern Lab PHP for parameter submissions to partials. Unfortunately, no
   * easily searchable library was discovered for this. What we had to do was
   * write a custom script to crawl through the parameter string, and wrap the
   * keys and values in double-quotes as necessary.
   * The steps on a high-level are as follows:
   *   * Further escape all escaped quotes and colons. Use the string
   *     representation of their unicodes for this. This has the added bonus
   *     of being interpreted correctly by JSON5.parse() without further
   *     modification. This will be useful later in the function.
   *   * Once escaped quotes are out of the way, we know the remaining quotes
   *     are either key/value wrappers or wrapped within those wrappers. We know
   *     that remaining commas and colons are either delimiters, or wrapped
   *     within quotes to not be recognized as such.
   *   * A do-while loop crawls paramString to write keys to a keys array and
   *     values to a values array.
   *   * Start by parsing the first key. Determine the type of wrapping quote,
   *     if any.
   *   * By knowing the open wrapper, we know that the next quote of that kind
   *     (if the key is wrapped in quotes), HAS to be the close wrapper.
   *     Similarly, if the key is unwrapped, we know the next colon HAS to be
   *     the delimiter between key and value.
   *   * Save the key to the keys array.
   *   * Next, search for a value. It will either be the next block wrapped in
   *     quotes, or a string of alphanumerics, decimal points, or minus signs.
   *   * Save the value to the values array.
   *   * The do-while loop truncates the paramString value while parsing. Its
   *     condition for completion is when the paramString is whittled down to an
   *     empty string.
   *   * After the keys and values arrays are built, a for loop iterates through
   *     them to build the final paramStringWellFormed string.
   *   * No quote substitution had been done prior to this loop. In this loop,
   *     all keys are ensured to be wrapped in double-quotes. String values are
   *     also ensured to be wrapped in double-quotes.
   *   * Unescape escaped unicodes except for double-quotes. Everything beside
   *     double-quotes will be wrapped in double-quotes without need for escape.
   *   * Return paramStringWellFormed.
   *
   * @param {string} pString
   * @returns {string} paramStringWellFormed
   */
  function paramToJson(pString) {
    var colonPos = -1;
    var keys = [];
    var paramString = pString; // to not reassign param
    var paramStringWellFormed;
    var quotePos = -1;
    var regex;
    var values = [];
    var wrapper;

    //replace all escaped double-quotes with escaped unicode
    paramString = paramString.replace(/\\"/g, '\\u0022');

    //replace all escaped single-quotes with escaped unicode
    paramString = paramString.replace(/\\'/g, '\\u0027');

    //replace all escaped colons with escaped unicode
    paramString = paramString.replace(/\\:/g, '\\u0058');

    //with escaped chars out of the way, crawl through paramString looking for
    //keys and values
    do {

      //check if searching for a key
      if (paramString[0] === '{' || paramString[0] === ',') {
        paramString = paramString.substring(1, paramString.length).trim();

        //search for end quote if wrapped in quotes. else search for colon.
        //everything up to that position will be saved in the keys array.
        switch (paramString[0]) {

          //need to search for end quote pos in case the quotes wrap a colon
          case '"':
          case '\'':
            wrapper = paramString[0];
            quotePos = paramString.indexOf(wrapper, 1);
            break;

          default:
            colonPos = paramString.indexOf(':');
        }

        if (quotePos > -1) {
          keys.push(paramString.substring(0, quotePos + 1).trim());

          //truncate the beginning from paramString and look for a value
          paramString = paramString.substring(quotePos + 1, paramString.length).trim();

          //unset quotePos
          quotePos = -1;

        } else if (colonPos > -1) {
          keys.push(paramString.substring(0, colonPos).trim());

          //truncate the beginning from paramString and look for a value
          paramString = paramString.substring(colonPos, paramString.length);

          //unset colonPos
          colonPos = -1;

        //if there are no more colons, and we're looking for a key, there is
        //probably a problem. stop any further processing.
        } else {
          paramString = '';
          break;
        }
      }

      //now, search for a value
      if (paramString[0] === ':') {
        paramString = paramString.substring(1, paramString.length).trim();

        //the only reason we're using regexes here, instead of indexOf(), is
        //because we don't know if the next delimiter is going to be a comma or
        //a closing curly brace. since it's not much of a performance hit to
        //use regexes as sparingly as here, and it's much more concise and
        //readable, we'll use a regex for match() and replace() instead of
        //performing conditional logic with indexOf().
        switch (paramString[0]) {

          //since a quote of same type as its wrappers would be escaped, and we
          //escaped those even further with their unicodes, it is safe to look
          //for wrapper pairs and conclude that their contents are values
          case '"':
            regex = /^"(.|\s)*?"/;
            break;
          case '\'':
            regex = /^'(.|\s)*?'/;
            break;

          //if there is no value wrapper, regex for alphanumerics, decimal
          //points, and minus signs for exponential notation.
          default:
            regex = /^[\w\-\.]*/;
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

          //this is to clean up vestiges from Pattern Lab PHP's escaping scheme.
          //F.Y.I. Pattern Lab PHP would allow special characters like question
          //marks in parameter keys so long as the key was unwrapped and the
          //special character escaped with a backslash. In Node, we need to wrap
          //those keys and unescape those characters.
          keys[i] = keys[i].replace(/\\/g, '');
        }

        paramStringWellFormed += keys[i];

        //close wrap with double-quotes if no wrapper
        if (keys[i][keys[i].length - 1] !== '"' && keys[i][keys[i].length - 1] !== '\'') {
          paramStringWellFormed += '"';
        }
      }

      //colon delimiter.
      paramStringWellFormed += ':';

      //values
      //replace single-quote wrappers with double-quotes
      if (values[i][0] === '\'' && values[i][values[i].length - 1] === '\'') {
        paramStringWellFormed += '"';

        //any enclosed double-quotes must be escaped
        paramStringWellFormed += values[i].substring(1, values[i].length - 1).replace(/"/g, '\\"');
        paramStringWellFormed += '"';

      //for everything else, just add the value however it's wrapped
      } else {
        paramStringWellFormed += values[i];
      }

      //comma delimiter
      if (i < keys.length - 1) {
        paramStringWellFormed += ',';
      }
    }
    paramStringWellFormed += '}';

    //unescape escaped unicode except for double-quotes
    paramStringWellFormed = paramStringWellFormed.replace(/\\u0027/g, '\'');
    paramStringWellFormed = paramStringWellFormed.replace(/\\u0058/g, ':');

    return paramStringWellFormed;
  }

  function findparameters(pattern, patternlab) {

    if (pattern.parameteredPartials && pattern.parameteredPartials.length > 0) {

      //compile this partial immeadiately, essentially consuming it.
      pattern.parameteredPartials.forEach(function (pMatch) {
        //find the partial's name and retrieve it
        var partialName = pMatch.match(/([\w\-\.\/~]+)/g)[0];
        var partialPattern = pattern_assembler.getPartial(partialName, patternlab);

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
          paramData = JSON5.parse(paramStringWellFormed);
          globalData = JSON5.parse(JSON5.stringify(patternlab.data));
          localData = JSON5.parse(JSON5.stringify(pattern.jsonFileData || {}));
        } catch (err) {
          console.log('There was an error parsing JSON for ' + pattern.relPath);
          console.log(err);
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
