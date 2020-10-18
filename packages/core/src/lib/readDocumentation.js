'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');

const ch = require('./changes_hunter');
const logger = require('./log');
const mp = require('./markdown_parser');

const changes_hunter = new ch();
const markdown_parser = new mp();

const FILE_EXTENSION = '.md';

module.exports = function(pattern, patternlab, isVariant) {
  try {
    const markdownFileName = path.resolve(
      patternlab.config.paths.source.patterns,
      pattern.subdir,
      pattern.fileName + FILE_EXTENSION
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
        pattern[isVariant ? 'variantOrder' : 'order'] = markdownObject.order;
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
        markdownObject.hasOwnProperty('deeplyNested') &&
        markdownObject.deeplyNested
      ) {
        // Reset to pattern without own pattern-directory
        pattern.promoteFromDirectoryToFlatPattern(patternlab);
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
        `'there was an error setting pattern keys after markdown parsing of the companion file for pattern ${pattern.patternPartial +
          FILE_EXTENSION}`
      );
      logger.warning(err);
    }
  }

  // Read Documentation for Pattern-Group
  // Use this approach, since pattern lab is a pattern driven software
  try {
    const markdownFileNameGroup = path.resolve(
      patternlab.config.paths.source.patterns,
      pattern.patternGroup + FILE_EXTENSION
    );
    const markdownFileContentsGroup = fs.readFileSync(
      markdownFileNameGroup,
      'utf8'
    );
    const markdownObjectGroup = markdown_parser.parse(
      markdownFileContentsGroup
    );

    if (!_.isEmpty(markdownObjectGroup)) {
      pattern.patternGroupData = markdownObjectGroup;
    }
  } catch (err) {
    // do nothing when file not found
    if (err.code !== 'ENOENT') {
      logger.warning(
        `There was an error setting pattern group data after markdown parsing for ${path.join(
          pattern.patternGroup + FILE_EXTENSION
        )}`
      );
      logger.warning(err);
    }
  }

  // Read Documentation for Pattern-Subgroup
  try {
    const markdownFileNameSubgroup = path.resolve(
      patternlab.config.paths.source.patterns,
      pattern.patternGroup,
      pattern.patternSubgroup + FILE_EXTENSION
    );
    const markdownFileContentsSubgroup = fs.readFileSync(
      markdownFileNameSubgroup,
      'utf8'
    );
    const markdownObjectSubgroup = markdown_parser.parse(
      markdownFileContentsSubgroup
    );

    if (!_.isEmpty(markdownObjectSubgroup)) {
      pattern.patternSubgroupData = markdownObjectSubgroup;
    }
  } catch (err) {
    // do nothing when file not found
    if (err.code !== 'ENOENT') {
      logger.warning(
        `There was an error setting pattern subgroup data after markdown parsing for ${path.join(
          pattern.patternGroup,
          pattern.patternSubgroup + FILE_EXTENSION
        )}`
      );
      logger.warning(err);
    }
  }
};
