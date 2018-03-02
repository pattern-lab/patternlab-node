/*
 * mustache utilities for patternlab-node - v2.X.X - 2016
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

'use strict';

// the term "alphanumeric" includes underscores.

// todo: document this exact regex long form.
var partialsRE = new RegExp(
  /{{>\s*?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_|]+)?(?:(?:| )\(.*)?(?:\s*)?}}/g
);

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
var partialsWithStyleModifiersRE = new RegExp(
  partialsWithStyleModifiersStr,
  'g'
);

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
var partialsWithPatternParametersRE = new RegExp(
  partialsWithPatternParametersStr,
  'g'
);

// look for an opening mustache loop tag, followed by >=0 whitespaces
var listItemsStr = '{{#\\s*';

// look for the string 'listItems.' or 'listitems.'
listItemsStr += '(list(I|i)tems\\.)';

// look for a number 1 - 20, spelled out
listItemsStr +=
  '(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)';

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
  partialKeyRE: partialKeyRE,
};

module.exports = utilMustache;
