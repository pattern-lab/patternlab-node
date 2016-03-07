/*
 * mustache utilities for patternlab-node - v0.10.1 - 2015
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

(function () {
  'use strict';

  // the term "alphanumeric" includes underscores.

  // look for an opening mustache include tag, followed by >=0 whitespaces
  var partialsStr = '{{>\\s*';
  // begin 1st exterior group, a mandatory group
  // look for >0 of an interior group comprising
  // >0 digits, followed by a hyphen, followed by >0 alphanumerics
  partialsStr += '((\\d+-[\\w-]+\\/)+';
  // then an interior group comprising
  // >0 digits, followed by a hyphen, followed by >0 alphanumerics,
  // followed by an optional group of a period followed by >0 alphanumerics
  partialsStr += '(\\d+-[\\w-]+(\\.\\w+)?)';
  // if the previous two interior groups are not found, look for any number of
  // alphanumerics or hyphens
  partialsStr += '|[\\w\\-]+)';
  // end 1st exterior group
  // begin 2nd exterior group, an optional group
  // look for a colon, followed by >0 alphanumerics or hyphens,
  // followed by >=0 interior groups
  // comprising a pipe, followed by >0 alphanumerics or hyphens
  partialsStr += '(\\:[\\w\\-]+(\\|[\\w\\-]+)*)?';
  // end 2nd exterior group
  // begin 3rd exterior group, an optional group
  // look for an opening parenthesis, followed by >=0 whitespaces, followed by
  // >0 alphanumerics, followed by >=0 whitespaces, followed by a colon,
  // followed by >=0 whitespaces
  partialsStr += '(\\(\\s*\\w+\\s*\\:\\s*';
  // followed by an interior group
  // comprising a single quote, followed by an interior group comprising
  // >=0 characters that are not single quotes or backslashes
  // or >=0 character pairs comprising a backlash, followed by any character.
  // look for a single quote to terminate this pattern
  partialsStr += '(\'([^\'\\\\]|\\\\.)*\'';
  // if the pattern wrapped in single quotes is not found, look for one wrapped
  // in double quotes
  // look for a double quote, followed by an interior group comprising
  // >=0 characters that are not double quotes or backslashes
  // or >=0 character pairs comprising a backlash, followed by any character.
  // look for a double quote to terminate this pattern
  partialsStr += '|"([^"\\\\]|\\\\.)*")';
  // look for a closing parenthesis
  partialsStr += '\\))?';
  // end 3rd exterior group
  // look for >=0 whitespaces, followed by closing mustache tag
  partialsStr += '\\s*}}';
  var partialsRE = new RegExp(partialsStr, 'g');

  // look for an opening mustache include tag, followed by >=0 whitespaces
  var partialsWithStyleModifiersStr = '{{>\\s*';
  // one or more characters comprising any combination of alphanumerics,
  // hyphens, periods, slashses, and tildes
  partialsWithStyleModifiersStr += '([\\w\\-\\.\\/~]+)';
  // the previous group cannot be followed by an opening parenthesis
  partialsWithStyleModifiersStr += '(?!\\()';
  // a colon followed by one or more characters comprising any combination
  // of alphanumerics, hyphens, and pipes
  partialsWithStyleModifiersStr += '(\\:[\\w\\-\\|]+)';
  // an optional group of characters starting with >=0 whitespaces, followed by
  // an opening parenthesis, followed by any number of characters that are not
  // closing parentheses, followed by a closing parenthesis
  partialsWithStyleModifiersStr += '(\\s*\\([^\\)]*\\))?';
  // look for >=0 whitespaces, followed by closing mustache tag
  partialsWithStyleModifiersStr += '\\s*}}';
  var partialsWithStyleModifiersRE = new RegExp(partialsWithStyleModifiersStr, 'g');

  // look for an opening mustache include tag, followed by >=0 whitespaces
  var partialsWithPatternParametersStr = '{{>\\s*';
  // one or more characters comprising any combination of alphanumerics,
  // hyphens, periods, slashses, and tildes
  partialsWithPatternParametersStr += '([\\w\\-\\.\\/~]+)';
  // an optional group comprising a colon followed by one or more characters
  // comprising any combination of alphanumerics,
  // hyphens, and pipes
  partialsWithPatternParametersStr += '(\\:[\\w\\-\\|]+)?';
  // a group of characters starting with >=0 whitespaces, followed by an opening
  // parenthesis, followed by any number of characters that are not closing
  // parentheses, followed by a closing parenthesis
  partialsWithPatternParametersStr += '(\\s*\\([^\\)]*\\))';
  // look for >=0 whitespaces, followed by closing mustache tag
  partialsWithPatternParametersStr += '\\s*}}';
  var partialsWithPatternParametersRE = new RegExp(partialsWithPatternParametersStr, 'g');

  // look for an opening mustache loop tag, followed by >=0 whitespaces
  var listItemsStr = '{{#\\s*';
  // look for the string 'listItems.' or 'listitems.'
  listItemsStr += '(list(I|i)tems\\.)';
  // look for a number 1 - 20, spelled out
  listItemsStr += '(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)';
  // look for >=0 whitespaces, followed by closing mustache tag
  listItemsStr += '\\s*}}';
  var listItemsRE = new RegExp(listItemsStr, 'g');

  // look for an opening mustache loop tag, followed by >=0 whitespaces
  var partialKeyStr = '{{>\\s*';
  // one or more characters comprising any combination of alphanumerics,
  // hyphens, periods, slashses, and tildes
  partialKeyStr += '([\\w\\-\\.\\/~]+)';
  // an optional group of characters starting with a colon, followed by >0
  // alphanumerics, hyphens, or pipes 
  partialKeyStr += '(\\:[\\w\\-|]+)?';
  // an optional group of characters starting with a colon, followed by >0
  // alphanumerics or hyphens 
  partialKeyStr += '(\\:[\\w\\-]+)?';
  // an optional group of characters starting with >=0 whitespaces, followed by
  // an opening parenthesis, followed by any number of characters that are not
  // closing parentheses, followed by a closing parenthesis
  partialKeyStr += '(\\s*\\([^\\)]*\\))?';
  // look for >=0 whitespaces, followed by closing mustache tag
  partialKeyStr += '\\s*}}';
  var partialKeyRE = new RegExp(partialKeyStr, 'g');

  var utilMustache = {
    partialsRE: partialsRE,
    partialsWithStyleModifiersRE: partialsWithStyleModifiersRE,
    partialsWithPatternParametersRE: partialsWithPatternParametersRE,
    listItemsRE: listItemsRE,
    partialKeyRE: partialKeyRE
  };

  module.exports = utilMustache;
})();
