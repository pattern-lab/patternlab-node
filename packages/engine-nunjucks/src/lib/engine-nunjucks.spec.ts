import { engineNunjucks } from './engine-nunjucks';

describe('engineNunjucks', () => {
  it('should work', () => {
    expect(engineNunjucks()).toEqual('engine-nunjucks');
  });
});
