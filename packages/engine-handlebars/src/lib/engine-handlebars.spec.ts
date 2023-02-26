import { Pattern, PatternLabConfig } from '@pattern-lab/types';
import { EngineHandlebars } from './engine-handlebars';
import fs from 'fs-extra';
import path from 'path';

describe('EngineHandlebars', () => {
  let engine: EngineHandlebars;

  beforeEach(() => {
    engine = new EngineHandlebars();
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

  describe('registerPartial()', () => {
    it('should register the pattern as a partial', () => {
      const pattern = {
        template: '<h1>{{title}}</h1>',
        patternPartial: 'test',
        verbosePartial: 'test-verbose',
      } as Pattern;

      engine.registerPartial(pattern);

      const patternWithPartial = {
        template: '<div>{{> test}}</div>',
      } as Pattern;
      const data = { title: 'Hello, world!' };

      const result = engine.renderPattern(patternWithPartial, data);
      expect(result).resolves.toBe('<div><h1>Hello, world!</h1></div>');
    });
  });

  describe('findPartials()', () => {
    it('should find all partials in the pattern template', () => {
      const pattern = {
        template: '<h1>{{> header}}</h1><p>{{> body}}</p>',
        patternPartial: 'test',
      } as Pattern;
      const result = engine.findPartials(pattern);
      expect(result).toEqual(['{{> header}}', '{{> body}}']);
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

      expect(readSpy).toHaveBeenCalledWith(normalizedExpect('engine-handlebars/_meta/_head.hbs'), 'utf8');
      expect(readSpy).toHaveBeenCalledWith(normalizedExpect('engine-handlebars/_meta/_foot.hbs'), 'utf8');

      expect(outputSpy).toHaveBeenCalledWith(normalizedExpect('source/_meta/_head.hbs'), 'File Content');
      expect(outputSpy).toHaveBeenCalledWith(normalizedExpect('source/_meta/_foot.hbs'), 'File Content');
    });
  });
});
