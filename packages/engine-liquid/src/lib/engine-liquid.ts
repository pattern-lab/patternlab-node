/*
 * Liquid pattern engine for patternlab-node - v2.X.X - 2017
 *
 * Cameron Roe
 * Licensed under the MIT license.
 *
 */

import { PatternLabEngine, Pattern, PatternData, PatternLabConfig, PatternPartial } from '@pattern-lab/types';
import fs from 'fs-extra';
import { Liquid } from 'liquidjs';
import path from 'path';
import {
  listItemsRE,
  partialsRE,
  partialsWithPatternParametersRE,
  partialsWithStyleModifiersRE,
} from './utilities/liquid.util';

export class EngineLiquid implements PatternLabEngine {
  private engine = new Liquid({ dynamicPartials: false });
  engineName = 'liquid';
  engineFileExtension = ['.liquid', '.html'];
  expandPartials = false;

  renderPattern(pattern: Pattern, data: PatternData, _partials?: PatternPartial): Promise<string> {
    return this.engine
      .parseAndRender(pattern.template, data)
      .then(function (html) {
        return html;
      })
      .catch(function (ex) {
        console.log(40, ex);
      });
  }

  registerPartial(_pattern: Pattern): void {
    // no-op
  }

  findPartials(pattern: Pattern): RegExpMatchArray | null {
    return this.patternMatcher(pattern, partialsRE);
  }

  findPartialsWithStyleModifiers(pattern: Pattern): RegExpMatchArray | null {
    return this.patternMatcher(pattern, partialsWithStyleModifiersRE);
  }

  findPartialsWithPatternParameters(pattern: Pattern): RegExpMatchArray | null {
    return this.patternMatcher(pattern, partialsWithPatternParametersRE);
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

  spawnFile(config: PatternLabConfig, fileName: string): void {
    const paths = config.paths;
    const metaFilePath = path.resolve(paths.source.meta, fileName);

    try {
      fs.statSync(metaFilePath);
    } catch (err) {
      //not a file, so spawn it from the included file
      const metaFileContent = fs.readFileSync(path.resolve(__dirname, '..', '_meta/', fileName), 'utf8');
      fs.outputFileSync(metaFilePath, metaFileContent);
    }
  }

  spawnMeta(config: PatternLabConfig): void {
    this.spawnFile(config, '_head.liquid');
    this.spawnFile(config, '_foot.liquid');
  }

  usePatternLabConfig(config: PatternLabConfig): void {
    // create new reference
    let patternsPath = String(config.paths.source.patterns);

    if (patternsPath.slice(-1) === '/') {
      patternsPath = patternsPath.slice(0, -1);
    }

    const allPaths = this.getDirectories(patternsPath).reduce(
      (allDirs, dir) => allDirs.concat(this.getDirectories(dir)),
      [] as string[],
    );

    this.engine = new Liquid({
      dynamicPartials: false,
      root: allPaths,
    });
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

  private isDirectory = (source: string): boolean => fs.lstatSync(source).isDirectory();

  private getDirectories = (source: string): string[] =>
    fs
      .readdirSync(source)
      .map((name) => path.join(source, name))
      .filter(this.isDirectory);
}
