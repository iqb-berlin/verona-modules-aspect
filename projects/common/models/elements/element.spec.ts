import { ElementFactory } from 'common/utils/element-factory';
import { AbstractIDService } from 'common/models/id-interfaces';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import { UIElement } from 'common/models/elements/element';

describe('UIElement setProperty alias validation', () => {
  let element: UIElement;

  const idServiceStub: AbstractIDService = {
    getAndRegisterNewID: () => 'text_1',
    register: () => {},
    unregister: () => {},
    isAliasAvailable: () => true,
    changeAlias: () => {}
  };

  beforeEach(() => {
    element = ElementFactory.createElement({
      type: 'text',
      id: 'text_1',
      alias: 'text_1'
    } as unknown as UIElementProperties);
    element.idService = idServiceStub;
  });

  it('should accept aliases with letters, digits, underscore and dash', () => {
    element.setProperty('alias', 'var_1-neu');
    expect(element.alias).toBe('var_1-neu');
  });

  it('should reject aliases with umlauts', () => {
    expect(() => element.setProperty('alias', 'März')).toThrowError(/unerlaubte Zeichen/);
    expect(() => element.setProperty('alias', 'Lösung1')).toThrowError(/unerlaubte Zeichen/);
  });

  it('should reject aliases with trailing whitespace', () => {
    expect(() => element.setProperty('alias', 'weiter ')).toThrowError(/Leerzeichen/);
  });

  /* The Verona contract sets no maximum length, therefore neither does Aspect (#1129). */
  it('should accept aliases longer than 20 characters', () => {
    const longAlias = 'a'.repeat(21);
    element.setProperty('alias', longAlias);
    expect(element.alias).toBe(longAlias);
  });
});
