import { UIElement } from 'common/models/elements/element';
import { TextAreaElement } from 'common/models/elements/text-input-group-elements/text-area';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import { HasReturnKeyPipe } from './has-return-key.pipe';

describe('HasReturnKeyPipe', () => {
  let pipe: HasReturnKeyPipe;

  const createTextArea = (hasReturnKey: boolean): TextAreaElement => {
    const element = new TextAreaElement({ type: 'text-area', id: 'text-area_1', rowCount: 3 });
    element.hasReturnKey = hasReturnKey;
    return element;
  };

  beforeEach(() => {
    pipe = new HasReturnKeyPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should report the return key setting of a text area', () => {
    expect(pipe.transform(createTextArea(true))).toBe(true);
    expect(pipe.transform(createTextArea(false))).toBe(false);
  });

  it('should report no return key for other element types', () => {
    const textField = new TextFieldElement({ type: 'text-field', id: 'text-field_1' });

    expect(pipe.transform(textField as UIElement)).toBe(false);
  });
});
