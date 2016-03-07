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

var pattern_assembler = function () {

  // find regex matches within both pattern strings and pattern objects.
  function patternMatcher(pattern, regex) {
    var matches;

    if (typeof pattern === 'string') {
      matches = pattern.match(regex);
    } else if (typeof pattern === 'object' && typeof pattern.template === 'string') {
      matches = pattern.template.match(regex);
    }

    return matches;
  }

  // returns any patterns that match {{> value:mod }} or {{> value:mod(foo:"bar") }} within the pattern
  function findPartialsWithStyleModifiers(pattern) {
    var regex = /{{>([ ])?([\w\-\.\/~]+)(?!\()(\:[A-Za-z0-9-_|]+)+(?:(| )\([^\)]*\))?([ ])?}}/g;
    var matches = patternMatcher(pattern, regex);

    return matches;
  }

  // returns any patterns that match {{> value(foo:"bar") }} or {{> value:mod(foo:"bar") }} within the pattern
  function findPartialsWithPatternParameters(pattern) {
    var regex = /{{>([ ])?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_|]+)?(?:(| )\([^\)]*\))+([ ])?}}/g;
    var matches = patternMatcher(pattern, regex);

    return matches;
  }

  //find and return any {{> template-name* }} within pattern
  function findPartials(pattern) {
    var regex = /{{>([ ])?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_|]+)?(?:(| )\([^\)]*\))?([ ])?}}/g;
    var matches = patternMatcher(pattern, regex);

    return matches;
  }

  function findListItems(pattern) {
    var regex = /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g;
    var matches = patternMatcher(pattern, regex);

    return matches;
  }

  function setState(pattern, patternlab) {
    if (patternlab.config.patternStates && patternlab.config.patternStates[pattern.patternName]) {
      pattern.patternState = patternlab.config.patternStates[pattern.patternName];
    } else {
      pattern.patternState = "";
    }
  }

  function addPattern(pattern, patternlab) {
    //add the link to the global object
    patternlab.data.link[pattern.patternGroup + '-' + pattern.patternName] = '/patterns/' + pattern.patternLink;

    //only push to array if the array doesn't contain this pattern
    var isNew = true, i;
    for (i = 0; i < patternlab.patterns.length; i++) {
      //so we need the identifier to be unique, which patterns[i].abspath is
      if (pattern.abspath === patternlab.patterns[i].abspath) {
        //if abspath already exists, overwrite that element
        patternlab.patterns[i] = pattern;
        isNew = false;
        break;
      }
    }

    //if the pattern is new, just push to the array
    if (isNew) {
      patternlab.patterns.push(pattern);
    }
  }

  function renderPattern(template, data, partials) {
    var mustache = require('mustache');

    if (partials) {
      return mustache.render(template, data, partials);
    } else {
      return mustache.render(template, data);
    }
  }

  //http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
  function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x); //eslint-disable-line curly
    return o;
  }

  function buildListItems(container) {
    //combine all list items into one structure
    var list = [];
    for (var item in container.listitems) {
      if (container.listitems.hasOwnProperty(item)) {
        list.push(container.listitems[item]);
      }
    }
    container.listItemArray = shuffle(list);

    for (var i = 1; i <= container.listItemArray.length; i++) {
      var tempItems = [];
      if (i === 1) {
        tempItems.push(container.listItemArray[0]);
        container.listitems['' + i] = tempItems;
      } else {
        for (var c = 1; c <= i; c++) {
          tempItems.push(container.listItemArray[c - 1]);
          container.listitems['' + i] = tempItems;
        }
      }
    }
  }

  /**
   * Render the template excluding partials. The reason for this is to eliminate
   * the unwanted recursion paths that would remain if irrelevant conditional
   * tags persisted. Targeting non-partial tags that are not keyed in the JSON
   * data for this pattern. Those will be deleted after this runs.
   *
   * @param {string} template The template to render.
   * @param {object} data The data to render with.
   * @param {object} dataKeys The data to render with.
   * @returns {string} templateRendered
   */
  function escapeRenderUnescape(pattern) {

    //escape partial tags by switching them to ERB syntax.
    var escapedKey;
    var regex;
    var templateEscaped = pattern.tmpTemplate;

    for (var i = 0; i < pattern.dataKeys.length; i++) {
      escapedKey = pattern.dataKeys[i].replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
      regex = new RegExp('\\{\\{([\\{#\\^\\/&]?\\s*' + escapedKey + '\\s*\\}?)\\}\\}', 'g');
      templateEscaped = templateEscaped.replace(regex, '<%$1%>');
    }
    templateEscaped = templateEscaped.replace(/\{\{>([^\}]+)\}\}/g, '<%>$1%>');
