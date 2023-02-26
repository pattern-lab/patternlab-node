/*
 * handlebars pattern engine for patternlab-node
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
 * Full. Partial calls and lineage hunting are supported. Handlebars does not
 * support the mustache-specific syntax extensions, style modifiers and pattern
 * parameters, because their use cases are addressed by the core Handlebars
 * feature set. It also does not support verbose partial syntax, because it
 * seems like it can't tolerate slashes in partial names. But honestly, did you
 * really want to use the verbose syntax anyway? I don't.
 *
 */

import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import glob from 'glob';
import { PatternLabEngine, Pattern, PatternData, PatternLabConfig, PatternPartial } from '@pattern-lab/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function require(moduleName: string): any;

const findPartialsRE = /{{#?>\s*([\w-/.]+)(?:.|\s+)*?}}/g;
const findListItemsRE =
  /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g;
const findAtPartialBlockRE = /{{#?>\s*@partial-block\s*}}/g;

export class EngineHandlebars implements PatternLabEngine {
  private engine = Handlebars;
  engineName = 'handlebars';
  engineFileExtension = ['.hbs', '.handlebars'];
  expandPartials = false;

  renderPattern(pattern: Pattern, data: PatternData, partials?: PatternPartial): Promise<string> {
    if (partials) {
      this.engine.registerPartial(partials);
    }

    const compiled = this.engine.compile(this.escapeAtPartialBlock(pattern.template));

    return Promise.resolve(compiled(data));
  }

  registerPartial(pattern: Pattern): void {
    this.engine.registerPartial(pattern.patternPartial, pattern.template);
    this.engine.registerPartial(pattern.verbosePartial, pattern.template);
  }

  findPartials(pattern: Pattern): RegExpMatchArray | null {
    const matches = pattern.template.match(findPartialsRE);
    return matches;
  }

  findPartialsWithPatternParameters(): RegExpMatchArray | null {
    return null;
  }

  findListItems(pattern: Pattern): RegExpMatchArray | null {
    const matches = pattern.template.match(findListItemsRE);
    return matches;
  }

  findPartial(partialString: string): string {
    const partial = partialString.replace(findPartialsRE, '$1');
    return partial;
  }

  private spawnFile(config: PatternLabConfig, fileName: string): void {
    const paths = config.paths;
    const metaFilePath = path.resolve(paths.source.meta, fileName);
    try {
      fs.statSync(metaFilePath);
    } catch (err) {
      const metaFileContent = fs.readFileSync(path.resolve(__dirname, '..', '..', '_meta/', fileName), 'utf8');
      fs.outputFileSync(metaFilePath, metaFileContent);
    }
  }

  /**
   * Checks to see if the _meta directory has engine-specific head and foot files,
   * spawning them if not found.
   *
   * @param {object} config - the global config object from core, since we won't
   * assume it's already present
   */
  spawnMeta(config: PatternLabConfig): void {
    this.spawnFile(config, '_head.hbs');
    this.spawnFile(config, '_foot.hbs');
  }

  /**
   * Accept a Pattern Lab config object from the core and use the settings to
   * load helpers.
   *
   * @param {object} config - the global config object from core
   */
  usePatternLabConfig(config: PatternLabConfig): void {
    let helpers: string[] = [];

    try {
      // Look for helpers in the config
      const extend = config.engines?.['handlebars'].extend;
      helpers = (typeof extend === 'string' ? [extend] : extend) ?? [];
    } catch (error) {
      // Look for helpers in default location
      const configPath = 'patternlab-handlebars-config.js';
      if (fs.existsSync(path.join(process.cwd(), configPath))) {
        helpers = [configPath];
      }
    }

    // Load helpers if they were found
    if (helpers) {
      this.loadHelpers(helpers);
    }
  }

  private loadHelpers(helpers: string[]): void {
    helpers.forEach((globPattern) => {
      glob.sync(globPattern).forEach((filePath) => {
        require(path.join(process.cwd(), filePath))(this.engine);
      });
    });
  }

  private escapeAtPartialBlock(partialString: string): string {
    const partial = partialString.replace(findAtPartialBlockRE, '&#123;{> @partial-block }&#125;');
    return partial;
  }
}
