"use strict";

var md = require('markdown-it')();

var markdown_parser = function () {

  function parseMarkdownBlock(block) {
    var returnObject = {};

    try {
      //for each block process the yaml frontmatter and markdown
      var frontmatterRE = /---\r?\n{1}([\s\S]*)---\r?\n{1}([\s\S]*)+/gm;
      var chunks = frontmatterRE.exec(block);
      if (chunks && chunks[1]) {

        //convert each yaml frontmatter key / value into an object key
        var frontmatter = chunks[1];
        var frontmatterLines = frontmatter.split(/\n/gm);
        for (var j = 0; j < frontmatterLines.length; j++) {

          var frontmatterLine = frontmatterLines[j];
          if (frontmatterLine.length > 0) {

            var frontmatterLineChunks = frontmatterLine.split(':'); //test this
            var frontmatterKey = frontmatterLineChunks[0].toLowerCase().trim();
            var frontmatterValueString = frontmatterLineChunks[1].trim();

            returnObject[frontmatterKey] = frontmatterValueString;
          }

        }
      }

      if (chunks && chunks[2]) {
        //parse the actual markdown
        returnObject.markdown = md.render(chunks[2]);
      } else {
        //assume the passed in block is raw markdown
        returnObject.markdown = md.render(block);
      }
    } catch (ex) {
      console.log(ex);
      console.log('error parsing markdown block', block);
      return undefined;
    }

    //return the frontmatter keys and markdown for a consumer to decide what to do with
    return returnObject;
  }

  return {
    parse: function (block) {
      return parseMarkdownBlock(block);
    }
  };

};

module.exports = markdown_parser;
