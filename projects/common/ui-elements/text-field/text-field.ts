import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, InputElement, PositionedUIElement, PositionProperties } from 'common/classes/element';
import { InputAssistancePreset } from 'common/interfaces/elements';

export class TextFieldElement extends InputElement implements PositionedUIElement {
  appearance: 'fill' | 'outline' = 'outline';
  minLength: number | undefined;
  minLengthWarnMessage: string = 'Eingabe zu kurz';
  maxLength: number | undefined;
  maxLengthWarnMessage: string = 'Eingabe zu lang';
  pattern: string | undefined;
  patternWarnMessage: string = 'Eingabe entspricht nicht der Vorgabe';
  inputAssistancePreset: InputAssistancePreset = null;
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  restrictedToInputAssistanceChars: boolean = true; // TODO refactor
  showSoftwareKeyboard: boolean = false;
  softwareKeyboardShowFrench: boolean = false;
  clearable: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<TextFieldElement>) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({ backgroundColor: 'transparent', ...element.styling }),
      lineHeight: element.styling?.lineHeight || 135
    };
  }
}
