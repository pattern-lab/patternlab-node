import { Pattern, PatternLabConfig } from '@pattern-lab/types';
import fs from 'fs-extra';
import path from 'path';
import { EngineUnderscore } from './engine-underscore';

describe('EngineUnderscore', () => {
  let engine: EngineUnderscore;

  beforeEach(() => {
    engine = new EngineUnderscore();
  });

  describe('renderPattern()', () => {
    it('should register the pattern as a partial', () => {
      const pattern = {
        template: '<h1><%= title %></h1>',
        patternPartial: 'test',
        verbosePartial: 'test-verbose',
      } as Pattern;

      engine.registerPartial(pattern);

      const data = { title: 'Hello, world!' };

      const result = engine.renderPattern(pattern, data);
      expect(result).resolves.toBe('<h1>Hello, world!</h1>');
    });
  });

  describe('findPartials()', () => {
    it('should find all partials in the pattern template', () => {
      const pattern = {
        template: "<h1><%= _.renderNamedPartial('header') %></h1><p><%=_.renderNamedPartial('body')%></p>",
        patternPartial: 'test',
      } as Pattern;
      const result = engine.findPartials(pattern);
      expect(result).toEqual(["<%= _.renderNamedPartial('header') %>", "<%=_.renderNamedPartial('body')%>"]);
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
      const result = engine.findPartial("_.renderNamedPartial('header')");
      expect(result).toBe("_.renderNamedPartial('header')");
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

      expect(readSpy).toHaveBeenCalledWith(normalizedExpect('engine-underscore/_meta/_head.html'), 'utf8');
      expect(readSpy).toHaveBeenCalledWith(normalizedExpect('engine-underscore/_meta/_foot.html'), 'utf8');

      expect(outputSpy).toHaveBeenCalledWith(normalizedExpect('source/_meta/_head.html'), 'File Content');
      expect(outputSpy).toHaveBeenCalledWith(normalizedExpect('source/_meta/_foot.html'), 'File Content');
    });
  });
});
