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
    var path = require('path'),
        fs = require('fs-extra'),
        of = require('./object_factory'),
        plutils = require('./utilities'),
        patternEngines = require('./pattern_engines/pattern_engines');

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
      // if the pattern is new, we must register it with various data structures!
      if (isNew) {
        // do global registration
        patternlab.patterns.push(pattern);
        patternlab.partials[pattern.key] = pattern.extendedTemplate || pattern.template;
        
        // do plugin-specific registration
        pattern.registerPartial();
      }
    }

    function renderPattern(pattern, data, partials) {
      // if we've been passed a full oPattern, it knows what kind of template it
      // is, and how to render itself, so we just call its render method
      if (pattern instanceof of.oPattern) {
        return pattern.render(data, partials);
      } else {
        // otherwise, assume it's a plain mustache template string and act
        // accordingly
        return patternEngines.mustache.renderPattern(pattern, data, partials);
      }
    }

    function processPatternIterative(file, patternlab){
      //extract some information
      var subdir = path.dirname(path.relative(patternlab.config.paths.source.patterns, file)).replace('\\', '/');
      var filename = path.basename(file);
      var ext = path.extname(filename);

      // skip non-pattern files
      if (!patternEngines.isPatternFile(filename, patternlab)) { return null; }

      //make a new Pattern Object
      var currentPattern = new of.oPattern(file, subdir, filename);

      //if file is named in the syntax for variants
      if(patternEngines.isPseudoPatternJSON(filename)){
        return currentPattern;
      }

      //can ignore all non-supported files at this point
      if(patternEngines.isFileExtensionSupported(ext) === false){
        return currentPattern;
      }

      //see if this file has a state
      setState(currentPattern, patternlab);

      //look for a json file for this template
      try {
        var jsonFilename = path.resolve(patternlab.config.paths.source.patterns, currentPattern.subdir, currentPattern.fileName + ".json");
        currentPattern.jsonFileData = fs.readJSONSync(jsonFilename);
        if(patternlab.config.debug){
          console.log('processPatternIterative: found pattern-specific data.json for ' + currentPattern.key);
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
      currentPattern.stylePartials = currentPattern.findPartialsWithStyleModifiers();

      //find any pattern parameters that may be in the current pattern
      currentPattern.parameteredPartials = currentPattern.findPartialsWithPatternParameters();

      //add currentPattern to patternlab.patterns array
      addPattern(currentPattern, patternlab);

      return currentPattern;
    }



    function expandPartials(foundPatternPartials, list_item_hunter, patternlab, currentPattern) {
      var smh = require('./style_modifier_hunter'),
          ph = require('./parameter_hunter');

      var style_modifier_hunter = new smh(),
          parameter_hunter = new ph();

      if(patternlab.config.debug){
        console.log('found partials for ' + currentPattern.key);
      }

      // determine if the template contains any pattern parameters. if so they
      // must be immediately consumed
      parameter_hunter.find_parameters(currentPattern, patternlab);

      //do something with the regular old partials
      for(var i = 0; i < foundPatternPartials.length; i++){
        var partialKey = currentPattern.findPartialKey(foundPatternPartials[i]);
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
      }
    }

    function processPatternRecursive(file, patternlab, additionalData){
      var lh = require('./lineage_hunter'),
          pph = require('./pseudopattern_hunter'),
          lih = require('./list_item_hunter');

      var lineage_hunter = new lh(),
          list_item_hunter = new lih(),
          pseudopattern_hunter = new pph();

      //find current pattern in patternlab object using var file as a key
      var currentPattern, i;

      for(i = 0; i < patternlab.patterns.length; i++){
        if(patternlab.patterns[i].abspath === file){
          currentPattern = patternlab.patterns[i];
        }
      }

      //return if processing an ignored file
      if (typeof currentPattern === 'undefined') { return; }

      currentPattern.extendedTemplate = currentPattern.template;

      //find how many partials there may be for the given pattern
      var foundPatternPartials = currentPattern.findPartials(currentPattern);

      //find any listItem blocks that within the pattern, even if there are no partials
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);
      
      // expand any partials present in this pattern; that is, drill down into
      // the template and replace their calls in this template with rendered
      // results
      if (currentPattern.engine.expandPartials && (foundPatternPartials !== null && foundPatternPartials.length > 0)) {
        expandPartials(foundPatternPartials, list_item_hunter, patternlab, currentPattern);
        
        // update the extendedTemplate in the partials object in case this
        // pattern is consumed later
        patternlab.partials[currentPattern.key] = currentPattern.extendedTemplate;
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



    function buildListItems(container){
      //combine all list items into one structure
      var list = [];
      for (var item in container.listitems) {
        if( container.listitems.hasOwnProperty(item)) {
          list.push(container.listitems[item]);
        }
      }
      container.listItemArray = plutils.shuffle(list);

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
        return pattern.findPartials();
      },
      find_pattern_partials_with_style_modifiers: function(pattern){
        return pattern.findPartialsWithStyleModifiers();
      },
      find_pattern_partials_with_parameters: function(pattern){
        return pattern.findPartialsWithPatternParameters();
      },
      find_list_items: function(pattern){
        return pattern.findListItems();
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
        return processPatternIterative(file, patternlab);
      },
      process_pattern_recursive: function(file, patternlab, additionalData){
        processPatternRecursive(file, patternlab, additionalData);
      },
      get_pattern_by_key: function(key, patternlab){
        return getpatternbykey(key, patternlab);
      },
      combine_listItems: function(patternlab){
        buildListItems(patternlab);
      },
      parse_data_links: function(patternlab){
        parseDataLinks(patternlab);
      }
    };

  };

  module.exports = pattern_assembler;

}());
