import {
  INPUT_ASSISTANCE_CUSTOM_STYLES, InputAssistanceCustomStyle
} from 'common/models/input-element-interfaces';
import { InputAssistanceCustomStylePipe } from './input-assistance-custom-style.pipe';

describe('InputAssistanceCustomStylePipe', () => {
  let pipe: InputAssistanceCustomStylePipe;

  beforeEach(() => {
    pipe = new InputAssistanceCustomStylePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  /* The pipe only narrows the type of a template value, so the value passes through untouched. */
  it('should pass the custom style through unchanged', () => {
    INPUT_ASSISTANCE_CUSTOM_STYLES.forEach((customStyle: InputAssistanceCustomStyle) => {
      expect(pipe.transform(customStyle)).toBe(customStyle);
    });
  });
});
