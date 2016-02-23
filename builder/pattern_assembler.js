/* 
 * patternlab-node - v1.1.2 - 2016 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

(function () {
  "use strict";

  var pattern_assembler = function(){

    function isObjectEmpty(obj) {
      for(var prop in obj) {
          if(obj.hasOwnProperty(prop))
              return false;
      }

      return true;
    }

    // returns any patterns that match {{> value:mod }} or {{> value:mod(foo:"bar") }} within the pattern
    function findPartialsWithStyleModifiers(pattern){
      var matches = pattern.template.match(/{{>([ ])?([\w\-\.\/~]+)(?!\()(\:[A-Za-z0-9-_|]+)+(?:(| )\(.*)?([ ])?}}/g);
      return matches;
    }

    // returns any patterns that match {{> value(foo:"bar") }} or {{> value:mod(foo:"bar") }} within the pattern
    function findPartialsWithPatternParameters(pattern){
      var matches = pattern.template.match(/{{>([ ])?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_|]+)?(?:(| )\(.*)+([ ])?}}/g);
      return matches;
    }

    //find and return any {{> template-name* }} within pattern
    function findPartials(pattern){
      var matches = pattern.template.match(/{{>([ ])?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_|]+)?(?:(| )\(.*)?([ ])?}}/g);
      return matches;
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
      //if the pattern is new, just push to the array
      if(isNew){
        patternlab.patterns.push(pattern);
        patternlab.partials[pattern.key] = pattern.extendedTemplate || pattern.template;
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

    function processPatternIterative(file, patternlab){
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
      try {
        var jsonFilename = path.resolve(patternlab.config.paths.source.patterns, currentPattern.subdir, currentPattern.fileName + ".json");
        currentPattern.jsonFileData = fs.readJSONSync(jsonFilename);
        if(patternlab.config.debug){
          console.log('found pattern-specific data.json for ' + currentPattern.key);
        }
      }
      catch(e) {
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

    function processPatternRecursive(file, patternlab, additionalData){

      var fs = require('fs-extra'),
      mustache = require('mustache'),
      lh = require('./lineage_hunter'),
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

      //find current pattern in patternlab object using var file as a key
      var currentPattern,
      i;

      for(i = 0; i < patternlab.patterns.length; i++){
        if(patternlab.patterns[i].abspath === file){
          currentPattern = patternlab.patterns[i];
          break;
        }
      }

      //return if processing an ignored file
      if(typeof currentPattern === 'undefined'){
        return;
      }

      currentPattern.extendedTemplate = currentPattern.template;

      //find how many partials there may be for the given pattern
      var foundPatternPartials = findPartials(currentPattern);

      if(foundPatternPartials !== null && foundPatternPartials.length > 0){

        if(patternlab.config.debug){
          console.log('found partials for ' + currentPattern.key);
        }

        //find any listItem blocks
        list_item_hunter.process_list_item_partials(currentPattern, patternlab);

        //determine if the template contains any pattern parameters. if so they must be immediately consumed
        parameter_hunter.find_parameters(currentPattern, patternlab);

        //do something with the regular old partials
        for(i = 0; i < foundPatternPartials.length; i++){
          var partialKey = foundPatternPartials[i].replace(/{{>([ ])?([\w\-\.\/~]+)(:[A-z0-9-_|]+)?(?:\:[A-Za-z0-9-_]+)?(?:(| )\(.*)?([ ])?}}/g, '$2');

          var partialPath;

          //identify which pattern this partial corresponds to
          for(var j = 0; j < patternlab.patterns.length; j++){
            if(patternlab.patterns[j].key === partialKey ||
              patternlab.patterns[j].abspath.indexOf(partialKey) > -1)
            {
              partialPath = patternlab.patterns[j].abspath;
            }
          }

          //recurse through nested partials to fill out this extended template.
          processPatternRecursive(partialPath, patternlab);

          //complete assembly of extended template
          var partialPattern = getpatternbykey(partialKey, patternlab);

          //if partial has style modifier data, replace the styleModifier value
          if(currentPattern.stylePartials && currentPattern.stylePartials.length > 0){
            style_modifier_hunter.consume_style_modifier(partialPattern, foundPatternPartials[i], patternlab);
          }

          currentPattern.extendedTemplate = currentPattern.extendedTemplate.replace(foundPatternPartials[i], partialPattern.extendedTemplate);

          //update the extendedTemplate in the partials object in case this pattern is consumed later
          patternlab.partials[currentPattern.key] = currentPattern.extendedTemplate;
        }

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
    }

    function getpatternbykey(key, patternlab){

      //look for exact key matches
      for(var i = 0; i < patternlab.patterns.length; i++){
        if(patternlab.patterns[i].key === key){
          return patternlab.patterns[i];
        }
      }

      //else look by verbose syntax
      for(var i = 0; i < patternlab.patterns.length; i++){
        switch(key){
          case patternlab.patterns[i].subdir + '/' + patternlab.patterns[i].fileName:
          case patternlab.patterns[i].subdir + '/' + patternlab.patterns[i].fileName + '.mustache':
            return patternlab.patterns[i];
        }
      }

      //return the fuzzy match if all else fails
      for(var i = 0; i < patternlab.patterns.length; i++){
        var keyParts = key.split('-'),
            keyType = keyParts[0],
            keyName = keyParts.slice(1).join('-');
        if(patternlab.patterns[i].key.split('-')[0] === keyType && patternlab.patterns[i].key.indexOf(keyName) > -1){
          return patternlab.patterns[i];
        }
      }
      throw 'Could not find pattern with key ' + key;
    }

    function mergeData(obj1, obj2){
      if(typeof obj2 === 'undefined'){
        obj2 = {};
      }
      for(var p in obj1){
        try {
          // Only recurse if obj1[p] is an object.
          if(obj1[p].constructor === Object){
            // Requires 2 objects as params; create obj2[p] if undefined.
            if(typeof obj2[p] === 'undefined'){
              obj2[p] = {};
            }
            obj2[p] = mergeData(obj1[p], obj2[p]);
          // Pop when recursion meets a non-object. If obj1[p] is a non-object,
          // only copy to undefined obj2[p]. This way, obj2 maintains priority.
          } else if(typeof obj2[p] === 'undefined'){
            obj2[p] = obj1[p];
          }
        } catch(e) {
          // Property in destination object not set; create it and set its value.
          if(typeof obj2[p] === 'undefined'){
            obj2[p] = obj1[p];
          }
        }
      }
      return obj2;
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
    //look for pattern links included in data files.
    //these will be in the form of link.* WITHOUT {{}}, which would still be there from direct pattern inclusion
    function parseDataLinks(patternlab) {
      //look for link.* such as link.pages-blog as a value

      patternlab.data = parseDataLinksHelper(patternlab, patternlab.data, 'data.json')

      //loop through all patterns
      for (var i = 0; i < patternlab.patterns.length; i++) {
        patternlab.patterns[i].jsonFileData = parseDataLinksHelper(patternlab, patternlab.patterns[i].jsonFileData, patternlab.patterns[i].key)
      }
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
      process_pattern_recursive: function(file, patternlab, additionalData){
        processPatternRecursive(file, patternlab, additionalData);
      },
      get_pattern_by_key: function(key, patternlab){
        return getpatternbykey(key, patternlab);
      },
      merge_data: function(existingData, newData){
        return mergeData(existingData, newData);
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
