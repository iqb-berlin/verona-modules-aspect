import { ElementFactory } from 'common/utils/element-factory';
import { TextElement } from 'common/models/elements/text-group-elements/text';
import { CheckboxElement } from 'common/models/elements/input-group-elements/checkbox';
import { DropListElement } from 'common/models/elements/input-group-elements/drop-list';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-group-elements/text-field-simple';
import { isInputElement } from 'common/models/elements/element';
import { UIElementProperties } from 'common/models/ui-element-interfaces';

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

  it('should keep element-specific dimension defaults when instantiating from a partial blueprint', () => {
    const dropList = ElementFactory.createElement({
      type: 'drop-list',
      position: { gridRow: 4 }
    } as unknown as UIElementProperties);
    // minHeight 57 is a drop-list-specific registry default, not a global one
    expect(dropList.dimensions?.minHeight).toBe(57);
    expect(dropList.dimensions?.width).toBe(240);
  });

  it('should preserve blueprint dimensions on TableElement', () => {
    const table = ElementFactory.createElement({
      type: 'table',
      elements: [],
      dimensions: { width: 777, height: 333 }
    } as unknown as UIElementProperties);
    expect(table.dimensions?.width).toBe(777);
    expect(table.dimensions?.height).toBe(333);
  });

  it('should preset the table bottom margin as a measurement object', () => {
    // The registry default was a raw number, which the position generator passed through,
    // so new tables came without the intended 30px bottom margin until the next reload (#1061)
    const table = ElementFactory.createElement({
      type: 'table',
      elements: []
    } as unknown as UIElementProperties);
    expect(table.position?.marginBottom).toEqual({ value: 30, unit: 'px' });
  });

  it('should keep common input properties when instantiating from a non-empty partial blueprint', () => {
    // A non-null partial blueprint passes the simplified type guards, so the constructor body runs
    // and must not overwrite the base-class defaults (readOnly, required, ...) with undefined.
    const dropList = new DropListElement({ id: 'dl', alias: 'dl' });
    expect(dropList.readOnly).toBe(false);
    expect(dropList.required).toBe(false);
    expect(isInputElement(dropList)).toBe(true);

    const textFieldSimple = new TextFieldSimpleElement({ id: 'tfs', alias: 'tfs' });
    expect(textFieldSimple.readOnly).toBe(false);
    expect(textFieldSimple.keyStyle).toBe('round');
    expect(isInputElement(textFieldSimple)).toBe(true);
  });

  it('should keep common input properties on elements whose guard only checks the type', () => {
    // checkbox has a pure `type === 'checkbox'` guard, so a partial blueprint carrying the type
    // runs the constructor body; it must not overwrite the base-class defaults with undefined.
    const checkbox = new CheckboxElement({ type: 'checkbox', id: 'cb', alias: 'cb' });
    expect(checkbox.readOnly).toBe(false);
    expect(checkbox.required).toBe(false);
    expect(typeof checkbox.value).toBe('boolean');
    expect(checkbox.dimensions?.width).toBeDefined();
    expect(isInputElement(checkbox)).toBe(true);
  });

  it('should not throw when instantiating a drop-list from a blueprint that only carries its type', () => {
    expect(() => ElementFactory.createElement({ type: 'drop-list' } as unknown as UIElementProperties))
      .not.toThrow();
  });

  it('should default textAlign to left on text input elements', () => {
    ['text-field', 'text-field-simple', 'text-area'].forEach(type => {
      const element = ElementFactory.createElement({ type } as unknown as UIElementProperties);
      expect(element.textAlign).toBe('left');
    });
  });

  it('should preserve a provided textAlign through normalization and instantiation', () => {
    ['text-field', 'text-field-simple', 'text-area'].forEach(type => {
      const element = ElementFactory.createElement(
        { type, textAlign: 'center' } as unknown as UIElementProperties
      );
      expect(element.textAlign).toBe('center');
    });
  });
});
