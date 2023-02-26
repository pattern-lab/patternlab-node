/*
 * Twig PHP pattern engine for patternlab-node
 *
 * Evan Lovely
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 * ENGINE SUPPORT LEVEL: Experimental
 */

import TwigRenderer from '@basalt/twig-renderer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import {
  Pattern,
  PatternData,
  PatternEngineConfigTwigPhp,
  PatternEngineNamespaceOptions,
  PatternLabConfig,
  PatternLabEngine,
  PatternPartial,
} from '@pattern-lab/types';

export class EngineTwigPhp implements PatternLabEngine {
  private engine!: TwigRenderer;
  engineName = 'twig-php';
  engineFileExtension = ['.twig'];
  expandPartials = false;

  findPartialsRE =
    /{[%{]\s*.*?(?:extends|include|embed|from|import|use)\(?\s*['"](.+?)['"][\s\S]*?\)?\s*[%}]}/g;

  namespaces: PatternEngineNamespaceOptions[] = [];
  patternLabConfig?: PatternLabConfig;

  renderPattern(pattern: Pattern, data: PatternData, _partials?: PatternPartial): Promise<string> {
    return new Promise((resolve, reject) => {
      // If this is a pseudo pattern the relPath will be incorrect.
      // i.e. /path/to/pattern.json
      // Twig can't render that file so we need to use the base patterns
      // relPath instead.
      const relPath = pattern.isPseudoPattern ? pattern.basePattern.relPath : pattern.relPath;

      const patternPath =
        this.patternLabConfig && path.isAbsolute(relPath)
          ? path.relative(this.patternLabConfig.paths.source.root, relPath)
          : relPath;
      let details = '';
      if (this.patternLabConfig?.logLevel === 'debug') {
        details = `<details><pre><code>${JSON.stringify({ pattern, data }, null, '  ')}</code></pre></details>`;
      }

      this.engine
        .render(patternPath, data)
        .then((results) => {
          if (results.ok) {
            resolve(results.html + details);
          } else {
            // make Twig rendering errors more noticeable + exit when not in dev mode (or running the `patternlab serve` command)
            if (process.argv.slice(1).includes('serve') || process.env['NODE_ENV'] === 'development') {
              reject(chalk.red(results.message));
            } else {
              console.log(chalk.red(results.message));
              process.exit(1);
            }
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  registerPartial(_pattern: Pattern): void {
    // no-op
  }

  findPartials(pattern: Pattern): RegExpMatchArray | null {
    const matches = pattern.template.match(this.findPartialsRE);
    const filteredMatches = matches?.filter((match) => {
      // Filter out programmatically created includes.
      // i.e. {% include '@namespace/icons/assets/' ~ name ~ '.svg' %}
      return match.indexOf('~') === -1;
    }) as RegExpMatchArray | undefined;
    return filteredMatches || null;
  }

  findPartialsWithPatternParameters(_pattern: Pattern): RegExpMatchArray | null {
    return null;
  }

  findListItems(_pattern: Pattern): RegExpMatchArray | null {
    return null;
  }

  findPartial(partialString: string): string {
    try {
      const partial = partialString.replace(this.findPartialsRE, '$1');

      // Check if namespaces is not empty.
      const selectedNamespace = this.namespaces.filter((namespace) => {
        // Check to see if this partial contains within the namespace id.
        return partial.indexOf(`@${namespace.id}`) !== -1;
      });

      let namespaceResolvedPartial = '';

      if (selectedNamespace.length > 0) {
        // Loop through all namespaces and try to resolve the namespace to a file path.
        for (let index = 0; index < selectedNamespace[0].paths.length; index++) {
          const patternPath =
            this.patternLabConfig && path.isAbsolute(selectedNamespace[0].paths[index])
              ? path.relative(this.patternLabConfig.paths.source.root, selectedNamespace[0].paths[index])
              : selectedNamespace[0].paths[index];

          // Replace the name space with the actual path.
          // i.e. @atoms -> source/_patterns/atoms
          const tempPartial = path.join(
            process.cwd(),
            partial.replace(`@${selectedNamespace[0].id}`, patternPath),
          );

          try {
            // Check to see if the file actually exists.
            if (fs.existsSync(tempPartial)) {
              // get the path to the top-level folder of this pattern
              // ex. /Users/bradfrost/sites/pattern-lab/packages/edition-twig/source/_patterns/atoms
              const fullFolderPath = `${tempPartial.split(selectedNamespace[0].paths[index])[0]}${
                selectedNamespace[0].paths[index]
              }`;

              // then tease out the folder name itself (including the # prefix)
              // ex. atoms
              const folderName = path.parse(fullFolderPath).base;

              // finally, return the Twig path we created from the full file path
              // ex. atoms/buttons/button.twig
              const fullIncludePath = tempPartial.replace(
                tempPartial.split(`${folderName}${tempPartial.split(folderName)[1]}`)[0],
                '',
              );

              namespaceResolvedPartial = fullIncludePath;

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
      console.error('Error occured when trying to find partial name in: ' + partialString);
      return '';
    }
  }

  private spawnFile(config: PatternLabConfig, fileName: string): void {
    const metaFilePath = path.resolve(config.paths.source.meta, fileName);
    try {
      fs.statSync(metaFilePath);
    } catch (err) {
      //not a file, so spawn it from the included file
      const metaFileContent = fs.readFileSync(path.resolve(__dirname, '..', '..', '_meta/', fileName), 'utf8');
      fs.outputFileSync(metaFilePath, metaFileContent);
    }
  }

  spawnMeta(config: PatternLabConfig): void {
    this.spawnFile(config, '_head.twig');
    this.spawnFile(config, '_foot.twig');
  }

  usePatternLabConfig(config: PatternLabConfig): void {
    this.patternLabConfig = config;

    if (!config.engines?.['twig-php']) {
      console.error('Missing "twig-php" in Pattern Lab config file; exiting...');
      process.exit(1);
    }

    const engineConfig: Partial<PatternEngineConfigTwigPhp> | undefined = config.engines?.[
      'twig-php'
    ] as PatternEngineConfigTwigPhp;

    const { namespaces, alterTwigEnv, relativeFrom, ...rest } = engineConfig;

    // since package is a reserved word in node, we need to delete it from the config object like this
    delete rest.package;
    delete rest.fileExtensions;

    // Schema on config object being passed in:
    // https://github.com/basaltinc/twig-renderer/blob/master/config.schema.json
    this.engine = new TwigRenderer({
      src: {
        roots: [config.paths.source.root, config.paths.source.patterns],
        namespaces,
      },
      relativeFrom,
      alterTwigEnv,
      ...rest,
    });

    // Preserve the namespaces (after recursively adding nested folders) from the config so we can use them later to evaluate partials.
    this.namespaces = this.engine.config.src.namespaces || [];
  }
}
