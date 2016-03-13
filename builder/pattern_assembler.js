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
    var hogan = require('hogan');
    var compiled = hogan.compile(template);

    if (partials) {
      return compiled.render(data, partials);
    } else {
      return compiled.render(data);
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
   * Recursively get all the property keys from the JSON data for a pattern.
   *
   * @param {object} data
   * @param {array} uniqueKeys The array of unique keys to be added to and returned.
   * @returns {array} keys A flat, one-dimensional array.
   */
  function getDataKeys(data, uniqueKeys) {
    var keys;

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        if (!(typeof data === 'object' && data instanceof Array)) {
          if (uniqueKeys.indexOf(key) === -1) {
            uniqueKeys.push(key);
          } else {
            continue;
          }
        }
        if (typeof data[key] === 'object') {
          getDataKeys(data[key], uniqueKeys);
        }
      }
    }

    return uniqueKeys;
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
    obj2 = obj2 || {}; //eslint-disable-line no-param-reassign
if (obj1.hasOwnProperty('1')) {
  console.log('listitems mergeData');
  console.log(obj2);
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

  function outputPatternToFS(pattern, patternlab) {
    var fs = require('fs-extra');
    var he = require('html-entities').AllHtmlEntities;
    var entity_encoder = new he();
    var paths = patternlab.config.paths;
    var patternFooter;

    pattern.jsonFileData = parseDataLinksHelper(patternlab, pattern.jsonFileData, pattern.key);

var begin = Date.now() / 1000;
if (pattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
console.log(pattern.abspath);
console.log('RENDER BEGIN: ' + begin);
console.log('pattern.extendedTemplate: ' + pattern.extendedTemplate.length + 'B');
//console.log(pattern.extendedTemplate);
console.log('pattern.jsonFileData: ' + JSON.stringify(pattern.jsonFileData).length + 'B');
}
    //render the extendedTemplate with all data
    pattern.patternPartial = renderPattern(pattern.extendedTemplate, pattern.jsonFileData);
var processEnd = Date.now() / 1000;
if (pattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
console.log('RENDER END: ' + processEnd);
console.log('RENDER TIME: ' + (processEnd - begin));
}

    //add footer info before writing
    patternFooter = renderPattern(patternlab.footer, pattern);

    //write the compiled template to the public patterns directory
    fs.outputFileSync(paths.public.patterns + pattern.patternLink, patternlab.header + pattern.patternPartial + patternFooter);

    //write the mustache file too
    fs.outputFileSync(paths.public.patterns + pattern.patternLink.replace('.html', '.mustache'), entity_encoder.encode(pattern.template));

    //write the encoded version too
    fs.outputFileSync(paths.public.patterns + pattern.patternLink.replace('.html', '.escaped.html'), entity_encoder.encode(pattern.patternPartial));

    //since we're done with these pattern properties, free them from memory
    pattern.extendedTemplate = '';
    pattern.tmpTemplate = '';
    pattern.dataKeys = null;
    pattern.listitems = null;

    if (pattern.jsonFileData !== patternlab.data) {
      pattern.jsonFileData = null;
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
  function winnowUnusedTags(template, pattern) {
    var escapedKey;
    var regex;
    var templateEscaped = template;

    //escaped all tags that match keys in the JSON data.
    for (var i = 0; i < pattern.dataKeys.length; i++) {
      escapedKey = pattern.dataKeys[i].replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
      regex = new RegExp('\\{\\{([\\{#\\^\\/&]?(\\s*|[^\\}]*\\.)' + escapedKey + '\\s*\\}?)\\}\\}', 'g');
      templateEscaped = templateEscaped.replace(regex, '<%$1%>');
    }

    //escape partial tags by switching them to ERB syntax.
    templateEscaped = templateEscaped.replace(/\{\{>([^\}]+)\}\}/g, '<%>$1%>');

    //removing empty lines for some reason reduced rendering time considerably.
    templateEscaped = templateEscaped.replace(/^\s*$\n/gm, '');

    //render to winnow used tags.
    var templateRendered = renderPattern(templateEscaped, pattern.jsonFileData);

    //after that's done, switch only partial tags back to standard Mustache tags and return.
    templateRendered = templateRendered.replace(/<%>([^%]+)%>/g, '{{>$1}}');

    return templateRendered;
  }

  function processPatternIterative(file, patternlab) {
    var fs = require('fs-extra'),
      lh = require('./lineage_hunter'),
      lineage_hunter = new lh(),
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

    //see if this file has a state
    setState(currentPattern, patternlab);

    //if file is named in the syntax for variants, add the variant data to memory.
    //processPatternRecursive() will run find_pseudopatterns() to render with the variant data.
    if (ext === '.json' && filename.indexOf('~') > -1) {
      try {
        currentPattern.patternName = currentPattern.patternName.replace('~', '-');
        currentPattern.jsonFileData = fs.readJSONSync(file);
        addPattern(currentPattern, patternlab);
      }
      catch (err) {
        // do nothing
      }
      return;
    }

    //can ignore all non-mustache files at this point
    if (ext !== '.mustache') {
      return;
    }

    //add the raw template to memory
    currentPattern.template = fs.readFileSync(file, 'utf8');

    //define tmpTemplate and listitems to avoid undefined type errors
    //trying to keep memory footprint small, so set it empty at first
    currentPattern.tmpTemplate = '';
    currentPattern.listitems = null;

    //do the same with extendedTemplate
    //skip this on underscore prefixed files, as they don't use extendedTemplate
    //and since it will need to skip in processPatternRecursive
    if (filename.charAt(0) !== '_') {
      currentPattern.extendedTemplate = '';
    }

    //find pattern lineage
    //TODO: consider repurposing lineage hunter. it currently only works at the
    //iterative level, and isn't called upon any further. however, it could be
    //repurposed to target and render only those files affected by a template edit.
    //this could bring an enormous performance improvement on large projects.
    lineage_hunter.find_lineage(currentPattern, patternlab);

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
   * @param {object} currentPattern Only submitted on recursionLevel > 0.
   */
  function processPatternRecursive(file, patternlab, recursionLevel, currentPattern) {
    var fs = require('fs-extra'),
      glob = require('glob'),
      path = require('path');

    var ph = require('./parameter_hunter'),
      pph = require('./pseudopattern_hunter'),
      lih = require('./list_item_hunter'),
      smh = require('./style_modifier_hunter');

    var parameter_hunter = new ph(),
      list_item_hunter = new lih(),
      style_modifier_hunter = new smh(),
      pseudopattern_hunter = new pph();

    var i; // for the for loops
    var paths = patternlab.config.paths;

var processBegin = Date.now() / 1000;
var processEnd;
    if (recursionLevel === 0) {
processBegin = Date.now() / 1000;
//console.log(file);
if (file.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
console.log(file);
console.log('PROCESS START: ' + processBegin);
}

      //find current pattern in patternlab object using var file as a key
      currentPattern = getpatternbykey(file, patternlab);

      //return if processing an ignored file
      if (!currentPattern || typeof currentPattern.extendedTemplate === 'undefined') {
        return;
      }
console.log(file);

      //output .json pseudoPattern variants to the file system and return.
      //diveSync should process these variants after their originals, given that
      //tildes come after periods in ASCII order. as such, their extendedTemplates
      //should be filled out and renderable.
      if (path.extname(file) === '.json') {
        outputPatternToFS(currentPattern, patternlab);
        return;
      }

      //continue with regular mustache templates    
      //look for a json file for this template
      var globalData = patternlab.data;
      var jsonFilename;
      var localJsonString;
      //allData will get overwritten by mergeData, so keep it scoped to this function.
      var allData = null;

      try {

        //check if there is json data local to this pattern
        jsonFilename = file.substr(0, file.lastIndexOf('.')) + '.json';

        //if so, load it into memory as a string (to create 2 non-referencing objects).
        localJsonString = fs.readFileSync(jsonFilename);

        if (patternlab.config.debug) {
          console.log('found pattern-specific data.json for ' + currentPattern.key);
        }
      }
      catch (err) {

        //do nothing
      }

      //set currentPattern.jsonFileData
      if (localJsonString) {
        try {
          allData = mergeData(patternlab.data, JSON.parse(localJsonString));
          currentPattern.jsonFileData = mergeData(patternlab.data, JSON.parse(localJsonString));
        }
        catch (err) {

          //since we're parsing json, output errors for debugging
          console.log(err);
        }

      //if this pattern doesn't have a local .json file, save
      //CPU steps by just creating a reference to the patternlab.data object.
      } else {
        currentPattern.jsonFileData = patternlab.data;
      }

      var needle = currentPattern.subdir + '/' + currentPattern.fileName + '~*.json';
      var pseudoPatternFiles = glob.sync(needle, {
        cwd: paths.source.patterns,
        debug: false,
        nodir: true
      });
      var pseudoPatternsArray = [];
      var pseudoPattern;
if (currentPattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
console.log('AFTER GLOB: ' + ((Date.now() / 1000) - processBegin));
}

      if (pseudoPatternFiles.length) {
        mergeData(patternlab.data, allData);

        for (i = 0; i < pseudoPatternFiles.length; i++) {
          pseudoPattern = getpatternbykey(path.resolve(paths.source.patterns, pseudoPatternFiles[i]), patternlab);
          if (pseudoPattern) {
            pseudoPatternsArray.push(pseudoPattern);

            //update the allData object.
            //pseudoPattern.jsonFileData set in processPatternIterative.
            mergeData(pseudoPattern.jsonFileData, allData);
          }
        }


      //get data keys for patternlab data, currentPattern data, and pseudoPattern data.
      //mergeData() overwrites the 2nd param, so we don't need assignment statements
if (currentPattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
console.log('BEFORE FIRST MERGEDATA: ' + ((Date.now() / 1000) - processBegin));
}
      //if this pattern doesn't have pseudoPatterns or a local .json file, save
      //CPU steps by just creating a reference to the patternlab.data object.
      } else if (!localJsonString) {
        allData = patternlab.data;
      }

      //look for a listitems.json file for this template
      var localListItemsString;
      try {
        var listJsonFileName = path.resolve(patternlab.config.paths.source.patterns, currentPattern.subdir, currentPattern.fileName + '.listitems.json');
  //      localListItemsString = fs.readFileSync(listJsonFileName);
        currentPattern.listitems = fs.readJSONsync(listJsonFileName);

        if (patternlab.config.debug) {
          console.log('found pattern-specific listitems.json for ' + currentPattern.key);
        }
      }
      catch (err) {
        //do nothing
      }


if (currentPattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
console.log('AFTER FIRST MERGEDATA: ' + ((Date.now() / 1000) - processBegin));
}

if (currentPattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
console.log('AFTER SECOND MERGEDATA: ' + ((Date.now() / 1000) - processBegin));
}
var alldataBegin = Date.now() / 1000;
if (currentPattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
console.log('DATA SIZE: ' + JSON.stringify(allData).length + 'B');
console.log('DATA PREPARE BEGIN: ' + alldataBegin);
}

      //add allData keys to currentPattern.dataKeys
      currentPattern.dataKeys = getDataKeys(allData, []);
if (currentPattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
console.log('AFTER GETDATAKEYS: ' + ((Date.now() / 1000) - alldataBegin));
}

      //add listitem iteration keys to currentPattern.dataKeys
      currentPattern.dataKeys = currentPattern.dataKeys.concat(list_item_hunter.get_list_item_iteration_keys());
if (currentPattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
console.log('AFTER FIRST DATAKEYS CONCAT: ' + ((Date.now() / 1000) - alldataBegin));
}

      //add merged listitem keys to currentPattern.dataKeys
      if (currentPattern.listitems) {
        currentPattern.dataKeys = currentPattern.dataKeys.concat(getDataKeys(currentPattern.listitems, currentPattern.dataKeys));
  if (currentPattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
  console.log('AFTER SECOND DATAKEYS CONCAT: ' + ((Date.now() / 1000) - alldataBegin));
  }
      }

      //copy winnowed template to extendedTemplate
      currentPattern.extendedTemplate = winnowUnusedTags(currentPattern.template, currentPattern);
processEnd = Date.now() / 1000;
if (currentPattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
console.log('DATA PREPARE END: ' + processEnd);
console.log('DATA PREPARE TIME: ' + (processEnd - alldataBegin));
}
    }

    //find parametered partials
    var parameteredPartials = findPartialsWithPatternParameters(currentPattern.extendedTemplate);
if (currentPattern.abspath.indexOf('00-atoms/00-meta/_00-head.mustache') > -1) {
  console.log('RECURSION LEVEL: ' + recursionLevel);
  console.log('TIME: ' + (Date.now() / 1000));
}

    //if the template contains any pattern parameters, recurse through them
    if (parameteredPartials && parameteredPartials.length) {
      if (patternlab.config.debug) {
        console.log('found parametered partials for ' + currentPattern.key);
      }

      //recursively render currentPattern.extendedTemplate via parameter_hunter.find_parameters()
      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);

      //recurse, going a level deeper, with each render eliminating nested parameteredPartials
      //when there are no more nested parameteredPartials, we'll pop back up
      processPatternRecursive(currentPattern.abspath, patternlab, recursionLevel + 1, currentPattern);
    }

    //find non-parametered partials.
    var foundPatternPartials = findPartials(currentPattern.extendedTemplate);
//foundPatternPartials = null;
    var uniquePartials = [];

    //recurse through non-parametered partials
    if (foundPatternPartials && foundPatternPartials.length) {
      if (patternlab.config.debug) {
        console.log('found partials for ' + currentPattern.key);
      }

      for (i = 0; i < foundPatternPartials.length; i++) {

        //limit iteration to one time per partial. eliminate duplicates.
        if (uniquePartials.indexOf(foundPatternPartials[i]) === -1) {
          uniquePartials.push(foundPatternPartials[i]);
        } else {
          continue;
        }

        var partialKey = foundPatternPartials[i].replace(/{{>([ ])?([\w\-\.\/~]+)(:[A-z0-9-_|]+)?(?:\:[A-Za-z0-9-_]+)?(?:(| )\([^\)]*\))?([ ])?}}/g, '$2');

        //identify which pattern this partial corresponds to
        var partialPattern = getpatternbykey(partialKey, patternlab);

        if (!partialPattern) {
          throw 'Could not find pattern with key ' + partialKey;
        } else {
          partialPattern.tmpTemplate = partialPattern.template;

          //if the current tag has styleModifier data, replace the styleModifier value in the partial
          if (findPartialsWithStyleModifiers(foundPatternPartials[i])) {
            style_modifier_hunter.consume_style_modifier(partialPattern, foundPatternPartials[i], patternlab);
          }

          var winnowedPartial = winnowUnusedTags(partialPattern.tmpTemplate, currentPattern);

          //replace each partial tag with the partial's template.
          //escape regex special characters as per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
          var escapedPartial = foundPatternPartials[i].replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
          var regex = new RegExp(escapedPartial, 'g');

          currentPattern.extendedTemplate = currentPattern.extendedTemplate.replace(regex, winnowedPartial);
          partialPattern.tmpTemplate = '';
        }
      }

      //recurse, going a level deeper, with each render eliminating nested partials
      //when there are no more nested partials, we'll pop back up
      processPatternRecursive(currentPattern.abspath, patternlab, recursionLevel + 1, currentPattern);
    }

    //do only when popped back to the top level of recursion
    if (recursionLevel === 0) {

      //switched ERB escaped tags back to standard Mustache tags
      currentPattern.extendedTemplate = currentPattern.extendedTemplate.replace(/<%([^%]+)%>/g, '{{$1}}');

      //find and process any listItem blocks within the pattern
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //look through pseudoPatternsArray again, and update their patternlab objects
      if (pseudoPatternsArray.length) {
        pseudopattern_hunter.find_pseudopatterns(currentPattern, patternlab, pseudoPatternsArray);
      }

      //output rendered pattern to the file system
      outputPatternToFS(currentPattern, patternlab);
processEnd = Date.now() / 1000;
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
    get_data_keys: function (data, uniqueKeys) {
      return getDataKeys(data, uniqueKeys);
    },
    get_pattern_by_key: function (key, patternlab) {
      return getpatternbykey(key, patternlab);
    },
    merge_data: function (existingData, newData) {
      return mergeData(existingData, newData);
    },
    winnow_unused_tags: function (template, pattern) {
      return winnowUnusedTags(template, pattern);
    },
    process_pattern_iterative: function (file, patternlab) {
      processPatternIterative(file, patternlab);
    },
    process_pattern_recursive: function (file, patternlab, recursionLevel) {
      processPatternRecursive(file, patternlab, recursionLevel);
    },
    parse_data_links_helper: function (patternlab, obj, key) {
      return parseDataLinksHelper(patternlab, obj, key);
    },
    parse_data_links: function (patternlab) {
      parseDataLinks(patternlab);
    }
  };

};

module.exports = pattern_assembler;
