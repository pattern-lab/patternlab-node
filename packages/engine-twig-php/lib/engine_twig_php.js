'use strict';

/*
 * Twig PHP pattern engine for patternlab-node
 *
 * Evan Lovely
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

/*
 * ENGINE SUPPORT LEVEL: Experimental
 */

const TwigRenderer = require('@basalt/twig-renderer');
const fs = require('fs-extra');
const path = require('path');

let twigRenderer;
let patternLabConfig = {};

const engine_twig_php = {
  engine: TwigRenderer,
  engineName: 'twig-php',
  engineFileExtension: '.twig',
  expandPartials: false,

  // @todo Evaluate RegExs
  // findPartialsRE: /{%\s*(?:extends|include|embed)\s+('[^']+'|"[^"]+").*?%}/g,
  // findPartialKeyRE: /"((?:\\.|[^"\\])*)"/,

  /**
   * Accept a Pattern Lab config object from the core and put it in
   * this module's closure scope so we can configure engine behavior.
   *
   * @param {object} config - the global config object from core
   */
  usePatternLabConfig: function(config) {
    patternLabConfig = config;

    if (!config.engines.twig) {
      console.error('Missing "twig" in Pattern Lab config file; exiting...');
      process.exit(1);
    }

    const { namespaces, alterTwigEnv, relativeFrom } = config.engines.twig;

    // Schema on config object being passed in:
    // https://github.com/basaltinc/twig-renderer/blob/master/config.schema.json
    twigRenderer = new TwigRenderer({
      src: {
        roots: [config.paths.source.root, config.paths.source.patterns],
        namespaces,
      },
      relativeFrom,
      alterTwigEnv,
    });
  },

  renderPattern(pattern, data) {
    return new Promise((resolve, reject) => {
      const patternPath = path.isAbsolute(pattern.relPath)
        ? path.relative(patternLabConfig.paths.source.root, pattern.relPath)
        : pattern.relPath;
      // console.log(patternPath);

      let details = '';
      if (patternLabConfig.logLevel === 'debug') {
        details = `<details><pre><code>${JSON.stringify(
          { pattern, data },
          null,
          '  '
        )}</code></pre></details>`;
      }

      twigRenderer
        .render(patternPath, data)
        .then(results => {
          if (results.ok) {
            resolve(results.html + details);
          } else {
            reject(results.message);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * Checks to see if the _meta directory has engine-specific head and foot files,
   * spawning them if not found.
   *
   * @param {object} config - the global config object from core, since we won't
   * assume it's already present
   */
  spawnMeta(config) {
    const { paths } = config;
    ['_00-head.twig', '_01-foot.twig'].forEach(fileName => {
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
    });
  },

  // Below exists several functions that core uses to build lineage through RegEx
  // @todo Add all functions that get called even if disabled to ease implementing engine further
  // Currently all of them return `null` as I'm not totally sure there absence will be ok. Additionally, future improvements may be implemented in this functions.

  findPartials(pattern) {
    return null;
  },

  findPartialsWithStyleModifiers(pattern) {
    return null;
  },

  findPartialsWithPatternParameters(pattern) {
    return null;
  },

  findListItems(pattern) {
    return null;
  },

  findPartial_new(partialString) {
    return null;
  },

  findPartial(partialString) {
    return null;
  },

  patternMatcher(pattern, regex) {
    return null;
  },
};

module.exports = engine_twig_php;
