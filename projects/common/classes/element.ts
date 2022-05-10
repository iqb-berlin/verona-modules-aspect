import {
  BasicStyles,
  DragNDropValueObject,
  ElementStyling, InputAssistancePreset,
  PlayerProperties,
  PositionProperties, TextImageLabel, UIElementType, UIElementValue
} from 'common/interfaces/elements';
import { ElementFactory } from 'common/util/element.factory';
import { ClozeDocument } from 'common/interfaces/cloze';

export abstract class UIElement {
  [index: string]: any;
  id: string = 'id_placeholder';
  type: UIElementType;
  width: number = 180;
  height: number = 60;
  position?: PositionProperties;
  styling?: ElementStyling;
  player?: PlayerProperties;

  constructor(type: UIElementType) {
    this.type = type;
  }

  setProperty(property: string, value: UIElementValue): void {
    (this as UIElement)[property] = value;
  }
}

export type InputElementValue = string[] | string | number | boolean | DragNDropValueObject[] | null;

export abstract class InputElement extends UIElement {
  label?: string;
  value: InputElementValue = null;
  required: boolean = false;
  requiredWarnMessage: string = 'Eingabe erforderlich';
  readOnly: boolean = false;
}

export interface PositionedUIElement extends UIElement {
  position: PositionProperties;
}

export class ButtonElement extends UIElement implements PositionedUIElement {
  label: string = 'Knopf';
  imageSrc: string | null = null;
  asLink: boolean = false;
  action: null | 'unitNav' | 'pageNav' = null;
  actionParam: null | 'previous' | 'next' | 'first' | 'last' | 'end' | number = null;
  position: PositionProperties;
  styling: BasicStyles & {
    borderRadius: number;
  };

  constructor(button: ButtonElement) {
    super('button');
    Object.assign(this, button);
    this.position = ElementFactory.initPositionProps(button.position);
    this.styling = {
      ...ElementFactory.initStylingProps(button.styling),
      borderRadius: button.styling?.borderRadius | 0
    };
  }
}

export class CheckboxElement extends InputElement implements PositionedUIElement {
  position: PositionProperties;
  styling: BasicStyles;

  constructor(checkbox: CheckboxElement) {
    super('checkbox');
    this.position = ElementFactory.initPositionProps(checkbox.position);
    this.styling = ElementFactory.initStylingProps(checkbox.styling);
  }
}

export class ClozeElement extends UIElement implements PositionedUIElement {
  document: ClozeDocument;
  columnCount: number = 1;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(cloze: Partial<ClozeElement>) {
    super('cloze');
    Object.assign(this, cloze);
    this.document = {} as ClozeDocument;
    this.position = ElementFactory.initPositionProps(cloze.position);
    this.styling = {
      ...ElementFactory.initStylingProps(cloze.styling),
      lineHeight: cloze.styling?.lineHeight || 150
    };
  }
}

export class DropdownElement extends InputElement implements PositionedUIElement {
  options: string[] = [];
  allowUnset: boolean = false;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(dropdown: DropdownElement) {
    super('dropdown');
    Object.assign(this, dropdown);
    this.position = ElementFactory.initPositionProps(dropdown.position);
    this.styling = {
      ...ElementFactory.initStylingProps(dropdown.styling)
    };
  }
}

export class DropListElement extends InputElement implements PositionedUIElement {
  onlyOneItem: boolean = false;
  connectedTo: string[] = [];
  copyOnDrop: boolean = false;
  orientation: 'vertical' | 'horizontal' | 'flex' = 'vertical';
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#006064';
  position: PositionProperties;
  styling: BasicStyles & {
    itemBackgroundColor: string;
  };

  constructor(dropList: DropListElement) {
    super('drop-list');
    Object.assign(this, dropList);
    this.position = ElementFactory.initPositionProps(dropList.position);
    this.styling = {
      ...ElementFactory.initStylingProps(dropList.styling),
      itemBackgroundColor: dropList.styling?.itemBackgroundColor || '#c9e0e0'
    };
  }
}

export class DropListSimpleElement extends InputElement {
  connectedTo: string[] = [];
  copyOnDrop: boolean = false;
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#006064';
  styling: BasicStyles & {
    itemBackgroundColor: string;
  };

