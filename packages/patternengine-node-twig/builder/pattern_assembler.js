/* 
 * patternlab-node - v0.10.0 - 2015 
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

    //find and return any {{> template-name }} within pattern
    function findPartials(pattern){
      var matches = pattern.template.match(/{{>([ ])?([A-Za-z0-9-]+)(?:\:[A-Za-z0-9-]+)?(?:(| )\(.*)?([ ])?}}/g);
      return matches;
    }

    function setState(pattern, patternlab){
      if(patternlab.config.patternStates[pattern.patternName]){
        pattern.patternState = patternlab.config.patternStates[pattern.patternName];
      } else{
        pattern.patternState = "";
      }
    }

    function addPattern(pattern, patternlab){
      patternlab.data.link[pattern.patternGroup + '-' + pattern.patternName] = '/patterns/' + pattern.patternLink;
      patternlab.patterns.push(pattern);
    }

    function renderPattern(template, data, partials) {

      var mustache = require('mustache');

      if(partials) {
        return mustache.render(template, data, partials);
      } else{
        return mustache.render(template, data);
      }
    }

    function processPatternFile(file, patternlab){
      var fs = require('fs-extra'),
      of = require('./object_factory'),
      path = require('path');

      //extract some information
      var abspath = file.substring(2);
      var subdir = path.dirname(path.relative('./source/_patterns', file)).replace('\\', '/');
      var filename = path.basename(file);

      //ignore _underscored patterns, json (for now), and dotfiles
      if(filename.charAt(0) === '_' || path.extname(filename) === '.json' || filename.charAt(0) === '.'){
        return;
      }

      //make a new Pattern Object
      var currentPattern = new of.oPattern(subdir, filename);

      //see if this file has a state
      setState(currentPattern, patternlab);

      //look for a json file for this template
      try {
        var jsonFilename = abspath.substr(0, abspath.lastIndexOf(".")) + ".json";
        currentPattern.jsonFileData = fs.readJSONSync(jsonFilename);
      }
      catch(e) {
      }

      //add the raw template to memory
      currentPattern.template = fs.readFileSync(abspath, 'utf8');

      //our helper function that does a lot of heavy lifting
      processPattern(currentPattern, patternlab);
    }

    function processPattern(currentPattern, patternlab, additionalData){

      var fs = require('fs-extra'),
      mustache = require('mustache'),
      lh = require('./lineage_hunter'),
      ph = require('./parameter_hunter'),
      pph = require('./pseudopattern_hunter'),
      path = require('path');

      var parameter_hunter = new ph(),
      lineage_hunter = new lh(),
      pseudopattern_hunter = new pph();

      currentPattern.extendedTemplate = currentPattern.template;

      //find how many partials there may be for the given pattern
      var foundPatternPartials = findPartials(currentPattern);

      if(foundPatternPartials !== null && foundPatternPartials.length > 0){

        if(patternlab.config.debug){
          console.log('found partials for ' + currentPattern.key);
        }
        //determine if the template contains any pattern parameters. if so they must be immediately consumed
        parameter_hunter.find_parameters(currentPattern, patternlab);

        //do something with the regular old partials
        for(var i = 0; i < foundPatternPartials.length; i++){
          var partialKey = foundPatternPartials[i].replace(/{{>([ ])?([A-Za-z0-9-]+)(?:\:[A-Za-z0-9-]+)?(?:(| )\(.*)?([ ])?}}/g, '$2');
          var partialPattern = getpatternbykey(partialKey, patternlab);
          currentPattern.extendedTemplate = currentPattern.extendedTemplate.replace(foundPatternPartials[i], partialPattern.extendedTemplate);
        }

      }

      //find pattern lineage
      lineage_hunter.find_lineage(currentPattern, patternlab);

      //look for a pseudo pattern by checking if there is a file containing same name, with ~ in it, ending in .json
      pseudopattern_hunter.find_pseudopatterns(currentPattern, patternlab);

      //add to patternlab object so we can look these up later.
      addPattern(currentPattern, patternlab);
    }

    function getpatternbykey(key, patternlab){
      for(var i = 0; i < patternlab.patterns.length; i++){
        if(patternlab.patterns[i].key === key){
          return patternlab.patterns[i];
        }
      }
      throw 'Could not find pattern with key ' + key;
    }

    /*
    * Recursively merge properties of two objects
    * http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
    */
    var self = this;
    function mergeData(obj1, obj2) {
      for (var p in obj2) {
        try {
          // Property in destination object set; update its value.
          if ( obj2[p].constructor == Object ) {
            obj1[p] = self.merge_data(obj1[p], obj2[p]);

          } else {
            obj1[p] = obj2[p];
          }
        } catch(e) {
          // Property in destination object not set; create it and set its value.
          obj1[p] = obj2[p];
        }
      }
      return obj1;
    }

    return {
      find_pattern_partials: function(pattern){
        return findPartials(pattern);
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
      process_pattern_file: function(file, patternlab){
        processPatternFile(file, patternlab);
      },
      process_pattern: function(pattern, patternlab, additionalData){
        processPattern(pattern, patternlab, additionalData);
      },
      get_pattern_by_key: function(key, patternlab){
        return getpatternbykey(key, patternlab);
      },
      merge_data: function(existingData, newData){
        return mergeData(existingData, newData);
      }
    };

  };

  module.exports = pattern_assembler;

}());
