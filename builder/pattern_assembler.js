/* 
 * patternlab-node - v1.1.1 - 2016 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

(function () {
  "use strict";

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

<<<<<<< bd5ff0ec5f8829aca7104a008fe810410db46897
    // returns any patterns that match {{> value(foo:"bar") }} or {{> value:mod(foo:"bar") }} within the pattern
    function findPartialsWithPatternParameters(pattern){
      var matches;
      if(typeof pattern === 'string'){
        matches = pattern.match(/{{>([ ])?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_|]+)?(?:(| )\(.*)+([ ])?}}/g);
      } else if(typeof pattern === 'object' && typeof pattern.template === 'string'){
        matches = pattern.template.match(/{{>([ ])?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_|]+)?(?:(| )\(.*)+([ ])?}}/g);
=======
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
>>>>>>> new recursion scheme - processPatternRecursive stays within pattern while recursing
      }
      return matches;
    }

<<<<<<< bd5ff0ec5f8829aca7104a008fe810410db46897
    //find and return any {{> template-name* }} within pattern
    function findPartials(pattern){
      var matches;
      if(typeof pattern === 'string'){
        matches = pattern.match(/{{>([ ])?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_|]+)?(?:(| )\(.*)?([ ])?}}/g);
      } else if(typeof pattern === 'object' && typeof pattern.template === 'string'){
        matches = pattern.template.match(/{{>([ ])?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_|]+)?(?:(| )\(.*)?([ ])?}}/g);
      }
      return matches;
=======
    //if the pattern is new, just push to the array
    if (isNew) {
      patternlab.patterns.push(pattern);
>>>>>>> new recursion scheme - processPatternRecursive stays within pattern while recursing
    }

    function findListItems(pattern){
      var matches = pattern.template.match(/({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g);
      return matches;
    }

    function setState(pattern, patternlab){
      if(patternlab.config.patternStates && patternlab.config.patternStates[pattern.patternName]){
        pattern.patternState = patternlab.config.patternStates[pattern.patternName];
      } else{
        pattern.patternState = "";
      }
    }

    function addPattern(pattern, patternlab){
      //add the link to the global object
      patternlab.data.link[pattern.patternGroup + '-' + pattern.patternName] = '/patterns/' + pattern.patternLink;

      //only push to array if the array doesn't contain this pattern
      var isNew = true;
      for(var i = 0; i < patternlab.patterns.length; i++){
        //so we need the identifier to be unique, which patterns[i].abspath is
        if(pattern.abspath === patternlab.patterns[i].abspath){
          //if abspath already exists, overwrite that element
          patternlab.patterns[i] = pattern;
          patternlab.partials[pattern.key] = pattern.extendedTemplate || pattern.template;
          isNew = false;
          break;
        }
      }
    }
  }

  /**
   * Render the extendedTemplate excluding partials. The reason for this is to
   * eliminate the unwanted recursion paths that would remain if irrelevant
   * conditional tags persisted.
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

    function renderPattern(template, data, partials) {

      var mustache = require('mustache');

      if(partials) {
        return mustache.render(template, data, partials);
      } else{
        return mustache.render(template, data);
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
      if(filename.charAt(0) === '.' || (ext === '.json' && filename.indexOf('~') === -1)){
        return;
      }

      //make a new Pattern Object
      var currentPattern = new of.oPattern(file, subdir, filename);

      //if file is named in the syntax for variants, no need to process further
      //processPatternRecursive() will run find_pseudopatterns() and look at each pattern for a variant
      if(ext === '.json' && filename.indexOf('~') > -1){
        return;
      }

      //can ignore all non-mustache files at this point
      if(ext !== '.mustache'){
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

      //look for a listitems.json file for this template
      try {
        var listJsonFileName = path.resolve(patternlab.config.paths.source.patterns, currentPattern.subdir,currentPattern.fileName + ".listitems.json");
        currentPattern.listitems = fs.readJSONSync(listJsonFileName);
        buildListItems(currentPattern);
        if(patternlab.config.debug){
          console.log('found pattern-specific listitems.json for ' + currentPattern.key);
        }
      }
      catch(e) {
      }

      //add the raw template to memory
      currentPattern.template = fs.readFileSync(file, 'utf8');

      //find any stylemodifiers that may be in the current pattern
      currentPattern.stylePartials = findPartialsWithStyleModifiers(currentPattern);

      //find any pattern parameters that may be in the current pattern
      currentPattern.parameteredPartials = findPartialsWithPatternParameters(currentPattern);

      //add currentPattern to patternlab.patterns array
      addPattern(currentPattern, patternlab);
    }

    //add the raw template to memory
    currentPattern.template = fs.readFileSync(file, 'utf8');

    //do the same with extendedTemplate to avoid undefined type errors
    currentPattern.extendedTemplate = currentPattern.template;

    //do the same with tmpTemplate to avoid undefined type errors
    currentPattern.tmpTemplate = currentPattern.template;

    //find any stylemodifiers that may be in the current pattern
    currentPattern.stylePartials = findPartialsWithStyleModifiers(currentPattern);

    //save parameteredPartials before render
//    currentPattern.parameteredPartials = findPartialsWithPatternParameters(currentPattern.extendedTemplate);

    //add currentPattern to patternlab.patterns array
    addPattern(currentPattern, patternlab);
  }

  /**
   * Recurse through patternlab object as necessitated by partial inclusions.
   * Build out the final output for writing to the public/patterns directory.
   *
   * @param {string} file The abspath of pattern being processed.
   * @param {object} patternlab The patternlab object.
   * @param {boolean} startRecurse True if and only if at top level of recursion.
   */
  function processPatternRecursive(file, patternlab, startRecurse) {
    var lh = require('./lineage_hunter'),
      ph = require('./parameter_hunter'),
      pph = require('./pseudopattern_hunter'),
      lih = require('./list_item_hunter'),
      smh = require('./style_modifier_hunter'),
      path = require('path');

      var parameter_hunter = new ph(),
      lineage_hunter = new lh(),
      list_item_hunter = new lih(),
      style_modifier_hunter = new smh(),
      pseudopattern_hunter = new pph();

    var i; // for the for loops

    //find current pattern in patternlab object using var file as a key
    var currentPattern = getpatternbykey(file, patternlab);
    var startPattern = getpatternbykey(file, patternlab);
    var startFile = file;

    //return if processing an ignored file
    if (currentPattern === null || typeof currentPattern.tmpTemplate === 'undefined') {
      return;
    }

    //render the template, excepting for partial includes, using the startRecurse's data
    currentPattern.tmpTemplate = escapeRenderUnescapePartials(currentPattern.tmpTemplate, startPattern.jsonFileData);

    var parameteredPartials = findPartialsWithPatternParameters(currentPattern.tmpTemplate);

/*
    if (foundPatternPartials && foundPatternPartials.length > 0) {
      if (patternlab.config.debug) {
        console.log('found partials for ' + currentPattern.key);
      }
*/

      //find how many partials there may be for the given pattern
      var foundPatternPartials = findPartials(currentPattern);

//      var foundPatternPartials2 = foundPatternPartials;

      //if the template contains any pattern parameters
      if (parameteredPartials && parameteredPartials.length > 0) {
      if (patternlab.config.debug) {
        console.log('found parametered partials for ' + currentPattern.key);
      }

        //first, iterate through parameteredPartials and reset tmpTemplate for each
        parameter_hunter.reset_tmp_templates(currentPattern, patternlab);

        //recursively render currentPattern.tmpTemplate via parameter_hunter.find_parameters()
        parameter_hunter.find_parameters(currentPattern, patternlab);

        //re-evaluate found pattern partials
//        foundPatternPartials2 = findPartials(currentPattern.tmpTemplate);

        //recurse, going a level deeper, with each render eliminating nested parameteredPartials
        //when there are no more nested parameteredPartials, we'll pop back up
        processPatternRecursive(currentPattern.abspath, patternlab, false);
      }

    var foundPatternPartials = findPartials(currentPattern.tmpTemplate);
      //do something with re-evaluated partials
      if (foundPatternPartials && foundPatternPartials.length > 0) {
      if (patternlab.config.debug) {
        console.log('found partials for ' + currentPattern.key);
      }
//        var partialKey;
//        var partialPattern;

        for (i = 0; i < foundPatternPartials.length; i++) {
          var partialKey = foundPatternPartials[i].replace(/{{>([ ])?([\w\-\.\/~]+)(:[A-z0-9-_|]+)?(?:\:[A-Za-z0-9-_]+)?(?:(| )\([^\)]*\))?([ ])?}}/g, '$2');

          //identify which pattern this partial corresponds to
          var partialPattern = getpatternbykey(partialKey, patternlab);

          if (partialPattern === null) {
            throw 'Could not find pattern with key ' + partialKey;
          } else {

            //replace each partial tag with the partial's template.
            currentPattern.tmpTemplate = currentPattern.tmpTemplate.replace(foundPatternPartials[i], partialPattern.tmpTemplate);
          }
        }
<<<<<<< bd5ff0ec5f8829aca7104a008fe810410db46897
      } else{
        //find any listItem blocks that within the pattern, even if there are no partials
        list_item_hunter.process_list_item_partials(currentPattern, patternlab);
      }

      //find pattern lineage
      lineage_hunter.find_lineage(currentPattern, patternlab);

      //add to patternlab object so we can look these up later.
      addPattern(currentPattern, patternlab);

      //look for a pseudo pattern by checking if there is a file containing same name, with ~ in it, ending in .json
      pseudopattern_hunter.find_pseudopatterns(currentPattern, patternlab);
