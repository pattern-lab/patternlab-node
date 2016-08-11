"use strict";

var lineage_hunter = function () {

  var pa = require('./pattern_assembler');

  function findlineage(pattern, patternlab) {

    var pattern_assembler = new pa();

    //find the {{> template-name }} within patterns
    var matches = pattern.findPartials();
    if (matches !== null) {
      matches.forEach(function (match) {
        //get the ancestorPattern
        var ancestorPattern = pattern_assembler.getPartial(pattern.findPartial(match), patternlab);

        if (ancestorPattern && pattern.lineageIndex.indexOf(ancestorPattern.patternPartial) === -1) {
          //add it since it didnt exist
          pattern.lineageIndex.push(ancestorPattern.patternPartial);

          //create the more complex patternLineage object too
          var l = {
            "lineagePattern": ancestorPattern.patternPartial,
            "lineagePath": "../../patterns/" + ancestorPattern.patternLink
          };
          if (ancestorPattern.patternState) {
            l.lineageState = ancestorPattern.patternState;
          }

          pattern.lineage.push(l);

          //also, add the lineageR entry if it doesn't exist
          if (ancestorPattern.lineageRIndex.indexOf(pattern.patternPartial) === -1) {
            ancestorPattern.lineageRIndex.push(pattern.patternPartial);

            //create the more complex patternLineage object in reverse
            var lr = {
              "lineagePattern": pattern.patternPartial,
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
        if (pattern.lineageIndex[i] === targetPattern.patternPartial) {
          pattern.lineage[i].lineageState = targetPattern.patternState;
        }
      }
    } else {
      //the request came from the future, apply target pattern state to current pattern reverse lineage
      for (var i = 0; i < pattern.lineageRIndex.length; i++) {
        if (pattern.lineageRIndex[i] === targetPattern.patternPartial) {
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
            var lineagePattern = pattern_assembler.getPartial(pattern.lineageIndex[h], patternlab);
            setPatternState('fromFuture', lineagePattern, pattern);
          }
        }

        if (pattern.lineageRIndex && pattern.lineageRIndex.length > 0) {

          //find all reverse lineage - that is, patterns consuming this one
          for (var j = 0; j < pattern.lineageRIndex.length; j++) {

            var lineageRPattern = pattern_assembler.getPartial(pattern.lineageRIndex[j], patternlab);

            //only set patternState if pattern.patternState "is less than" the lineageRPattern.patternstate
            //or if lineageRPattern.patternstate (the consuming pattern) does not have a state
            //this makes patternlab apply the lowest common ancestor denominator
            if (lineageRPattern.patternState === '' || (patternlab.config.patternStateCascade.indexOf(pattern.patternState)
              < patternlab.config.patternStateCascade.indexOf(lineageRPattern.patternState))) {

              if (patternlab.config.debug) {
                console.log('Found a lower common denominator pattern state: ' + pattern.patternState + ' on ' + pattern.patternPartial + '. Setting reverse lineage pattern ' + lineageRPattern.patternPartial + ' from ' + (lineageRPattern.patternState === '' ? '<<blank>>' : lineageRPattern.patternState));
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
