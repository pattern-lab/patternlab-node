/*
 * twig pattern engine for patternlab-node - v0.15.1 - 2015
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 * ENGINE SUPPORT LEVEL:
 *
 * Full. Partial calls and lineage hunting are supported. Twig does not support
 * the mustache-specific syntax extensions, style modifiers and pattern
 * parameters, because their use cases are addressed by the core Twig feature
 * set.
 *
 */

import {
  Pattern,
  PatternData,
  PatternEngineConfigTwig,
  PatternLabConfig,
  PatternLabEngine,
} from '@pattern-lab/types';
import fs from 'fs-extra';
import path from 'path';
import { TwingEnvironment, TwingLoaderChain, TwingLoaderFilesystem } from 'twing';
import { TwingLoaderPatternLab } from './twing-loader';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function require(moduleName: string): any;

const fileSystemLoader = new TwingLoaderFilesystem();
const patternLabLoader = new TwingLoaderPatternLab();
const chainLoader = new TwingLoaderChain([fileSystemLoader, patternLabLoader]);

export class EngineTwig implements PatternLabEngine {
  private engine = new TwingEnvironment(chainLoader);
  engineName = 'twig';
  engineFileExtension = ['.twig'];
  expandPartials = false;

  metaPath?: string;
  patternLabConfig?: PatternLabConfig;

  // regexes, stored here so they're only compiled once
  findPartialsRE =
    /{[%{]\s*.*?(?:extends|include|embed|from|import|use)\(?\s*['"](.+?)['"][\s\S]*?\)?\s*[%}]}/g;
  findListItemsRE =
    /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g;

  renderPattern(pattern: Pattern, data: PatternData): Promise<string> {
    let patternPath = pattern.basePattern?.relPath || pattern.relPath;
    if (this.metaPath && patternPath.lastIndexOf(this.metaPath) === 0) {
      patternPath = patternPath.substring(this.metaPath.length + 1);
    }
    return Promise.resolve(this.engine.render(patternPath, data));
  }

  registerPartial(pattern: Pattern): void {
    console.log(`registerPartial(${pattern.name} - ${pattern.patternPartial} - ${pattern.relPath})`);
    patternLabLoader.registerPartial(pattern);
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

  findListItems(pattern: Pattern): RegExpMatchArray | null {
    return pattern.template.match(this.findListItemsRE);
  }

  findPartial(partialString: string): string {
    try {
      const partial = partialString.replace(this.findPartialsRE, '$1');

      // Check if namespaces is not empty.
      const [selectedNamespace] = fileSystemLoader.getNamespaces().filter((namespace) => {
        // Check to see if this partial contains within the namespace id.
        return partial.indexOf(`@${namespace}`) !== -1;
      });

      let namespaceResolvedPartial = '';

      if (selectedNamespace.length > 0) {
        // Loop through all namespaces and try to resolve the namespace to a file path.
        const namespacePaths = fileSystemLoader.getPaths(selectedNamespace);

        for (let index = 0; index < namespacePaths.length; index++) {
          const patternPath =
            this.patternLabConfig && path.isAbsolute(namespacePaths[index])
              ? path.relative(this.patternLabConfig?.paths.source.root, namespacePaths[index])
              : namespacePaths[index];

          // Replace the name space with the actual path.
          // i.e. @atoms -> source/_patterns/atoms
          const tempPartial = path.join(process.cwd(), partial.replace(`@${selectedNamespace}`, patternPath));

          try {
            // Check to see if the file actually exists.
            if (fs.existsSync(tempPartial)) {
              // get the path to the top-level folder of this pattern
              // ex. /Users/bradfrost/sites/pattern-lab/packages/edition-twig/source/_patterns/atoms
              const fullFolderPath = `${tempPartial.split(namespacePaths[index])[0]}${namespacePaths[index]}`;

              // then tease out the folder name itself (including the # prefix)
              // ex. atoms
              const folderName = fullFolderPath.substring(
                fullFolderPath.lastIndexOf('/') + 1,
                fullFolderPath.length,
              );

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
      console.error('Error occurred when trying to find partial name in: ' + partialString);
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
    this.metaPath = path.resolve(config.paths.source.meta);
    // Global paths
    fileSystemLoader.addPath(config.paths.source.meta);
    fileSystemLoader.addPath(config.paths.source.patterns);

    const engineConfig: PatternEngineConfigTwig | undefined = config.engines?.[
      'twig'
    ] as PatternEngineConfigTwig;

    // Namespaced paths
    if (engineConfig?.namespaces) {
      const namespaces = engineConfig.namespaces;
      Object.keys(namespaces).forEach((key) => {
        fileSystemLoader.addPath(namespaces[key], key);
      });
    }

    // add twing extensions
    if (engineConfig?.loadExtensionsFile) {
      const extensionsFile = path.resolve('./', engineConfig.loadExtensionsFile);
      if (fs.pathExistsSync(extensionsFile)) {
        try {
          const extensionsMap = require(extensionsFile);
          this.engine.addExtensions(extensionsMap);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}