  constructor(dropListSimple: DropListSimpleElement) {
    super('drop-list-simple');
    Object.assign(this, dropListSimple);
    this.position = ElementFactory.initPositionProps(dropListSimple.position);
    this.styling = {
      ...ElementFactory.initStylingProps(dropListSimple.styling),
      itemBackgroundColor: dropListSimple.styling?.itemBackgroundColor || '#c9e0e0'
    };
  }
}

export class FrameElement extends UIElement implements PositionedUIElement {
  position: PositionProperties;
  styling: BasicStyles & {
    borderWidth: number;
    borderColor: string;
    borderStyle: 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
    borderRadius: number;
  };

  constructor(frame: FrameElement) {
    super('frame');
    Object.assign(this, frame);
    this.position = ElementFactory.initPositionProps(frame.position);
    this.styling = {
      ...ElementFactory.initStylingProps(frame.styling),
      borderWidth: frame.styling?.borderWidth || 1,
      borderColor: frame.styling?.borderColor || 'black',
      borderStyle: frame.styling?.borderStyle || 'solid',
      borderRadius: frame.styling?.borderRadius || 0
    };
  }
}

export class ImageElement extends UIElement implements PositionedUIElement {
  src: string | undefined;
  scale: boolean = false;
  magnifier: boolean = false;
  magnifierSize: number = 100;
  magnifierZoom: number = 1.5;
  magnifierUsed: boolean = false;
  position: PositionProperties;

  constructor(image: ImageElement) {
    super('image');
    Object.assign(this, image);
    this.position = ElementFactory.initPositionProps(image.position);
  }
}

export class LikertElement extends UIElement implements PositionedUIElement {
  rows: LikertRowElement[] = [];
  columns: TextImageLabel[] = [];
  firstColumnSizeRatio: number = 5;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    lineColoring: boolean;
    lineColoringColor: string;
  };

  constructor(likert: Partial<LikertElement>) {
    super('likert');
    Object.assign(this, likert);
    this.position = ElementFactory.initPositionProps(likert.position);
    this.styling = {
      ...ElementFactory.initStylingProps(likert.styling),
      lineHeight: likert.styling?.lineHeight || 135,
      lineColoring: likert.styling?.lineColoring !== undefined ? likert.styling.lineColoring as boolean : true,
      lineColoringColor: likert.styling?.lineColoringColor || '#c9e0e0'
    };
  }
}

export class LikertRowElement extends InputElement {
  rowLabel: TextImageLabel;
  columnCount: number = 0;
  firstColumnSizeRatio: number = 5;
  verticalButtonAlignment: 'auto' | 'center' = 'center';

  constructor(likertRow: Partial<LikertRowElement>) {
    super('likert-row');
    Object.assign(this, likertRow);
    this.rowLabel = ElementFactory.initTextImageLabel();
  }
}

export class RadioButtonGroupElement extends InputElement implements PositionedUIElement {
  richTextOptions: string[] = [];
  alignment: 'column' | 'row' = 'column';
  strikeOtherOptions: boolean = false;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(radio: Partial<RadioButtonGroupElement>) {
    super('radio');
    Object.assign(this, radio);
    this.position = ElementFactory.initPositionProps(radio.position);
    this.styling = {
      ...ElementFactory.initStylingProps(radio.styling)
    };
  }
}

export class RadioButtonGroupComplexElement extends InputElement implements PositionedUIElement {
  columns: TextImageLabel[] = [];
  position: PositionProperties;
  styling: BasicStyles;

  constructor(radio: RadioButtonGroupComplexElement) {
    super('radio-group-images');
    Object.assign(this, radio);
    this.position = ElementFactory.initPositionProps(radio.position);
    this.styling = {
      ...ElementFactory.initStylingProps(radio.styling)
    };
  }
}

export class SliderElement extends InputElement implements PositionedUIElement {
  minValue: number = 0;
  maxValue: number = 100;
  showValues: boolean = true;
  barStyle: boolean = false;
  thumbLabel: boolean = false;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(slider: SliderElement) {
    super('slider');
    Object.assign(this, slider);
    this.position = ElementFactory.initPositionProps(slider.position);
    this.styling = {
      ...ElementFactory.initStylingProps(slider.styling)
    };
  }
}

