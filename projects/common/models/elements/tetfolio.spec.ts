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
    expect(element.dimensions.width).toBe(900);
    expect(element.dimensions.height).toBe(400);
    expect(element.styling).toEqual({});
  });

  it('should take over the blueprint values', () => {
    const element = new TetfolioElement({
      type: 'tetfolio',
      id: 'tetfolio_1',
      alias: 'tetfolio_1',
      htmlContent: '<html></html>'
    });
    expect(element.htmlContent).toBe('<html></html>');
  });

  it('should keep no state of its own: the state belongs to the unit state, not the definition', () => {
    const element = new TetfolioElement({ type: 'tetfolio', id: 'tetfolio_1', alias: 'tetfolio_1' });
    expect(Object.keys(element)).not.toContain('state');
  });

  /* The reported state only serves the restore on re-entry and is not coded (#1461). */
  it('should declare its variable as not coded', () => {
    const element = new TetfolioElement({ type: 'tetfolio', id: 'tetfolio_1', alias: 'my-alias' });
    const infos = element.getVariableInfos();
    expect(infos).toHaveLength(1);
    expect(infos[0].id).toBe('tetfolio_1');
    expect(infos[0].alias).toBe('my-alias');
    expect(infos[0].type).toBe('NO_VALUE');
  });

  it('should throw on a foreign blueprint under strict instantiation', () => {
    environment.strictInstantiation = true;
    expect(() => new TetfolioElement({ id: 'tetfolio_1', alias: 'tetfolio_1' })).toThrow();
  });
});
