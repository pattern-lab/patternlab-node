/*
 * Nunjucks pattern engine for patternlab-node
 *
 * Dan White.
 * Licensed under the MIT license.
 *
 * ENGINE SUPPORT LEVEL:
 *
 * Mostly full. Partial calls and lineage hunting are supported.
 * Nunjucks does not support the mustache-specific syntax
 * extensions, style modifiers and pattern parameters, because
 * their use cases are addressed by the core Nunjucks feature set.
 * Pattern Lab's listitems feature is still written in the
 * mustache syntax.
 *
 */

import { PatternLabEngine, Pattern, PatternData, PatternLabConfig, PatternPartial } from '@pattern-lab/types';
import fs from 'fs-extra';
import path from 'path';
import nunjucks from 'nunjucks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function require(moduleName: string): any;

const partialRegistry: Record<string, string> = {};

class PatternLoader implements nunjucks.ILoader {
  constructor(private config: PatternLabConfig) {}

  getSource(name: string): nunjucks.LoaderSource {
    const fullPath = path.resolve(this.config.paths.source.patterns, partialRegistry[name]);
    return {
      src: fs.readFileSync(fullPath, 'utf-8'),
      path: fullPath,
      noCache: true,
    };
  }
}

export class EngineNunjucks implements PatternLabEngine {
  engineName = 'nunjucks';
  engineFileExtension = ['.njk'];
  expandPartials = false;

  env?: nunjucks.Environment;

  // regexes, stored here so they're only compiled once
  private findPartialsRE = /{%\s*(?:extends|include|import|from)\s+(?:'[^']+'|"[^"]+").*%}/g;
  private findPartialKeyRE = /{%\s*(?:extends|include|import|from)\s+('[^']+'|"[^"]+")/;
  // still requires mustache style syntax because of how PL implements lists
  private findListItemsRE =
    /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g;

  renderPattern(pattern: Pattern, data: PatternData, _partials?: PatternPartial): Promise<string> {
    try {
      const result = this.env?.renderString(pattern.extendedTemplate, data);
      return Promise.resolve(result || '');
    } catch (err) {
      console.error('Failed to render pattern: ' + pattern.name);
      console.error(err);
    }

    return Promise.resolve('');
  }

  registerPartial(pattern: Pattern): void {
    // only register each partial once. Otherwise we'll eat up a ton of memory.
    if (!partialRegistry[pattern.patternPartial]) {
      partialRegistry[pattern.patternPartial] = pattern.relPath.replace(/\\/g, '/');
    }
  }

  findPartials(pattern: Pattern): RegExpMatchArray | null {
    return pattern.template.match(this.findPartialsRE);
  }

  findPartialsWithPatternParameters(_pattern: Pattern): RegExpMatchArray | null {
    return null;
  }

  findListItems(pattern: Pattern): RegExpMatchArray | null {
    const matches = pattern.template.match(this.findListItemsRE);
    return matches;
  }

  findPartial(partialString: string): string {
    try {
      const partial = partialString.match(this.findPartialKeyRE)?.[1];
      return partial?.replace(/["']/g, '') || '';
    } catch (err) {
      console.error('Error occured when trying to find partial name in:', partialString);
    }

    return '';
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
    this.spawnFile(config, '_head.njk');
    this.spawnFile(config, '_foot.njk');
  }

  usePatternLabConfig(config: PatternLabConfig): void {
    // Create Pattern Loader
    // Since Pattern Lab includes are not path based we need a custom loader for Nunjucks.
    this.env = new nunjucks.Environment(new PatternLoader(config));

    let helpers: string[] = [];

    try {
      // Look for helpers in the config
      const extend = config.engines?.['nunjucks'].extend;
      helpers = (typeof extend === 'string' ? [extend] : extend) ?? [];
    } catch (error) {
      // No defined path(s) found, look in default location
      const configPath = 'patternlab-nunjucks-config.js';
      if (fs.existsSync(path.join(process.cwd(), configPath))) {
        helpers = [configPath];
      }
    }

    if (helpers) {
      helpers.forEach((extensionPath) => {
        // Load any user Defined configurations
        const nunjucksConfigPath = path.join(process.cwd(), extensionPath);

        try {
          const nunjucksConfig = require(nunjucksConfigPath);
          if (typeof nunjucksConfig === 'function') {
            nunjucksConfig(this.env);
          } else {
            console.error(`Failed to load Nunjucks extension: Expected ${extensionPath} to export a function.`);
          }
        } catch (err) {
          console.error(`Failed to load Nunjucks extension ${nunjucksConfigPath}.`);
        }
      });
    }
  }
}
