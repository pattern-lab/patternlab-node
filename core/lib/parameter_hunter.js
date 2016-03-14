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
    pa = require('./pattern_assembler'),
    smh = require('./style_modifier_hunter'),
    style_modifier_hunter = new smh(),
    pattern_assembler = new pa();

  // Matches next non-whitespace char
  var nextNonWhiteSpaceCharRegex = /\S/;

  // Matches everything up to and including the next bare (i.e. non-quoted)
  // key or value. Since this may include preceding whitespace, the key/val
  // itself is captured as the 1st group.
  var bareKeyOrValueRegex = /^\s*([^:,'"\s]+)/;

  // Matches everything up to and including the next single or double-quoted
  // key or value. Since this may include preceding whitespace, the key/val
  // itself (including quotes) is captured as the 1st group.
  var quotedKeyOrValueRegex = /^\s*((['"])(\\.|[^\2\\])*?\2)/;

  /**
   * Extracts the next bit of text that could be a key or value.
   *
   * @param text    A string of input text.
   *
   * @param debug       Set to true to enable debug log messages.
   *
   * @returns {*}   Boolean false if the input text was empty,
   *                contained only whitespace or malformed
   *                quoted text.
   *                Otherwise, an object with the following
   *                attributes:
   *                "nextNspChar" : The first non-whitespace
   *                    character that was found.
   *                "keyOrValue" : A complete single- or
   *                    double-quoted string of text or
   *                    unquoted sequence of non-whitespace
   *                    characters. (Basically, something
   *                    that looks like a key or value)
   *                "remainder" : The rest of the input string
   *                    that follows the key, value or non-whitespace
   *                    character that was matched.
   */
  function extractNextKeyOrValue(text, debug) {
    var results = {};

    // Look for next non-whitespace character
    var nextNspChar = text.match(nextNonWhiteSpaceCharRegex);
    if (nextNspChar === null) {
      // String is either empty or entirely whitespace
      return false;
    }

    results.nextNspChar = nextNspChar[0];
    var matches;

    if (results.nextNspChar === '"' || results.nextNspChar === "'") {
      // Double- or single-quote should indicate start
      // of quoted key or value
      matches = text.match(quotedKeyOrValueRegex);

      if (matches === null) {
        // Means quoted string was never closed
        if (debug) {
          console.warn("Parameter hunter encountered incomplete quoted string in: ", text);
        }
        return false;
      }
      else {
        results.keyOrValue = matches[1];
        results.remainder = text.substr(matches[0].length);
        return results;
      }
    }
    else {
      // Bare key or value
      matches = text.match(bareKeyOrValueRegex);

      if (matches === null) {
        // Means there was no bare key or value (could happen if the next
        // non-whitespace char was : or , )

        // Still return a results object as extractNextKeyValPair() uses this
        // function to find : and , too.
        results.keyOrValue = false;
        results.remainder = text.substr(text.indexOf(results.nextNspChar) + 1); // Everything after the nextNspChar we found
        return results;
      }
      else {
        results.keyOrValue = matches[1];
        results.remainder = text.substr(matches[0].length);
        return results;
      }
    }
  }

  /**
   * Takes an object containing some key or value text and converts
   * it to double-quoted text.
   *
   * @param extractedKeyOrVal   An object, like the ones returned by
   *                            extractNextKeyOrValue(), that has the
   *                            following attributes:
   *                            "keyOrValue": Text that needs to be
   *                                double-quoted. It may be bare,
   *                                single-quoted or double-quoted.
   *                            "nextNspChar": The first character of
   *                                "keyOrValue". (Which, in the case of
   *                                quoted text, will either be a single-
   *                                or double-quote.)
   *
   * @param isVal               If true, bare (i.e. unquoted) input texts
   *                            are returned as is. Useful for value text,
   *                            where numbers or booleans should not be
   *                            quoted.
   *
   * @returns {string}    A string containing the "keyOrValue" text correctly
   *                      double-quoted (unless isVal was true, in which case
   *                      unquoted input strings remain unquoted).
   */
  function doubleQuoteKeyOrValIfNeeded(extractedKeyOrVal, isVal) {
    if (extractedKeyOrVal.nextNspChar === '"') {
      // Already double-quoted
      return extractedKeyOrVal.keyOrValue;
    }
    else if (extractedKeyOrVal.nextNspChar === "'") {
      // Single quoted. Need to convert to double quotes
      var keyOrValText = extractedKeyOrVal.keyOrValue.substr(1, (extractedKeyOrVal.keyOrValue.length - 2)); // strip off single quotes
      keyOrValText = keyOrValText.replace(/\\'/g, "'"); // Un-escape, escaped single quotes
      return '"' + keyOrValText.replace(/"/g, '\\"') + '"'; // Escape double quotes
    }
    else {
      // Bare key or val
      if (!isVal) {
        // Keys must always be double-quoted
        return '"' + extractedKeyOrVal.keyOrValue.replace(/"/g, '\\"') + '"'; // Escape double quotes
      }
      else {
        // Return as is
        return extractedKeyOrVal.keyOrValue;
      }
    }
  }


  // Used by extractNextKeyValPair()
  var STATE_EXPECTING_KEY = 0;
  var STATE_EXPECTING_COLON = 1;
  var STATE_EXPECTING_VALUE = 2;
  var STATE_EXPECTING_COMMA = 3;

  /**
   * Extracts the next key:value pair from the input text
   * and returns it in a form suitable for inclusion in a
   * JSON string.
   *
   * @param text    A string of input text that contains
   *                comma-separated key:value pairs, where the
   *                keys and values may be unquoted, single-quoted
   *                or double-quoted text.
   *
   * @param debug   Set to true to enable debug log messages.
   *
   * @returns {*}   Boolean false if the input text was empty or
   *                contained only whitespace.
   *                Otherwise an object with the following
   *                attributes:
   *                "error": A boolean indicating whether the
   *                    parsed key:value pair was malformed (true)
   *                    or not (false).
   *                "key": A string containing the double-quoted
   *                    key text. Or boolean false, if no key
   *                    was found.
   *                "val": A string containing the value text
   *                    (double-quoted, if the input was quoted, or
   *                    bare, if the input was unquoted).
   *                    Or boolean false, if no value was found.
   *                "remainder": The rest of the input string that
   *                    follows the key:val pair that was extracted.
   */
  function extractNextKeyValPair(text, debug) {
    var result = {
      error: false,
      key: false,
      val: false,
      remainder: text
    };

    var state = STATE_EXPECTING_KEY;
    var extractedItem;

    while ((extractedItem = extractNextKeyOrValue(result.remainder, debug)) !== false) {
      // Update remaining text in readiness for next loop iteration
      result.remainder = extractedItem.remainder;

      if (!result.error) {
        if (state === STATE_EXPECTING_KEY) {
          if (extractedItem.keyOrValue === false) {
            // Something other than key or val found
            if (debug) {
              console.warn("Parameter hunter expected a key but found: ", extractedItem.nextNspChar);
            }
            result.error = true;
          }
          else {
            // Found key
            result.key = doubleQuoteKeyOrValIfNeeded(extractedItem);
            state = STATE_EXPECTING_COLON;
          }
        }
        else if (state === STATE_EXPECTING_COLON) {
          // We expect keyOrValue to be false and nextNspChar to be :
          if (extractedItem.keyOrValue !== false || extractedItem.nextNspChar !== ':') {
            if (debug) {
              console.warn("Parameter hunter expected a colon found: ", extractedItem.nextNspChar);
            }
            result.error = true;
          }
          else {
            state = STATE_EXPECTING_VALUE;
          }
        }
        else if (state === STATE_EXPECTING_VALUE) {
          if (extractedItem.keyOrValue === false) {
            // Something other than key or val found
            if (debug) {
              console.warn("Parameter hunter expected a value but found: ", extractedItem.nextNspChar);
            }
            result.error = true;
          }
          else {
            // Found value
            result.val = doubleQuoteKeyOrValIfNeeded(extractedItem, true);
            state = STATE_EXPECTING_COMMA;
          }
        }
        else { // STATE_EXPECTING_COMMA
          // We expect keyOrValue to be false and nextNspChar to be ,
          if (extractedItem.keyOrValue !== false || extractedItem.nextNspChar !== ',') {
            if (debug) {
              console.warn("Parameter hunter expected a comma found: ", extractedItem.nextNspChar);
            }
            result.error = true;
          }
          else {
            // We're done parsing this key:val pair
            break;
          }
        }
      }

      if (result.error) {
        // We encountered an error. Check if we found a comma
        // (which would denote the end of this broken key:val pair and
        // the beginning of another)
        if (extractedItem.keyOrValue === false && extractedItem.nextNspChar === ',') {
          // Found comma, stop looping
          break;
        } // else: Keep looping through remaining text until next comma is found...
      }
    }

    if (result.key === false && result.val === false && !result.error) {
      // Means that the input text was empty
      return false;
    }
    else {
      return result;
    }
  }


  /**
   * Parses the patterns parameters and returns them as a
   * JSON string.
   *
   * Note that the input should only include the text within
   * the parenthesis. E.g. if the pattern was:
   * 'pattern-name( param1: true, param2: "string", param3: 42 )', then only
   * ' param1: true, param2: "string", param3: 42 ' should be passed to this
   * function. (Leading & trailing whitespace is OK)
   *
   * In the above example, the output will be something like:
   * '{ "param1": true, "param2": "string", "param3": 42 }'. Be aware that
   * no type-checking is performed. If the input contains an unquoted value
   * that is not a valid JSON boolean or number, then that will be carried
   * over to the output and attempting to parse it as JSON will fail.
   *
   * If any key:val pairs are malformed (e.g. key or value is blank)
   * they are skipped, but subsequent pairs will still be parsed.
   * If the debug flag is set in the config, the malformed pairs
   * will be logged as warnings.
   *
   * @param pString     String containing the pattern's parameters.
   * @param debug       Set to true to enable debug log messages.
   * @returns {string}  The parameters as a JSON string (including
   *                    curly braces).
   */
  function paramToJson(pString, debug) {
    var wellFormedKeyVals = '';
    var remainder = pString;
    var lastKeyVal;
    while ((lastKeyVal = extractNextKeyValPair(remainder, debug)) !== false) {
      if (lastKeyVal.error) {
        if (debug) {
          console.warn(
            "Parameter hunter skipped broken key:val pair: ",
            remainder.substr(0, (remainder.length - lastKeyVal.remainder.length))
          );
        } // else: Silently ignore error
      }
      else {
        // Add parsed key:val pair to output
        if (wellFormedKeyVals !== '') {
          wellFormedKeyVals += ",\n";
        }
        wellFormedKeyVals += "\t" + lastKeyVal.key + ': ' + lastKeyVal.val;
      }

      remainder = lastKeyVal.remainder;
    }

    return "{\n" + wellFormedKeyVals + "\n}";
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
        var paramString = pMatch.substring(leftParen + 1, rightParen);
        var paramStringWellFormed = paramToJson(paramString, patternlab.config.debug);

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
