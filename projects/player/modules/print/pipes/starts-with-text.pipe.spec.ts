import { UIElementDraft } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { ComponentRegistry } from 'common/utils/component-registry';
import { TextFieldComponent } from 'common/components/elements/text-field/text-field.component';
import { StartsWithTextPipe } from './starts-with-text.pipe';

describe('StartsWithTextPipe', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /* The answer is the component's own (`ElementComponent.startsWithText`); its specs say what it is. */
  it('should ask the component registered for the element type', () => {
    const pipe = new StartsWithTextPipe();
    const textField = ElementFactory.createElement(
      { type: 'text-field', id: 'text-field_1', alias: 'text-field_1' } as UIElementDraft
    );
    vi.spyOn(ComponentRegistry, 'getComponent').mockReturnValue(TextFieldComponent);
    const startsWithText = vi.spyOn(TextFieldComponent, 'startsWithText').mockReturnValue(false);

    expect(pipe.transform(textField)).toBe(false);
    expect(ComponentRegistry.getComponent).toHaveBeenCalledWith('text-field');
    expect(startsWithText).toHaveBeenCalledWith(textField);
  });
});
