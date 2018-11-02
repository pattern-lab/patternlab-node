'use strict';

/*
 * twig pattern engine for patternlab-node - v0.15.1 - 2015
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

/*
 * ENGINE SUPPORT LEVEL:
 *
 * Full. Partial calls and lineage hunting are supported. Twig does not support
 * the mustache-specific syntax extensions, style modifiers and pattern
 * parameters, because their use cases are addressed by the core Twig feature
 * set.
 *
 */

const fs = require('fs-extra');
const path = require('path');
const process = require('process');
const Twig = require('node-twig');
const twig = Twig.renderFile;

var engine_twig = {
  engine: Twig,
  engineName: 'twig',
  engineFileExtension: '.twig',

  //Important! Needed for Twig compilation. Can't resolve paths otherwise.
  expandPartials: true,

  // regexes, stored here so they're only compiled once
  findPartialsRE: /{%\s*(?:extends|include|embed)\s+('[^']+'|"[^"]+").*?%}/g,
  findPartialKeyRE: /"((?:\\.|[^"\\])*)"/,
  findListItemsRE: /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g, // TODO

  // render it
  renderPattern: function renderPattern(pattern, data) {
    return Promise.resolve(
      twig(
        pattern.relPath,
        {
          root: path.resolve(
            __dirname,
            path.resolve(process.cwd(), 'source', '_patterns')
          ),
          context: data,
        },
        (error, template) => {
          if (error) {
            console.log(error);
          }
          console.log(template);
          return template;
        }
      )
    );
  },

  // find and return any {% include 'template-name' %} within pattern
  findPartials: function findPartials(pattern) {
    var matches = pattern.template.match(this.findPartialsRE);
    return matches;
  },
  findPartialsWithStyleModifiers: function() {
    // TODO: make the call to this from oPattern objects conditional on their
    // being implemented here.
    return [];
  },

  // returns any patterns that match {{> value(foo:"bar") }} or {{>
  // value:mod(foo:"bar") }} within the pattern
  findPartialsWithPatternParameters: function() {
    // TODO: make the call to this from oPattern objects conditional on their
    // being implemented here.
    return [];
  },
  findListItems: function(pattern) {
    var matches = pattern.template.match(this.findListItemsRE);
    return matches;
  },

  // given a pattern, and a partial string, tease out the "pattern key" and
  // return it.
  findPartial: function(partialString) {
    //var partialKey = partialString.replace(this.findPartialsRE, '$1');
    var partial = partialString.match(this.findPartialKeyRE)[0];
    partial = partial.replace(/"/g, '');

    return partial;
  },

  spawnFile: function(config, fileName) {
    const paths = config.paths;
    const metaFilePath = path.resolve(paths.source.meta, fileName);
    try {
      fs.statSync(metaFilePath);
    } catch (err) {
      //not a file, so spawn it from the included file
      const metaFileContent = fs.readFileSync(
        path.resolve(__dirname, '..', '_meta/', fileName),
        'utf8'
      );
      fs.outputFileSync(metaFilePath, metaFileContent);
    }
  },

  /**
   * Checks to see if the _meta directory has engine-specific head and foot files,
   * spawning them if not found.
   *
   * @param {object} config - the global config object from core, since we won't
   * assume it's already present
   */
  spawnMeta: function(config) {
    this.spawnFile(config, '_00-head.twig');
    this.spawnFile(config, '_01-foot.twig');
  },
};

module.exports = engine_twig;
