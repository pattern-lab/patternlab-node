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
  findPartialsRE: /{%\s*(?:extends|include|embed)\s+('[^']+'|"[^"]+").*?(with|%}|\s*%})/g,
  findPartialKeyRE: /"((?:\\.|[^"\\])*)"|'((?:\\.|[^"\\])*)'/,
  namespaces: [],

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

    // Preserve the namespaces from the config so we can use them later to
    // evaluate partials.
    this.namespaces = namespaces;

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

  // Find and return any {% extends|include|embed 'template-name' %} within pattern.
  // The regex should match the following examples:
  // {%
  //   include '@molecules/teaser-card/teaser-card.twig' with {
  //     teaser_card: card
  //   } only
  // %}
  // OR
  // {% include '@molecules/teaser-card/teaser-card.twig' %}
  // OR
  // {%
  //   include '@molecules/teaser-card/teaser-card.twig'
  // %}
  findPartials: function(pattern) {
    const matches = pattern.template.match(this.findPartialsRE);
    const filteredMatches =
      matches &&
      matches.filter(match => {
        // Filter out programmatically created includes.
        // i.e. {% include '@namespace/icons/assets/' ~ name ~ '.svg' %}
        return match.indexOf('~') === -1;
      });
    return filteredMatches;
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

  // Given a pattern, and a partial string, tease out the "pattern key" and
  // return it.
  findPartial: function(partialString) {
    try {
      let partial = partialString.match(this.findPartialKeyRE)[0];
      partial = partial.replace(/"/g, '');
      partial = partial.replace(/'/g, '');

      // Check if namespaces is not empty.
      const selectedNamespace = this.namespaces.filter(namespace => {
        // Check to see if this partial contains within the namespace id.
        return partial.indexOf(`@${namespace.id}`) !== -1;
      });

      let namespaceResolvedPartial = '';

      if (selectedNamespace.length > 0) {
        // Loop through all namespaces and try to resolve the namespace to a file path.
        for (
          let index = 0;
          index < selectedNamespace[0].paths.length;
          index++
        ) {
          const path = selectedNamespace[0].paths[index];
          // Replace the name space with the actual path.
          // i.e. @atoms -> source/_patterns/00-atoms
          const tempPartial = partial.replace(
            `@${selectedNamespace[0].id}`,
            path
          );

          try {
            // Check to see if the file exists.
            if (fs.existsSync(tempPartial)) {
              // If it does, find the last directory in the namespace path.
              // i.e. source/_patterns/00-atoms -> 00-atoms.
              const lastDirectory = path.split('/').reverse()[0];
              // Replace the namespace in the path with the directory name.
              // i.e. @atoms/04-images/04-avatar.twig -> 00-atoms/04-images/04-avatar.twig
              namespaceResolvedPartial = partial.replace(
                `@${selectedNamespace[0].id}`,
                lastDirectory
              );
              // After it matches one time, set the resolved partial and exit the loop.
              break;
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
      // Return the path with the namespace resolved OR the regex'd partial.
      return namespaceResolvedPartial || partial;
    } catch (err) {
      console.error(
        'Error occured when trying to find partial name in: ' + partialString
      );
      return null;
    }
  },

  patternMatcher(pattern, regex) {
    return null;
  },
};

module.exports = engine_twig_php;
