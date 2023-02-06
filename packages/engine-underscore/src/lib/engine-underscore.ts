/*
 * underscore pattern engine for patternlab-node - v0.15.1 - 2015
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 * ENGINE SUPPORT LEVEL:
 *
 * Basic. We can't call partials from inside underscore templates yet, but we
 * can render templates with backing JSON.
 *
 */

import { Pattern, PatternData, PatternLabConfig, PatternLabEngine, PatternPartial } from '@pattern-lab/types';
import fs from 'fs-extra';
import path from 'path';
import _, { CompiledTemplate } from 'underscore';

const partialRegistry: Record<string, CompiledTemplate> = {};

const errorStyling = `
<style>
  .plError {
    background: linear-gradient(to bottom, #f1f1f1 0%,#ffffff 60%);
    color: #444;
    padding: 30px;
  }
  .plError h1 {
    font-size: 16pt;
    color: #733;
    background: #fcfcfc;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 17px 30px;
    margin: -30px -30px 0 -30px;
  }
  .plError dt { font-weight: bold; }
</style>
`;

// extend underscore with partial-ing methods and other necessary tooling
// HANDLESCORE! UNDERBARS!

const addParentContext = (data: unknown, currentContext: unknown): unknown => {
  return Object.assign({}, currentContext, data);
};

_.mixin({
  renderPartial: (compiledPartial: CompiledTemplate, dataIn: unknown, currentContext: unknown) => {
    let data: unknown = dataIn || {};

    if (dataIn && currentContext && dataIn instanceof Object && currentContext instanceof Object) {
      data = addParentContext(data, currentContext);
    }

    return compiledPartial(data);
  },

  renderNamedPartial: (partialKey: string, data: unknown, currentContext: string) => {
    const compiledPartial = partialRegistry[partialKey];
    if (typeof compiledPartial !== 'function') {
      throw `Pattern ${partialKey} not found.`;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - registered via mixin
    return _.renderPartial(compiledPartial, data, currentContext);
  },

  getPath: (pathString: string, _currentContext: string, debug: boolean) => {
    try {
      const result = eval('currentContext.' + pathString);
      if (debug) {
        console.log('getPath result = ', result);
      }
      return result;
    } catch (e) {
      return null;
    }
  },
});

export class EngineUnderscore implements PatternLabEngine {
  engine = _;
  engineName = 'underscore';
  engineFileExtension = ['.html', '.underscore'];

  expandPartials = false;

  // regexes, stored here so they're only compiled once
  findPartialsRE = /<%=\s*_\.renderNamedPartial[ \t]*\(\s*("(?:[^"].*?)"|'(?:[^'].*?)').*?%>/g; // TODO
  findListItemsRE =
    /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g;

  renderPattern(pattern: Pattern, data: PatternData, partials?: PatternPartial | undefined): Promise<string> {
    let renderedHTML: string;
    let compiled: CompiledTemplate | null = null;

    try {
      compiled = partialRegistry[pattern.patternPartial];
    } catch (e) {
      console.log(`Error looking up underscore template ${pattern.patternName}:`, pattern.extendedTemplate, e);
    }

    // This try-catch is necessary because references to undefined variables
    // in underscore templates are eval()ed directly as javascript, and as
    // such will throw very real exceptions that will shatter the whole build
    // process if we don't handle them.
    try {
      if (compiled) {
        renderedHTML = compiled(
          _.extend(data || {}, {
            _allData: data,
            _partials: partials,
          }),
        );
      } else {
        renderedHTML = this.renderError(pattern, new Error());
      }
    } catch (e: any) {
      renderedHTML = this.renderError(pattern, e);
    }

    return Promise.resolve(renderedHTML);
  }

  private renderError(pattern: Pattern, error: Error): string {
    const errorMessage = `Error rendering underscore pattern "${pattern.patternName}" (${
      pattern.relPath
    }): [${error.toString()}]`;
    console.log(errorMessage);
    return `${errorStyling} <div class="plError">
      <h1>Error rendering underscore pattern "${pattern.patternName}"</h1>
        <dl>
          <dt>Message</dt><dd>${error.toString()}</dd>
          <dt>Partial name</dt><dd>${pattern.patternName}</dd>
          <dt>Template path</dt><dd>${pattern.relPath}</dd>
        </dl>
      </div>`;
  }

  registerPartial(pattern: Pattern): void {
    try {
      partialRegistry[pattern.patternPartial] = _.template(pattern.extendedTemplate || pattern.template);
    } catch (e) {
      console.log(`Error compiling underscore template ${pattern.patternName}:`, pattern.extendedTemplate, e);
    }
  }

  findPartials(pattern: Pattern): RegExpMatchArray | null {
    const matches = pattern.template.match(this.findPartialsRE);
    return matches;
  }

  findPartialsWithPatternParameters(_pattern: Pattern): RegExpMatchArray | null {
    return null;
  }

  findListItems(pattern: Pattern): RegExpMatchArray | null {
    return pattern.template.match(this.findListItemsRE);
  }

  findPartial(partialString: string): string {
    const edgeQuotesMatcher = /^["']|["']$/g;
    const partialIDWithQuotes = partialString.replace(this.findPartialsRE, '$1');
    return partialIDWithQuotes.replace(edgeQuotesMatcher, '');
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
    this.spawnFile(config, '_head.html');
    this.spawnFile(config, '_foot.html');
  }

  usePatternLabConfig(_config: PatternLabConfig): void {
    // no-op
  }
}