if (pattern.abspath.indexOf('01-molecules/components/user-menu.mustache') > -1) {
console.log(templateEscaped);
}

    var templateRendered = renderPattern(templateEscaped, pattern.jsonFileData);
    templateRendered = templateRendered.replace(/<%([^%]+)%>/g, '{{$1}}');

    //after that's done, switch back to standard Mustache tags and return.
//    var templateRendered = templateEscaped.replace(/<%>([^%]+)%>/g, '{{>$1}}');

    return templateRendered;
  }

  /**
   * Render the template excluding partials. The reason for this is to eliminate
   * the unwanted recursion paths that would remain if irrelevant conditional
   * tags persisted. Escaping partial tags so a full render of non-partial tags
   * eliminate irrelevant conditional tags.
   *
   * @param {string} template The template to render.
   * @param {object} data The data to render with.
   * @returns {string} templateRendered
   */
  function escapeRenderUnescapePartials(template, data) {

    //escape partial tags by switching them to ERB syntax.
    var templateEscaped = template.replace(/\{\{>([^\}]+)\}\}/g, '<%>$1%>');
    templateEscaped = renderPattern(templateEscaped, data);

    //after that's done, switch back to standard Mustache tags and return.
    var templateRendered = templateEscaped.replace(/<%>([^%]+)%>/g, '{{>$1}}');

    return templateRendered;
  }

  /**
   * Recursively get all the property keys from the JSON data for a pattern.
   *
   * @param {object} data
   * @param {array} keys At top level of recursion, this should be undefined.
   * @returns {array} keys A flat, one-dimensional array.
   */
  function getDataKeys(data) {
    var keys = [];

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        if (!(typeof data === 'object' && data instanceof Array)) {
          keys.push(key);
        }
        if (typeof data[key] === 'object') {
          keys = keys.concat(getDataKeys(data[key]));
        }
      }
    }

    return keys;
  }

  function getpatternbykey(key, patternlab) {
    var i; // for the for loops

    for (i = 0; i < patternlab.patterns.length; i++) {
      switch (key) {

        //look for exact key matches
        case patternlab.patterns[i].key:

        //look for abspath matches
        case patternlab.patterns[i].abspath:

        //else look by verbose syntax
        case patternlab.patterns[i].subdir + '/' + patternlab.patterns[i].fileName:
        case patternlab.patterns[i].subdir + '/' + patternlab.patterns[i].fileName + '.mustache':
          return patternlab.patterns[i];
      }
    }

    //return the fuzzy match if all else fails
    for (i = 0; i < patternlab.patterns.length; i++) {
      var keyParts = key.split('-'),
        keyType = keyParts[0],
        keyName = keyParts.slice(1).join('-');

      if (patternlab.patterns[i].key.split('-')[0] === keyType && patternlab.patterns[i].key.indexOf(keyName) > -1) {
        return patternlab.patterns[i];
      }
    }

    return null;
  }

  function mergeData(obj1, obj2) {
    if (typeof obj2 === 'undefined') {
      obj2 = {}; //eslint-disable-line no-param-reassign
    }

    for (var p in obj1) { //eslint-disable-line guard-for-in
      try {
        // Only recurse if obj1[p] is an object.
        if (obj1[p].constructor === Object) {
          // Requires 2 objects as params; create obj2[p] if undefined.
          if (typeof obj2[p] === 'undefined') {
            obj2[p] = {};
          }
          obj2[p] = mergeData(obj1[p], obj2[p]);

          // Pop when recursion meets a non-object. If obj1[p] is a non-object,
          // only copy to undefined obj2[p]. This way, obj2 maintains priority.
        } else if (typeof obj2[p] === 'undefined') {
          obj2[p] = obj1[p];
        }
      } catch (e) {
        // Property in destination object not set; create it and set its value.
        if (typeof obj2[p] === 'undefined') {
          obj2[p] = obj1[p];
        }
      }
    }
    return obj2;
  }

  function processPatternIterative(file, patternlab) {
    var fs = require('fs-extra'),
      of = require('./object_factory'),
      path = require('path');

    //extract some information
    var subdir = path.dirname(path.relative(patternlab.config.paths.source.patterns, file)).replace('\\', '/');
    var filename = path.basename(file);
    var ext = path.extname(filename);

    //ignore dotfiles, underscored files, and non-variant .json files
    if (filename.charAt(0) === '.' || (ext === '.json' && filename.indexOf('~') === -1)) {
      return;
    }

    //make a new Pattern Object
    var currentPattern = new of.oPattern(file, subdir, filename);

    //if file is named in the syntax for variants, no need to process further
    //processPatternRecursive() will run find_pseudopatterns() and look at each pattern for a variant
    if (ext === '.json' && filename.indexOf('~') > -1) {
      return;
    }

    //can ignore all non-mustache files at this point
    if (ext !== '.mustache') {
      return;
    }

    //see if this file has a state
    setState(currentPattern, patternlab);

    //look for a json file for this template
    var globalData = patternlab.data;
    try {
      var jsonFilename = path.resolve(patternlab.config.paths.source.patterns, currentPattern.subdir, currentPattern.fileName + ".json");
      var localData = fs.readJSONSync(jsonFilename);
      currentPattern.jsonFileData = mergeData(globalData, localData);
      if (patternlab.config.debug) {
        console.log('found pattern-specific data.json for ' + currentPattern.key);
      }
    }
    catch (error) {
      currentPattern.jsonFileData = globalData;
    }
    currentPattern.dataKeys = getDataKeys(currentPattern.jsonFileData);

    //look for a listitems.json file for this template
    try {
      var listJsonFileName = path.resolve(patternlab.config.paths.source.patterns, currentPattern.subdir, currentPattern.fileName + ".listitems.json");
      currentPattern.listitems = fs.readJSONSync(listJsonFileName);
      buildListItems(currentPattern);
      if (patternlab.config.debug) {
        console.log('found pattern-specific listitems.json for ' + currentPattern.key);
      }
    }
    catch (err) {
      // do nothing
    }

    //add the raw template to memory
    currentPattern.template = fs.readFileSync(file, 'utf8');

    //do the same with extendedTemplate to avoid undefined type errors
    currentPattern.extendedTemplate = currentPattern.template;

    //do the same with tmpTemplate to avoid undefined type errors
    currentPattern.tmpTemplate = currentPattern.template;

    //find any stylemodifiers that may be in the current pattern
    currentPattern.stylePartials = findPartialsWithStyleModifiers(currentPattern);

    //add currentPattern to patternlab.patterns array
    addPattern(currentPattern, patternlab);
  }

  /**
   * Recurse through patternlab object as necessitated by partial inclusions.
   * Build out the final output for writing to the public/patterns directory.
   *
   * @param {string} file The abspath of pattern being processed.
   * @param {object} patternlab The patternlab object.
   * @param {number} recursionLevel Top level === 0. Increments by 1 after that.
   */
  function processPatternRecursive(file, patternlab, recursionLevel) {
console.log(file);
if (file.indexOf('01-molecules/components/user-menu.mustache') > -1) {
  /*
console.log('RECURSION LEVEL: ' + recursionLevel);
//  console.log(currentPattern.jsonFileData);
//  console.log(getDataKeys(currentPattern.jsonFileData));
console.log('currentPattern.tmpTemplate size: ' + currentPattern.tmpTemplate.length + 'B');
console.log(currentPattern.tmpTemplate);
console.log('currentPattern.extendedTemplate');
console.log(currentPattern.extendedTemplate);
//  console.log('getDataKeys(currentPattern.jsonFileData)');
//  console.log(currentPattern.dataKeys);
*/
}
    var lh = require('./lineage_hunter'),
      ph = require('./parameter_hunter'),
      pph = require('./pseudopattern_hunter'),
      lih = require('./list_item_hunter'),
      smh = require('./style_modifier_hunter');

    var parameter_hunter = new ph(),
      lineage_hunter = new lh(),
      list_item_hunter = new lih(),
      style_modifier_hunter = new smh(),
      pseudopattern_hunter = new pph();

    var i; // for the for loops

    //find current pattern in patternlab object using var file as a key
    var currentPattern = getpatternbykey(file, patternlab);
if (file.indexOf('04-pages/00-homepage.mustache') > -1) {
//  console.log(file);
}

    //return if processing an ignored file
    if (currentPattern === null || typeof currentPattern.tmpTemplate === 'undefined') {
      return;
    }

    //find any listItem blocks
    list_item_hunter.process_list_item_partials(currentPattern, patternlab);

    //render the template, excepting for partial includes, using jsonFileData
if (typeof currentPattern.dataKeys === 'undefined') {
console.log(typeof currentPattern.jsonFileData);
  console.log('UNDEFINED');
}
if (currentPattern.abspath.indexOf('01-molecules/components/user-menu.mustache') > -1) {
console.log('RECURSION LEVEL: ' + recursionLevel);
//  console.log(currentPattern.jsonFileData);
//  console.log(getDataKeys(currentPattern.jsonFileData));
console.log('currentPattern.tmpTemplate before: ' + currentPattern.tmpTemplate.length + 'B');
console.log(currentPattern.tmpTemplate);
//  console.log('getDataKeys(currentPattern.jsonFileData)');
//  console.log(currentPattern.dataKeys);
}
    currentPattern.tmpTemplate = escapeRenderUnescape(currentPattern);
    var tmpTemplate = escapeRenderUnescape(currentPattern);
if (currentPattern.abspath.indexOf('01-molecules/components/user-menu.mustache') > -1) {
//  console.log(currentPattern.jsonFileData);
//  console.log(getDataKeys(currentPattern.jsonFileData));
console.log('currentPattern.tmpTemplate after: ' + currentPattern.tmpTemplate.length + 'B');
console.log(currentPattern.tmpTemplate);
//  console.log('getDataKeys(currentPattern.jsonFileData)');
//  console.log(currentPattern.dataKeys);
}

    var parameteredPartials = findPartialsWithPatternParameters(tmpTemplate);

    //if the template contains any pattern parameters
    if (parameteredPartials && parameteredPartials.length) {
      if (patternlab.config.debug) {
        console.log('found parametered partials for ' + currentPattern.key);
      }
if (currentPattern.abspath.indexOf('04-pages/00-homepage.mustache') > -1) {
  /*
console.log('RECURSION LEVEL: ' + recursionLevel);
console.log('parameteredPartials before');
console.log(parameteredPartials);
console.log('currentPattern.tmpTemplate size: ' + currentPattern.tmpTemplate.length + 'B');
console.log(currentPattern.tmpTemplate);
//console.log('tmpTemplate');
//console.log(tmpTemplate);
*/
}

      //first, iterate through parameteredPartials and reset tmpTemplate for each
//      parameter_hunter.reset_tmp_templates(parameteredPartials, patternlab);

      //recursively render currentPattern.tmpTemplate via parameter_hunter.find_parameters()
      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
if (currentPattern.abspath.indexOf('04-pages/00-homepage.mustache') > -1) {
  /*
console.log('parameteredPartials after');
console.log(parameteredPartials);
console.log('currentPattern.tmpTemplate size: ' + currentPattern.tmpTemplate.length + 'B');
console.log(currentPattern.tmpTemplate);
//console.log('tmpTemplate');
//console.log(tmpTemplate);
*/
}

      //recurse, going a level deeper, with each render eliminating nested parameteredPartials
      //when there are no more nested parameteredPartials, we'll pop back up
      processPatternRecursive(currentPattern.abspath, patternlab, recursionLevel + 1);

      tmpTemplate = escapeRenderUnescapePartials(currentPattern.tmpTemplate, currentPattern.jsonFileData);
    }

tmpTemplate = tmpTemplate.replace(/^$\n/gm, '');
    var foundPatternPartials = findPartials(tmpTemplate);

    //since we're done with tmpTemplate, free it from memory
    tmpTemplate = '';

    //recurse through non-parametered partials
    if (foundPatternPartials && foundPatternPartials.length) {
      if (patternlab.config.debug) {
        console.log('found partials for ' + currentPattern.key);
      }

if (currentPattern.abspath.indexOf('04-pages/00-homepage.mustache') > -1) {
  /*
console.log('RECURSION LEVEL: ' + recursionLevel);
console.log('foundPatternPartials before');
console.log(foundPatternPartials);
console.log('currentPattern.tmpTemplate size: ' + currentPattern.tmpTemplate.length + 'B');
console.log(currentPattern.tmpTemplate);
//console.log('tmpTemplate size: ' + tmpTemplate.length + 'B');
//console.log(tmpTemplate);
*/
}
      for (i = 0; i < foundPatternPartials.length; i++) {
        var partialKey = foundPatternPartials[i].replace(/{{>([ ])?([\w\-\.\/~]+)(:[A-z0-9-_|]+)?(?:\:[A-Za-z0-9-_]+)?(?:(| )\([^\)]*\))?([ ])?}}/g, '$2');

        //identify which pattern this partial corresponds to
        var partialPattern = getpatternbykey(partialKey, patternlab);

        if (partialPattern === null) {
          throw 'Could not find pattern with key ' + partialKey;
        } else {

          //replace each partial tag with the partial's template.
          //escape regex special characters as per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
          var escapedPartial = foundPatternPartials[i].replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
          var regex = new RegExp(escapedPartial, 'g');

//console.log(currentPattern.abspath);
if (currentPattern.abspath.indexOf('01-molecules/sections/title-synopsis.mustache') > -1) {
//  console.log(regex);
}
          currentPattern.tmpTemplate = currentPattern.tmpTemplate.replace(regex, partialPattern.template);
currentPattern.tmpTemplate = currentPattern.tmpTemplate.replace(/^$\n/gm, '');
//tmpTemplate = tmpTemplate.replace(regex, partialPattern.tmpTemplate);
//tmpTemplate = tmpTemplate.replace(/^$\n/gm, '');
        }
      }
if (currentPattern.abspath.indexOf('04-pages/00-homepage.mustache') > -1) {

  /*
console.log('foundPatternPartials after');
console.log(foundPatternPartials);
console.log('currentPattern.tmpTemplate size: ' + currentPattern.tmpTemplate.length + 'B');
console.log(currentPattern.tmpTemplate);
//console.log('tmpTemplate size: ' + tmpTemplate.length + 'B');
//console.log(tmpTemplate);
*/
}

      //recurse, going a level deeper, with each render eliminating nested partials
      //when there are no more nested partials, we'll pop back up
      processPatternRecursive(currentPattern.abspath, patternlab, recursionLevel + 1);
if (currentPattern.abspath.indexOf('01-molecules/sections/title-synopsis.mustache') > -1) {
  /*
console.log('currentPattern.tmpTemplate');
console.log(currentPattern.tmpTemplate);
*/
}
    }

