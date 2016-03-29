/* 
 * patternlab-node - v1.2.1 - 2016 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

"use strict";

var diveSync = require('diveSync'),
  path = require('path'),
  fs = require('fs-extra');

var media_hunter = function () {

  function findMediaQueries(dir, patternlab) {
    patternlab.mediaQueries = [];

    diveSync(dir, function (err, file) {
      if (path.extname(file) === '.css') {
        var contents = fs.readFileSync(file, 'utf8');
        var safeContents = contents.replace("\r", " ").replace("\n", " ");
        var matches = safeContents.match(/\((min|max)-width:([ ]+)?(([0-9]{1,5})(\.[0-9]{1,20}|)(px|em))/g);
        for (var i = 0; i < matches.length; i++) {
          var breakpoint = matches[i].substring(matches[i].indexOf(':') + 1).trimLeft();
          if (patternlab.mediaQueries.indexOf(breakpoint) === -1) {
            patternlab.mediaQueries.push(breakpoint);
          }
        }
      }
    });
    patternlab.mediaQueries.sort(function (a, b) {
      a.match(/(?:\d*\.)?\d+/g);
      b.match(/(?:\d*\.)?\d+/g);
      return parseInt(a, 10) > parseInt(b, 10);
    });
  }

  return {
    find_media_queries: function (dir, patternlab) {
      findMediaQueries(dir, patternlab);
    }
  };

};

module.exports = media_hunter;

