import { Pattern } from '@pattern-lab/types';
import { TwingLoaderInterface, TwingSource } from 'twing';

export class TwingLoaderPatternLab implements TwingLoaderInterface {
  patterns = new Map<string, Pattern>();

  registerPartial(pattern: Pattern): void {
    if (pattern.patternPartial) {
      this.patterns.set(pattern.patternPartial, pattern);
    }
  }

  getSourceContext(name: string, _from: TwingSource): Promise<TwingSource> {
    const { extendedTemplate, relPath } = this.patterns.get(name) || { extendedTemplate: '' };
    return Promise.resolve(new TwingSource(extendedTemplate, name, relPath));
  }

  getCacheKey(name: string, _from: TwingSource): Promise<string> {
    return Promise.resolve(name);
  }

  isFresh(name: string, _time: number, _from: TwingSource): Promise<boolean> {
    return Promise.resolve(this.patterns.has(name) ? true : false);
  }

  exists(name: string, _from: TwingSource): Promise<boolean> {
    return Promise.resolve(this.patterns.has(name) ? true : false);
  }

  resolve(name: string, _from: TwingSource, _shouldThrow?: boolean): Promise<string> {
    const { relPath } = this.patterns.get(name) || { relPath: '' };
    return Promise.resolve(relPath);
  }
}
