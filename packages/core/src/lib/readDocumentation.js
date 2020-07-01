'use strict';

const path = require('path');
const _ = require('lodash');

const ch = require('./changes_hunter');
const logger = require('./log');
const mp = require('./markdown_parser');

const changes_hunter = new ch();
const markdown_parser = new mp();

let fs = require('fs-extra'); //eslint-disable-line prefer-const

module.exports = function(pattern, patternlab) {
  try {
    const markdownFileName = path.resolve(
      patternlab.config.paths.source.patterns,
      pattern.subdir,
      pattern.fileName + '.md'
    );
    changes_hunter.checkLastModified(pattern, markdownFileName);

    const markdownFileContents = fs.readFileSync(markdownFileName, 'utf8');

    const markdownObject = markdown_parser.parse(markdownFileContents);
    if (!_.isEmpty(markdownObject)) {
      //set keys and markdown itself
      pattern.patternDescExists = true;
      pattern.patternDesc = markdownObject.markdown;

      //Add all markdown to the pattern, including frontmatter
      pattern.allMarkdown = markdownObject;

      //consider looping through all keys eventually. would need to blacklist some properties and whitelist others
      if (markdownObject.state) {
        pattern.patternState = markdownObject.state;
      }
      if (markdownObject.order) {
        pattern.order = markdownObject.order;
      }
      if (markdownObject.hidden) {
        pattern.hidden = markdownObject.hidden;
      }
      if (markdownObject.excludeFromStyleguide) {
        pattern.excludeFromStyleguide = markdownObject.excludeFromStyleguide;
      }
      if (markdownObject.tags) {
        pattern.tags = markdownObject.tags;
      }
      if (markdownObject.title) {
        pattern.patternName = markdownObject.title;
      }
      if (markdownObject.links) {
        pattern.links = markdownObject.links;
      }

      if (
        !markdownObject.hasOwnProperty('deeplyNested') ||
        (markdownObject.hasOwnProperty('deeplyNested') &&
          !markdownObject.deeplyNested)
      ) {
        // Reset to pattern without own pattern-directory
        pattern.promoteFromFlatPatternToDirectory(patternlab);
      }
    } else {
      logger.warning(`error processing markdown for ${pattern.patternPartial}`);
    }
    logger.debug(
      `found pattern-specific markdown for  ${pattern.patternPartial}`
    );
  } catch (err) {
    // do nothing when file not found
    if (err.code !== 'ENOENT') {
      logger.warning(
        `'there was an error setting pattern keys after markdown parsing of the companion file for pattern ${pattern.patternPartial}`
      );
      logger.warning(err);
    }
  }
};
