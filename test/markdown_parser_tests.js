"use strict";

var path = require('path');
var fs = require('fs-extra');
var eol = require('os').EOL;
var mp = require('../core/lib/markdown_parser');
var markdown_parser = new mp();

exports['markdown_parser'] = {
	'parses pattern description block correctly when frontmatter not present' : function(test){
		//arrange
    var markdownFileName = path.resolve("./test/files/_patterns/00-test/00-foo.md");
    var markdownFileContents = fs.readFileSync(markdownFileName, 'utf8');

		//act
		var returnObject = markdown_parser.parse(markdownFileContents)

		//assert
    test.equals(returnObject.markdown, '<h2>A Simple Include</h2>\n<p>This pattern contains an include of <code>test-bar</code>. It also has this markdown file, which does not have frontmatter.</p>\n');
    test.done();
	},
  'parses pattern description block correctly when frontmatter present' : function(test){
    //arrange
    var markdownFileName = path.resolve("./test/files/_patterns/00-test/01-bar.md");
    var markdownFileContents = fs.readFileSync(markdownFileName, 'utf8');

    //act
    var returnObject = markdown_parser.parse(markdownFileContents)

    //assert
    test.equals(returnObject.markdown, '<h2>A Simple Bit of Markup</h2>\n<p>Foo cannot get simpler than bar, amiright?</p>\n');
    test.equals(returnObject.status, 'complete');
    test.done();
  }
};
