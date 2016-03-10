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
  function winnowUnusedTags(template, pattern) {
    var escapedKey;
    var regex;
    var templateEscaped = template;

    //escaped all tags that match keys in the JSON data.
    for (var i = 0; i < pattern.dataKeys.length; i++) {
      escapedKey = pattern.dataKeys[i].replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
      regex = new RegExp('\\{\\{([\\{#\\^\\/&]?[^\\}]*' + escapedKey + '[^\\}]*\\}?)\\}\\}', 'g');
      templateEscaped = templateEscaped.replace(regex, '<%$1%>');
    }

    //escape partial tags by switching them to ERB syntax.
    templateEscaped = templateEscaped.replace(/\{\{>([^\}]+)\}\}/g, '<%>$1%>');

    //render to winnow used tags.
    var templateRendered = renderPattern(templateEscaped, pattern.jsonFileData);

    //after that's done, switch only partial tags back to standard Mustache tags and return.
    templateRendered = templateRendered.replace(/<%>([^%]+)%>/g, '{{>$1}}');

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
    obj2 = obj2 || {}; //eslint-disable-line no-param-reassign

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

    //if file is named in the syntax for variants, add the variant data to memory.
    //processPatternRecursive() will run find_pseudopatterns() to render with the variant data.
    if (ext === '.json' && filename.indexOf('~') > -1) {
      try {
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

    //see if this file has a state
    setState(currentPattern, patternlab);

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
    //trying to keep memory footprint small, so set it to empty string at first
    currentPattern.extendedTemplate = '';

    //do the same with tmpTemplate
    currentPattern.tmpTemplate = '';

    //find pattern lineage
    //TODO: consider removing the lineage hunter. it only works at the
    //iterative level, and isn't called upon any further. we need to keep the
    //patternlab object as light as possible.
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
      he = require('html-entities').AllHtmlEntities,
      path = require('path');

    var ph = require('./parameter_hunter'),
      pph = require('./pseudopattern_hunter'),
      lih = require('./list_item_hunter'),
      smh = require('./style_modifier_hunter');

    var parameter_hunter = new ph(),
      entity_encoder = new he(),
      list_item_hunter = new lih(),
      style_modifier_hunter = new smh(),
      pseudopattern_hunter = new pph();

    var i; // for the for loops
    var paths = patternlab.config.paths;
    var patternFooter;

var processBegin;
var processEnd;
    if (recursionLevel === 0) {

      //find current pattern in patternlab object using var file as a key
      currentPattern = getpatternbykey(file, patternlab);

      //return if processing an ignored file
      if (!currentPattern || typeof currentPattern.extendedTemplate === 'undefined') {
        return;
      }

      //output .json variant files and return
      //these variants should occur after their primaries, given that tildes come
      //after periods in ASCII order. as such, their extendedTemplates should be
      //filled out and renderable.
      if (path.extname(file) === '.json') {
        currentPattern.jsonFileData = parseDataLinksHelper(patternlab, currentPattern.jsonFileData, currentPattern.key);

        //render the extendedTemplate with all data
        currentPattern.extendedTemplate = renderPattern(currentPattern.extendedTemplate, currentPattern.jsonFileData);

        //add footer info before writing
        patternFooter = renderPattern(patternlab.footer, currentPattern);
if (currentPattern.abspath.indexOf('00-homepage') > -1) {
  console.log(patternFooter);
}

        //write the compiled template to the public patterns directory
        fs.outputFileSync(paths.public.patterns + currentPattern.patternLink, patternlab.header + currentPattern.extendedTemplate + patternFooter);

        //write the mustache file too
        fs.outputFileSync(paths.public.patterns + currentPattern.patternLink.replace('.html', '.mustache'), entity_encoder.encode(currentPattern.template));

        //write the encoded version too
        fs.outputFileSync(paths.public.patterns + currentPattern.patternLink.replace('.html', '.escaped.html'), entity_encoder.encode(currentPattern.extendedTemplate));

        return;
      }

      //continue with regular mustache templates    
      //look for a json file for this template
      var globalData = patternlab.data;
      var jsonFilename;
      var jsonString;
      //allData will get overwritten by mergeData, so keep it scoped to this function.
      var allData = null;

      //get json data local to this pattern
      try {
        jsonFilename = file.substr(0, file.lastIndexOf('.')) + '.json';
        jsonString = fs.readFileSync(jsonFilename);

        //since mergeData will overwrite its 2nd param, we need to keep allData
        //and currentPattern.jsonFileData distinct.
        allData = JSON.parse(jsonString);
        currentPattern.jsonFileData = JSON.parse(jsonString);

        if (patternlab.config.debug) {
          console.log('found pattern-specific data.json for ' + currentPattern.key);
        }
      }
      catch (error) {
        //do nothing
      }

      //get data keys for globalData, currentPattern data, and pseudoPattern data.
      //mergeData() overwrites the 2nd param, so we don't need assignment statements
      mergeData(globalData, allData);
      mergeData(globalData, currentPattern.jsonFileData);
      var needle = currentPattern.subdir + '/' + currentPattern.fileName + '~*.json';
      var pseudoPatternFiles = glob.sync(needle, {
        cwd: paths.source.patterns,
        debug: false,
        nodir: true
      });
      var pseudoPatternsArray = [];
      var pseudoPattern;

      if (pseudoPatternFiles.length) {
        for (i = 0; i < pseudoPatternFiles.length; i++) {
          pseudoPattern = getpatternbykey(path.resolve(paths.source.patterns, pseudoPatternFiles[i]), patternlab);
          if (pseudoPattern) {
            pseudoPatternsArray.push(pseudoPattern);

            //update the allData object.
            mergeData(pseudoPattern.jsonFileData, allData);
          }
        }
      }

      currentPattern.dataKeys = getDataKeys(allData);
      currentPattern.extendedTemplate = currentPattern.template;

      //find any listItem blocks within the pattern
      //do this before winnowing unused tags
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      currentPattern.extendedTemplate = winnowUnusedTags(currentPattern.extendedTemplate, currentPattern);

    }

    //find parametered partials
    var parameteredPartials = findPartialsWithPatternParameters(currentPattern.extendedTemplate);

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
    var uniquePartials = [];

    //recurse through non-parametered partials
    if (foundPatternPartials && foundPatternPartials.length) {
      if (patternlab.config.debug) {
        console.log('found partials for ' + currentPattern.key);
      }

      for (i = 0; i < foundPatternPartials.length; i++) {

        //limit iteration to one time per partial. eliminate duplicates.
        if (uniquePartials.indexOf(foundPatternPartials[i]) > -1) {
          continue;
        } else {
          uniquePartials.push(foundPatternPartials[i]);
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

          //find any listItem blocks within the partial
          //do this before winnowing unused tags within that partial
          list_item_hunter.process_list_item_partials(partialPattern, patternlab);

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

    //do only when popped to the top level of recursion
    if (recursionLevel === 0) {

      //switched ERB escaped tags back to standard Mustache tags
      currentPattern.extendedTemplate = currentPattern.extendedTemplate.replace(/<%([^%]+)%>/g, '{{$1}}');

      //look through pseudoPatternsArray again, and update their patternlab objects
      if (pseudoPatternsArray.length) {
        pseudopattern_hunter.find_pseudopatterns(currentPattern, patternlab, pseudoPatternsArray);
      }

      currentPattern.jsonFileData = parseDataLinksHelper(patternlab, currentPattern.jsonFileData, currentPattern.key);

      //render the extendedTemplate with all data
      currentPattern.extendedTemplate = renderPattern(currentPattern.extendedTemplate, currentPattern.jsonFileData);

      //add footer info before writing
      patternFooter = renderPattern(patternlab.footer, currentPattern);
if (currentPattern.abspath.indexOf('00-homepage') > -1) {
  console.log(patternFooter);
}

      //write the compiled template to the public patterns directory
      fs.outputFileSync(paths.public.patterns + currentPattern.patternLink, patternlab.header + currentPattern.extendedTemplate + patternFooter);

      //write the mustache file too
      fs.outputFileSync(paths.public.patterns + currentPattern.patternLink.replace('.html', '.mustache'), entity_encoder.encode(currentPattern.template));

      //write the encoded version too
      fs.outputFileSync(paths.public.patterns + currentPattern.patternLink.replace('.html', '.escaped.html'), entity_encoder.encode(currentPattern.extendedTemplate));

      //since we're done with currentPattern.tmpTemplate, free it from memory
      currentPattern.extendedTemplate = '';
      currentPattern.tmpTemplate = '';
      currentPattern.jsonFileData = null;
      currentPattern.dataKeys = null;

if (currentPattern.abspath.indexOf('02-organisms/02-comments/00-comment-thread.mustache') > -1) {
//console.log('DATA SIZE END: ' + JSON.stringify(currentPattern).length + 'B');
//processEnd = Date.now() / 1000;
//console.log('PROCESS END: ' + processEnd);
//console.log('PROCESS TIME: ' + (processEnd - processBegin));
}
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
//          if (patternlab.config.debug) {
            console.log('expanded data link from ' + linkMatches[i] + ' to ' + expandedLink + ' inside ' + key);
//          }
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
    winnow_unused_tags: function (template, pattern) {
      return winnowUnusedTags(template, pattern);
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
    parse_data_links_helper: function (patternlab, obj, key) {
      return parseDataLinksHelper(patternlab, obj, key);
    },
    parse_data_links: function (patternlab) {
      parseDataLinks(patternlab);
    }
  };

};

module.exports = pattern_assembler;
