'use strict';

const parseLink = require('./parseLink');

//look for pattern links included in data files.
//these will be in the form of link.* WITHOUT {{}}, which would still be there from direct pattern inclusion
module.exports = function (patternlab) {
  //look for link.* such as link.pages-blog as a value
  patternlab.data = parseLink(patternlab, patternlab.data, 'data.json');

  //loop through all patterns
  for (let i = 0; i < patternlab.patterns.length; i++) {
    patternlab.patterns[i].jsonFileData = parseLink(
      patternlab,
      patternlab.patterns[i].jsonFileData,
      patternlab.patterns[i].patternPartial
    );
  }
};