if(currentPattern.abspath.indexOf('04-pages/00-homepage') > -1){
}
    }

    function getpatternbykey(key, patternlab){

      for(var i = 0; i < patternlab.patterns.length; i++){
        switch(key){
          //look for exact key matches
          case patternlab.patterns[i].key:
          //look for abspath matches
          case patternlab.patterns[i].abspath:
          //look by verbose syntax
          case patternlab.patterns[i].subdir + '/' + patternlab.patterns[i].fileName:
          case patternlab.patterns[i].subdir + '/' + patternlab.patterns[i].fileName + '.mustache':
            return patternlab.patterns[i];
        }
      }
=======
if (startFile.indexOf('04-pages/faq.mustache') > -1) {
//console.log(startRecurse);
//console.log(currentPattern.tmpTemplate);
//console.log('\n');
//console.log('\n');
//console.log('\n');
//console.log('\n');
}

        //recurse, going a level deeper, with each render eliminating nested partials
        //when there are no more nested partials, we'll pop back up
        processPatternRecursive(currentPattern.abspath, patternlab, false);
      }


//    }

    //do only at the end of the top level of recursion
    if (startRecurse) {

      //if partial has style modifier data, replace the styleModifier value
      if (currentPattern.stylePartials && currentPattern.stylePartials.length > 0) {
        style_modifier_hunter.consume_style_modifier(partialPattern, foundPatternPartials[i], patternlab);
      }

      currentPattern.extendedTemplate = currentPattern.tmpTemplate;

      //find any listItem blocks that within the pattern, even if there are no partials
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //find pattern lineage
      lineage_hunter.find_lineage(currentPattern, patternlab);

      //look for a pseudo pattern by checking if there is a file containing same name, with ~ in it, ending in .json
      pseudopattern_hunter.find_pseudopatterns(currentPattern, patternlab);
    }
  }
