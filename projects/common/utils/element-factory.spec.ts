import { ElementFactory } from 'common/utils/element-factory';
import { TextElement } from 'common/models/elements/text/text';
import { CheckboxElement } from 'common/models/elements/input-elements/checkbox';
import { UIElementProperties } from 'common/interfaces';

describe('ElementFactory', () => {
  it('should create a TextElement with normalized defaults', () => {
    const element = ElementFactory.createElement({ type: 'text' } as unknown as UIElementProperties) as TextElement;
    expect(element.type).toBe('text');
    expect(element.text).toBe('Lorem ipsum dolor sit amet'); // from registry
    expect(element.highlightableOrange).toBe(false); // from registry
    expect(element.dimensions?.height).toBe(98); // from registry
  });

  it('should create a CheckboxElement with normalized defaults', () => {
    const element = ElementFactory
      .createElement({ type: 'checkbox' } as unknown as UIElementProperties) as CheckboxElement;
    expect(element.type).toBe('checkbox');
    expect(element.label).toBe('Beschriftung'); // from registry
    expect(element.dimensions?.width).toBe(215); // from registry
  });

  it('should preserve provided properties while normalizing missing ones', () => {
    const element = ElementFactory.createElement({
      type: 'text',
      text: 'Custom Text'
    } as unknown as UIElementProperties) as TextElement;
    expect(element.text).toBe('Custom Text');
    expect(element.highlightableOrange).toBe(false); // still normalized
  });
});
