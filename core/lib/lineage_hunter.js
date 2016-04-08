/* 
 * patternlab-node - v1.2.2 - 2016 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

"use strict";

var lineage_hunter = function () {

  var pa = require('./pattern_assembler');

  function findlineage(pattern, patternlab) {

    var pattern_assembler = new pa();

    //find the {{> template-name }} within patterns
    var matches = pattern_assembler.find_pattern_partials(pattern);
    if (matches !== null) {
      matches.forEach(function (match) {
        //strip out the template cruft
        var foundPatternKey = match
              .replace("{{> ", "")
              .replace(" }}", "")
              .replace("{{>", "")
              .replace("}}", "");

        // remove any potential pattern parameters. this and the above are
        // rather brutish but I didn't want to do a regex at the time
        if (foundPatternKey.indexOf('(') > 0) {
          foundPatternKey = foundPatternKey.substring(0, foundPatternKey.indexOf('('));
        }

        //remove any potential stylemodifiers.
        foundPatternKey = foundPatternKey.split(':')[0];

        //get the ancestorPattern
        var ancestorPattern = pattern_assembler.get_pattern_by_key(foundPatternKey, patternlab);

        if (ancestorPattern && pattern.lineageIndex.indexOf(ancestorPattern.key) === -1) {

          //add it since it didnt exist
          pattern.lineageIndex.push(ancestorPattern.key);

          //create the more complex patternLineage object too
          var l = {
            "lineagePattern": ancestorPattern.key,
            "lineagePath": "../../patterns/" + ancestorPattern.patternLink
          };
          if (ancestorPattern.patternState) {
            l.lineageState = ancestorPattern.patternState;
          }

          pattern.lineage.push(l);

          //also, add the lineageR entry if it doesn't exist
          if (ancestorPattern.lineageRIndex.indexOf(pattern.key) === -1) {
            ancestorPattern.lineageRIndex.push(pattern.key);

            //create the more complex patternLineage object in reverse
            var lr = {
              "lineagePattern": pattern.key,
              "lineagePath": "../../patterns/" + pattern.patternLink
            };
            if (pattern.patternState) {
              lr.lineageState = pattern.patternState;
            }

            ancestorPattern.lineageR.push(lr);
          }
        }
      });
    }
  }

  function setPatternState(direction, pattern, targetPattern) {
    // if the request came from the past, apply target pattern state to current pattern lineage
    if (direction === 'fromPast') {
      for (var i = 0; i < pattern.lineageIndex.length; i++) {
        if (pattern.lineageIndex[i] === targetPattern.key) {
          pattern.lineage[i].lineageState = targetPattern.patternState;
        }
      }
    } else {
      //the request came from the future, apply target pattern state to current pattern reverse lineage
      for (var i = 0; i < pattern.lineageRIndex.length; i++) {
        if (pattern.lineageRIndex[i] === targetPattern.key) {
          pattern.lineageR[i].lineageState = targetPattern.patternState;
        }
      }
    }
  }


  function cascadePatternStates(patternlab) {

    var pattern_assembler = new pa();

    for (var i = 0; i < patternlab.patterns.length; i++) {
      var pattern = patternlab.patterns[i];

      //for each pattern with a defined state
      if (pattern.patternState) {

        if (pattern.lineageIndex && pattern.lineageIndex.length > 0) {

          //find all lineage - patterns being consumed by this one
          for (var h = 0; h < pattern.lineageIndex.length; h++) {
            var lineagePattern = pattern_assembler.get_pattern_by_key(pattern.lineageIndex[h], patternlab);
            setPatternState('fromFuture', lineagePattern, pattern);
          }
        }

        if (pattern.lineageRIndex && pattern.lineageRIndex.length > 0) {

          //find all reverse lineage - that is, patterns consuming this one
          for (var j = 0; j < pattern.lineageRIndex.length; j++) {

            var lineageRPattern = pattern_assembler.get_pattern_by_key(pattern.lineageRIndex[j], patternlab);

            //only set patternState if pattern.patternState "is less than" the lineageRPattern.patternstate
            //this makes patternlab apply the lowest common ancestor denominator
            if (patternlab.config.patternStateCascade.indexOf(pattern.patternState)
              < patternlab.config.patternStateCascade.indexOf(lineageRPattern.patternState)) {

              if (patternlab.config.debug) {
                console.log('Found a lower common denominator pattern state: ' + pattern.patternState + ' on ' + pattern.key + '. Setting reverse lineage pattern ' + lineageRPattern.key + ' from ' + lineageRPattern.patternState);
              }

              lineageRPattern.patternState = pattern.patternState;

              //take this opportunity to overwrite the lineageRPattern's lineage state too
              setPatternState('fromPast', lineageRPattern, pattern);
            } else {
              setPatternState('fromPast', pattern, lineageRPattern);
            }
          }
        }
      }
    }
  }

  return {
    find_lineage: function (pattern, patternlab) {
      findlineage(pattern, patternlab);
    },
    cascade_pattern_states : function (patternlab) {
      cascadePatternStates(patternlab);
    }
  };

};

module.exports = lineage_hunter;