>>>>>>> new recursion scheme - processPatternRecursive stays within pattern while recursing

  function parseDataLinksHelper(patternlab, obj, key) {
    var linkRE, dataObjAsString, linkMatches, expandedLink;

    /**
     * Recurse through data object and apply a function at each step.
     *
     * @param {Object} data JSON object.
     * @param {Object} callback The function to be applied on the data at the recursion step.
     */
    function traverseData(dataObj, callback){
      for(var i in dataObj){
        if(dataObj.hasOwnProperty(i)){
          callback.apply(this, [i, dataObj[i]]);
          if(dataObj[i] !== null && typeof dataObj[i] === 'object'){
            traverseData(dataObj[i], callback);
          }
        }
      }
    }

    function buildListItems(container){
      //combine all list items into one structure
      var list = [];
      for (var item in container.listitems) {
        if( container.listitems.hasOwnProperty(item)) {
          list.push(container.listitems[item]);
        }
      }
      container.listItemArray = shuffle(list);

      for(var i = 1; i <= container.listItemArray.length; i++){
        var tempItems = [];
        if( i === 1){
          tempItems.push(container.listItemArray[0]);
          container.listitems['' + i ] = tempItems;
        } else{
          for(var c = 1; c <= i; c++){
            tempItems.push(container.listItemArray[c - 1]);
            container.listitems['' + i ] = tempItems;
          }
        }
      }
    }

    //http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
    function shuffle(o){
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    function parseDataLinksHelper (patternlab, obj, key) {
      var linkRE, dataObjAsString, linkMatches, expandedLink;

      linkRE = /link\.[A-z0-9-_]+/g
      dataObjAsString = JSON.stringify(obj);
      linkMatches = dataObjAsString.match(linkRE)

      if(linkMatches) {
        for (var i = 0; i < linkMatches.length; i++) {
          expandedLink = patternlab.data.link[linkMatches[i].split('.')[1]];
          if (expandedLink) {
            if(patternlab.config.debug){
              console.log('expanded data link from ' + linkMatches[i] + ' to ' + expandedLink + ' inside ' + key);
            }
            dataObjAsString = dataObjAsString.replace(linkMatches[i], expandedLink);
          }
        }
      }
      return JSON.parse(dataObjAsString)
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
    process_pattern_recursive: function (file, patternlab, startRecurse) {
      processPatternRecursive(file, patternlab, startRecurse);
    },
    parse_data_links: function (patternlab) {
      parseDataLinks(patternlab);
    }

    return {
      find_pattern_partials: function(pattern){
        return findPartials(pattern);
      },
      find_pattern_partials_with_style_modifiers: function(pattern){
        return findPartialsWithStyleModifiers(pattern);
      },
      find_pattern_partials_with_parameters: function(pattern){
        return findPartialsWithPatternParameters(pattern);
      },
      find_list_items: function(pattern){
        return findListItems(pattern)
      },
      setPatternState: function(pattern, patternlab){
        setState(pattern, patternlab);
      },
      addPattern: function(pattern, patternlab){
        addPattern(pattern, patternlab);
      },
      renderPattern: function(template, data, partials){
        return renderPattern(template, data, partials);
      },
      process_pattern_iterative: function(file, patternlab){
        processPatternIterative(file, patternlab);
      },
      process_pattern_recursive: function(file, patternlab, startFile){
        processPatternRecursive(file, patternlab, startFile);
      },
      get_pattern_by_key: function(key, patternlab){
        return getpatternbykey(key, patternlab);
      },
      merge_data: function(existingData, newData){
        return mergeData(existingData, newData);
      },
      traverse_data: function(dataObj, callback){
        return traverseData(dataObj, callback);
      },
      combine_listItems: function(patternlab){
        buildListItems(patternlab);
      },
      is_object_empty: function(obj){
        return isObjectEmpty(obj);
      },
      parse_data_links: function(patternlab){
        parseDataLinks(patternlab);
      }
    };

  };

  module.exports = pattern_assembler;

}());
