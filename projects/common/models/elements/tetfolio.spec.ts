import { environment } from 'common/environment';
import { TetfolioElement } from 'common/models/elements/tetfolio';

describe('TetfolioElement', () => {
  beforeEach(() => {
    environment.strictInstantiation = false;
  });

  afterEach(() => {
    environment.strictInstantiation = false;
  });

  it('should apply the registry defaults', () => {
    const element = new TetfolioElement({ type: 'tetfolio', id: 'tetfolio_1', alias: 'tetfolio_1' });
    expect(element.htmlContent).toBe('');
    expect(element.state).toBeNull();
    expect(element.dimensions.width).toBe(900);
    expect(element.dimensions.height).toBe(400);
    expect(element.styling).toEqual({});
  });

  it('should take over the blueprint values', () => {
    const element = new TetfolioElement({
      type: 'tetfolio',
      id: 'tetfolio_1',
      alias: 'tetfolio_1',
      htmlContent: '<html></html>',
      state: '{"key":"value"}'
    });
    expect(element.htmlContent).toBe('<html></html>');
    expect(element.state).toBe('{"key":"value"}');
  });

  it('should declare one string variable named after the element', () => {
    const element = new TetfolioElement({ type: 'tetfolio', id: 'tetfolio_1', alias: 'my-alias' });
    const infos = element.getVariableInfos();
    expect(infos).toHaveLength(1);
    expect(infos[0].id).toBe('tetfolio_1');
    expect(infos[0].alias).toBe('my-alias');
    expect(infos[0].type).toBe('string');
  });

  it('should throw on a foreign blueprint under strict instantiation', () => {
    environment.strictInstantiation = true;
    expect(() => new TetfolioElement({ id: 'tetfolio_1', alias: 'tetfolio_1' })).toThrow();
  });
});