export class SpellCorrectElement extends InputElement implements PositionedUIElement {
  inputAssistancePreset: InputAssistancePreset = 'none';
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  restrictedToInputAssistanceChars: boolean = true;
  showSoftwareKeyboard: boolean = false;
  softwareKeyboardShowFrench: boolean = false;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: SpellCorrectElement) {
    super('spell-correct');
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps(element.styling)
    };
  }
}

export class TextFieldElement extends InputElement implements PositionedUIElement {
  appearance: 'fill' | 'outline' = 'outline';
  minLength: number | undefined;
  minLengthWarnMessage: string = 'Eingabe zu kurz';
  maxLength: number | undefined;
  maxLengthWarnMessage: string = 'Eingabe zu lang';
  pattern: string | undefined;
  patternWarnMessage: string = 'Eingabe entspricht nicht der Vorgabe';
  inputAssistancePreset: InputAssistancePreset = 'none';
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  restrictedToInputAssistanceChars: boolean = true; // TODO refactor
  showSoftwareKeyboard: boolean = false;
  softwareKeyboardShowFrench: boolean = false;
  clearable: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: TextFieldElement) {
    super('text-field');
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps(element.styling),
      lineHeight: element.styling?.lineHeight || 135
    };
  }
}

export class TextFieldSimpleElement extends InputElement {
  minLength: number | undefined;
  minLengthWarnMessage: string = 'Eingabe zu kurz';
  maxLength: number | undefined;
  maxLengthWarnMessage: string = 'Eingabe zu lang';
  pattern: string | undefined;
  patternWarnMessage: string = 'Eingabe entspricht nicht der Vorgabe';
  inputAssistancePreset: InputAssistancePreset = 'none';
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  restrictedToInputAssistanceChars: boolean = true;
  showSoftwareKeyboard: boolean = false;
  softwareKeyboardShowFrench: boolean = false;
  clearable: boolean = false;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: TextFieldSimpleElement) {
    super('text-field-simple');
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps(element.styling),
      lineHeight: element.styling?.lineHeight || 135
    };
  }
}

export class TextAreaElement extends InputElement implements PositionedUIElement {
  appearance: 'fill' | 'outline' = 'outline';
  resizeEnabled: boolean = false;
  rowCount: number = 3;
  inputAssistancePreset: InputAssistancePreset = 'none';
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  restrictedToInputAssistanceChars: boolean = true;
  showSoftwareKeyboard: boolean = false;
  softwareKeyboardShowFrench: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: TextAreaElement) {
    super('text-area');
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps(element.styling),
      lineHeight: element.styling?.lineHeight || 135
    };
  }
}

export class TextElement extends UIElement implements PositionedUIElement {
  text: string = 'Lorem ipsum dolor sit amet';
  highlightableOrange: boolean = false;
  highlightableTurquoise: boolean = false;
  highlightableYellow: boolean = false;
  columnCount: number = 1;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: TextElement) {
    super('text');
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps(element.styling),
      lineHeight: element.styling?.lineHeight || 135
    };
  }
}

export class ToggleButtonElement extends InputElement {
  richTextOptions: string[] = [];
  strikeOtherOptions: boolean = false;
  verticalOrientation: boolean = false;
  dynamicWidth: boolean = true;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };

  constructor(element: Partial<ToggleButtonElement>) {
    super('toggle-button');
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps(element.styling),
      lineHeight: element.styling?.lineHeight || 135,
      selectionColor: element.styling?.selectionColor || '#c7f3d0'
    };
  }
}

export class AudioElement extends UIElement implements PositionedUIElement {
  src: string | undefined;
  position: PositionProperties;
  player: PlayerProperties;

  constructor(element: AudioElement) {
    super('audio');
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.player = ElementFactory.initPlayerProps(element.player);
  }
}

export class VideoElement extends UIElement implements PositionedUIElement {
  src: string | undefined;
  scale: boolean = false; // TODO besserer name
  position: PositionProperties;
  player: PlayerProperties;

  constructor(element: VideoElement) {
    super('video');
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.player = ElementFactory.initPlayerProps(element.player);
  }
}
