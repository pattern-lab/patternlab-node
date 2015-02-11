(function () {
  "use strict";

  var fs = require('fs-extra'),
      path = require('path');

  var pattern_assembler = function(){

    function exportPatterns(patternlab){

    }

    return {
      export_patterns: function(patternlab){
        exportPatterns(patternlab);
      }
    };

  };

  module.exports = pattern_assembler;

}());