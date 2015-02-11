(function () {
  "use strict";

  var fs = require('fs-extra'),
      path = require('path');

  var pattern_assembler = function(){

    function setState(pattern, patternlab){
      if(patternlab.config.patternStates[pattern.patternName]){
        pattern.patternState = patternlab.config.patternStates[pattern.patternName];
      } else{
        pattern.patternState = "";
      }
    }

    function addPattern(pattern, patternLab){
      patternLab.data.link[pattern.patternGroup + '-' + pattern.patternName] = '/patterns/' + pattern.patternLink;
      patternLab.patterns.push(pattern);
    }

    return {
      setPatternState: function(pattern, patternlab){
        setState(pattern, patternlab);
      },
      addPattern: function(pattern, patternLab){
        addPattern(pattern, patternLab);
      }
    };

  };

  module.exports = pattern_assembler;

}());