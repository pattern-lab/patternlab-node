import { Pattern, PatternLabConfig } from '@pattern-lab/types';
import fs from 'fs-extra';
import path from 'path';
import { EngineLiquid } from './engine-liquid';

describe('EngineLiquid', () => {
  let engine: EngineLiquid;

  beforeEach(() => {
    engine = new EngineLiquid();
  });

  describe('renderPattern()', () => {
    it('should render the pattern with the given data', () => {
      const pattern = {
        template: '<h1>{{title}}</h1>',
        patternPartial: 'test',
      } as Pattern;
      const data = { title: 'Hello, world!' };

      const result = engine.renderPattern(pattern, data);
      expect(result).resolves.toBe('<h1>Hello, world!</h1>');
    });
  });

  describe('findPartials()', () => {
    it('should find all partials in the pattern template', () => {
      const pattern = {
        template: `<section>{% layout 'default-layout.liquid' %}</section>
          <h1>{% include 'header' %}</h1>
          <p>{% include 'body', random_var: 'test' %}</p>
          {% render 'footer.liquid' %}`,
        patternPartial: 'test',
      } as Pattern;
      const result = engine.findPartials(pattern);
      expect(result).toEqual([
        "{% layout 'default-layout.liquid' %}",
        "{% include 'header' %}",
        "{% include 'body', random_var: 'test' %}",
        "{% render 'footer.liquid' %}",
      ]);
    });
  });

  describe('findListItems()', () => {
    it('should find all list items in the pattern template', () => {
      const pattern = {
        template: '{{#listItems.one}}{{label}}{{/listItems.one}}{{#listItems.two}}{{label}}{{/listItems.two}}',
        patternPartial: 'test',
      } as Pattern;
      const result = engine.findListItems(pattern);
      expect(result).toEqual(['{{#listItems.one}}', '{{#listItems.two}}']);
    });
  });

  describe('findPartial()', () => {
    it('should extract the partial name from a partial string', () => {
      const result = engine.findPartial('{{> header}}');
      expect(result).toBe('header');
    });
  });

  describe('spawnMeta()', () => {
    const normalizedExpect = (pathStr: string): string => expect.stringContaining(path.normalize(pathStr));

    it('should spawn the meta pattern data', () => {
      const readSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('File Content');
      const outputSpy = jest.spyOn(fs, 'outputFileSync').mockImplementation(jest.fn);

      const config = {
        paths: { source: { meta: 'source/_meta' } },
      } as PatternLabConfig;

      engine.spawnMeta(config);

      expect(readSpy).toHaveBeenCalledWith(normalizedExpect('engine-liquid/_meta/_head.liquid'), 'utf8');
      expect(readSpy).toHaveBeenCalledWith(normalizedExpect('engine-liquid/_meta/_foot.liquid'), 'utf8');

      expect(outputSpy).toHaveBeenCalledWith(normalizedExpect('source/_meta/_head.liquid'), 'File Content');
      expect(outputSpy).toHaveBeenCalledWith(normalizedExpect('source/_meta/_foot.liquid'), 'File Content');
    });
  });
});
