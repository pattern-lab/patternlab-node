import { PatternLabConfig } from '@pattern-lab/types';
import fs from 'fs-extra';
import path from 'path';
import { EngineTwigPhp } from './engine-twig-php';

describe('EngineTwigPhp', () => {
  let engine: EngineTwigPhp;

  beforeEach(() => {
    engine = new EngineTwigPhp();
  });

  // TODO: implement this test
  // describe('renderPattern()', () => {
  //   it('should render the pattern with the given data', () => {
  //     const pattern = {
  //       template: '<h1>{{title}}</h1>',
  //       patternPartial: 'test',
  //     } as Pattern;
  //     const data = { title: 'Hello, world!' };

  //     const result = engine.renderPattern(pattern, data);
  //     expect(result).resolves.toBe('<h1>Hello, world!</h1>');
  //   });
  // });

  // TODO: implement this test
  // describe('registerPartial()', () => {
  //   it('should register the pattern as a partial', () => {
  //     const pattern = {
  //       template: '<h1>{{title}}</h1>',
  //       patternPartial: 'test',
  //       verbosePartial: 'test-verbose',
  //     } as Pattern;

  //     engine.registerPartial(pattern);

  //     const patternWithPartial = {
  //       template: '<div>{{> test}}</div>',
  //     } as Pattern;
  //     const data = { title: 'Hello, world!' };

  //     const result = engine.renderPattern(patternWithPartial, data);
  //     expect(result).resolves.toBe('<div><h1>Hello, world!</h1></div>');
  //   });
  // });

  // TODO: implement this test
  // describe('findPartials()', () => {
  //   it('should find all partials in the pattern template', () => {
  //     const pattern = {
  //       template: '<h1>{{> header}}</h1><p>{{> body}}</p>',
  //       patternPartial: 'test',
  //     } as Pattern;
  //     const result = engine.findPartials(pattern);
  //     expect(result).toEqual(['{{> header}}', '{{> body}}']);
  //   });
  // });

  // TODO: implement this test
  // describe('findPartial()', () => {
  //   it('should extract the partial name from a partial string', () => {
  //     const result = engine.findPartial("{% include '@global/header' %}");
  //     expect(result).toBe('header');
  //   });
  // });

  describe('spawnMeta()', () => {
    const normalizedExpect = (pathStr: string): string => expect.stringContaining(path.normalize(pathStr));

    it('should spawn the meta pattern data', () => {
      const readSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('File Content');
      const outputSpy = jest.spyOn(fs, 'outputFileSync').mockImplementation(jest.fn);

      const config = {
        paths: { source: { meta: 'source/_meta' } },
      } as PatternLabConfig;

      engine.spawnMeta(config);

      expect(readSpy).toHaveBeenCalledWith(normalizedExpect('engine-twig-php/_meta/_head.twig'), 'utf8');
      expect(readSpy).toHaveBeenCalledWith(normalizedExpect('engine-twig-php/_meta/_foot.twig'), 'utf8');

      expect(outputSpy).toHaveBeenCalledWith(normalizedExpect('source/_meta/_head.twig'), 'File Content');
      expect(outputSpy).toHaveBeenCalledWith(normalizedExpect('source/_meta/_foot.twig'), 'File Content');
    });
  });
});
