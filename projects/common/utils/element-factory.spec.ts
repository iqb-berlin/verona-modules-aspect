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

  it('should restore and not overwrite position/dimensions on DropList, ' +
    'Frame and TextField elements even with partial blueprints', () => {
    const dropList = ElementFactory.createElement({
      type: 'drop-list',
      position: { gridRow: 4 },
      dimensions: { width: 450 }
    } as unknown as UIElementProperties);
    expect(dropList.position?.gridRow).toBe(4);
    expect(dropList.dimensions?.width).toBe(450);

    const frame = ElementFactory.createElement({
      type: 'frame',
      position: { gridRow: 5 },
      dimensions: { width: 350 }
    } as unknown as UIElementProperties);
    expect(frame.position?.gridRow).toBe(5);
    expect(frame.dimensions?.width).toBe(350);

    const textField = ElementFactory.createElement({
      type: 'text-field',
      position: { gridRow: 6 },
      dimensions: { width: 250 }
    } as unknown as UIElementProperties);
    expect(textField.position?.gridRow).toBe(6);
    expect(textField.dimensions?.width).toBe(250);
  });
});