//if (currentPattern.abspath.indexOf('04-pages/00-homepage.mustache') > -1) {
//if (currentPattern.abspath.indexOf('04-pages/00-homepage.mustache') > -1) {
    //do only at the end of the top level of recursion
    if (recursionLevel === 0) {

      //if partial has style modifier data, replace the styleModifier value
      if (currentPattern.stylePartials && currentPattern.stylePartials.length) {
        style_modifier_hunter.consume_style_modifier(partialPattern, foundPatternPartials[i], patternlab);
      }

      currentPattern.extendedTemplate = renderPattern(currentPattern.tmpTemplate, currentPattern.jsonFileData);
//if (currentPattern.abspath.indexOf('04-pages/00-homepage.mustache') > -1) {
if (currentPattern.abspath.indexOf('01-molecules/components/user-menu.mustache') > -1) {
  /*
//  console.log(currentPattern.jsonFileData);
//  console.log(getDataKeys(currentPattern.jsonFileData));
console.log('currentPattern.tmpTemplate size: ' + currentPattern.tmpTemplate.length + 'B');
console.log(currentPattern.tmpTemplate);
console.log('currentPattern.extendedTemplate');
console.log(currentPattern.extendedTemplate);
*/
}

      //find any listItem blocks that within the pattern, even if there are no partials
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //find pattern lineage
      lineage_hunter.find_lineage(currentPattern, patternlab);

      //look for a pseudo pattern by checking if there is a file containing same name, with ~ in it, ending in .json
      pseudopattern_hunter.find_pseudopatterns(currentPattern, patternlab);

      //since we're done with currentPattern.tmpTemplate, free it from memory
      currentPattern.tmpTemplate = '';
    }
  }

  function parseDataLinksHelper(patternlab, obj, key) {
    var linkRE, dataObjAsString, linkMatches, expandedLink;

    linkRE = /link\.[A-z0-9-_]+/g;
    dataObjAsString = JSON.stringify(obj);
    linkMatches = dataObjAsString.match(linkRE);

    if (linkMatches) {
      for (var i = 0; i < linkMatches.length; i++) {
        expandedLink = patternlab.data.link[linkMatches[i].split('.')[1]];
        if (expandedLink) {
          if (patternlab.config.debug) {
            console.log('expanded data link from ' + linkMatches[i] + ' to ' + expandedLink + ' inside ' + key);
          }
          dataObjAsString = dataObjAsString.replace(linkMatches[i], expandedLink);
        }
      }
    }
    return JSON.parse(dataObjAsString);
  }

  //look for pattern links included in data files.
  //these will be in the form of link.* WITHOUT {{}}, which would still be there from direct pattern inclusion
  function parseDataLinks(patternlab) {
    //look for link.* such as link.pages-blog as a value

    patternlab.data = parseDataLinksHelper(patternlab, patternlab.data, 'data.json');

    //loop through all patterns
    for (var i = 0; i < patternlab.patterns.length; i++) {
      patternlab.patterns[i].jsonFileData = parseDataLinksHelper(patternlab, patternlab.patterns[i].jsonFileData, patternlab.patterns[i].key);
    }
  }

  return {
    find_pattern_partials: function (pattern) {
      return findPartials(pattern);
    },
    find_pattern_partials_with_style_modifiers: function (pattern) {
      return findPartialsWithStyleModifiers(pattern);
    },
    find_pattern_partials_with_parameters: function (pattern) {
      return findPartialsWithPatternParameters(pattern);
    },
    find_list_items: function (pattern) {
      return findListItems(pattern);
    },
    setPatternState: function (pattern, patternlab) {
      setState(pattern, patternlab);
    },
    addPattern: function (pattern, patternlab) {
      addPattern(pattern, patternlab);
    },
    renderPattern: function (template, data, partials) {
      return renderPattern(template, data, partials);
    },
    combine_listItems: function (patternlab) {
      buildListItems(patternlab);
    },
    escape_render_unescape_partials: function (extendedTemplate, data) {
      return escapeRenderUnescapePartials(extendedTemplate, data);
    },
    get_pattern_by_key: function (key, patternlab) {
      return getpatternbykey(key, patternlab);
    },
    merge_data: function (existingData, newData) {
      return mergeData(existingData, newData);
    },
    process_pattern_iterative: function (file, patternlab) {
      processPatternIterative(file, patternlab);
    },
    process_pattern_recursive: function (file, patternlab, recursionLevel) {
      processPatternRecursive(file, patternlab, recursionLevel);
    },
    parse_data_links: function (patternlab) {
      parseDataLinks(patternlab);
    }
  };

};

module.exports = pattern_assembler;
