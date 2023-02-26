/*
 * mustache pattern engine for patternlab-node
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
 * Full + extensions. Partial calls and lineage hunting are supported. Style
 * modifiers and pattern parameters are used to extend the core feature set of
 * Mustache templates.
 *
 */

import { PatternLabEngine, Pattern, PatternData, PatternLabConfig } from '@pattern-lab/types';
import fs from 'fs-extra';
import path from 'path';
import {
  listItemsRE,
  partialsRE,
  partialsWithPatternParametersRE,
  partialsWithStyleModifiersRE,
} from './utilities/mustache.util';
import Mustache from 'mustache';

export class EngineMustache implements PatternLabEngine {
  private engine = Mustache;
  engineName = 'mustache';
  engineFileExtension = ['.mustache'];
  expandPartials = true;

  renderPattern(pattern: Pattern, data: PatternData): Promise<string> {
    try {
      return Promise.resolve(this.engine.render(pattern.extendedTemplate, data));
    } catch (e) {
      console.log('e = ', e);
      return Promise.reject(e);
    }
  }

  registerPartial(_pattern: Pattern): void {
    // no-op
  }

  findPartials(pattern: Pattern): RegExpMatchArray | null {
    return this.patternMatcher(pattern, partialsRE);
  }

  findPartialsWithPatternParameters(pattern: Pattern): RegExpMatchArray | null {
    return this.patternMatcher(pattern, partialsWithPatternParametersRE);
  }

  findPartialsWithStyleModifiers(pattern: Pattern): RegExpMatchArray | null {
    return this.patternMatcher(pattern, partialsWithStyleModifiersRE);
  }

  findListItems(pattern: Pattern): RegExpMatchArray | null {
    return this.patternMatcher(pattern, listItemsRE);
  }

  findPartial(partialString: string): string {
    //strip out the template cruft
    let foundPatternPartial = partialString
      .replace('{{> ', '')
      .replace(' }}', '')
      .replace('{{>', '')
      .replace('}}', '');

    // remove any potential pattern parameters. this and the above are rather brutish but I didn't want to do a regex at the time
    if (foundPatternPartial.indexOf('(') > 0) {
      foundPatternPartial = foundPatternPartial.substring(0, foundPatternPartial.indexOf('('));
    }

    //remove any potential stylemodifiers.
    return foundPatternPartial.split(':')[0];
  }

  private spawnFile(config: PatternLabConfig, fileName: string): void {
    const paths = config.paths;
    const metaFilePath = path.resolve(paths.source.meta, fileName);
    try {
      fs.statSync(metaFilePath);
    } catch (err) {
      //not a file, so spawn it from the included file
      const metaFileContent = fs.readFileSync(path.resolve(__dirname, '..', '..', '_meta/', fileName), 'utf8');
      fs.outputFileSync(metaFilePath, metaFileContent);
    }
  }

  spawnMeta(config: PatternLabConfig): void {
    this.spawnFile(config, '_head.mustache');
    this.spawnFile(config, '_foot.mustache');
  }

  usePatternLabConfig(_config: PatternLabConfig): void {
    // no-op
  }

  /**
   * Find regex matches within both pattern strings and pattern objects.
   *
   * @param {string|object} pattern Either a string or a pattern object.
   * @param {object} regex A JavaScript RegExp object.
   * @returns {array|null} An array if a match is found, null if not.
   */
  private patternMatcher(pattern: string | Pattern, regex: RegExp): RegExpMatchArray | null {
    let matches;
    if (typeof pattern === 'string') {
      matches = pattern.match(regex);
    } else if (typeof pattern === 'object' && typeof pattern.template === 'string') {
      matches = pattern.template.match(regex);
    }
    return matches ?? null;
  }
}
