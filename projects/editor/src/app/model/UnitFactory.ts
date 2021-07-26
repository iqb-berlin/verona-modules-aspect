import {
  AudioElement, ButtonElement,
  CheckboxElement, CompoundElementCorrection, DropdownElement,
  ImageElement, TextElement, RadioButtonGroupElement, SurfaceUIElement,
  TextFieldElement, TextUIElement, Unit, UnitPage, UnitPageSection, UnitUIElement,
  VideoElement, InputUIElement, TextAreaElement, NumberFieldElement
} from '../../../../common/unit';

export function createUnit(): Unit {
  return {
    pages: []
  };
}

export function createUnitPage(pageIndex: number): UnitPage {
  return {
    id: `page${pageIndex}`,
    label: `Seite ${pageIndex + 1}`,
    sections: [],
    width: 1100,
    margin: 15,
    backgroundColor: 'white',
    alwaysVisible: false
  };
}

export function createUnitPageSection(): UnitPageSection {
  return {
    elements: [],
    width: 1200,
    height: 200,
    backgroundColor: '#FFFAF0'
  };
}

export function createUnitUIElement(type: string): UnitUIElement {
  return {
    type,
    id: 'id_placeholder',
    xPosition: 0,
    yPosition: 0,
    zIndex: 0,
    width: 180,
    height: 60
  };
}

export function createTextUIElement(): Record<string, unknown> {
  return {
    fontColor: 'blue',
    font: 'Arial',
    fontSize: 18,
    bold: true,
    italic: false,
    underline: false
  };
}

export function createInputUIElement(
  label: string, value: string | number | boolean | undefined
): Record<string, unknown> {
  return {
    label: label,
    value: value,
    required: false,
    validationWarnMessage: ''
  };
}

export function createSurfaceUIElement(): Record<string, unknown> {
  return {
    backgroundColor: 'lightgrey'
  };
}

export function createTextElement(): TextElement {
  return <TextElement>{
    text: 'Example Text',
    ...createUnitUIElement('text'),
    ...createTextUIElement(),
    ...createSurfaceUIElement()
  };
}

export function createButtonElement(): ButtonElement {
  return <ButtonElement>{
    label: 'Button Text',
    ...createUnitUIElement('button'),
    ...createTextUIElement(),
    ...createSurfaceUIElement()
  };
}

export function createTextfieldElement(): TextFieldElement {
  return <TextFieldElement>{
    min: undefined,
    max: undefined,
    ...createUnitUIElement('text-field'),
    ...createInputUIElement('Example Label', ''),
    ...createTextUIElement(),
    ...createSurfaceUIElement()
  };
}

export function createNumberfieldElement(): NumberFieldElement {
  return <NumberFieldElement>{
    min: undefined,
    max: undefined,
    ...createUnitUIElement('number-field'),
    ...createTextUIElement(),
    ...createSurfaceUIElement(),
    ...createInputUIElement('Example Label', undefined)
  };
}

export function createTextareaElement(): TextAreaElement {
  return <TextAreaElement>{
    resizeEnabled: false,
    ...createUnitUIElement('text-area'),
    ...createInputUIElement('Example Label', ''),
    ...createTextUIElement(),
    ...createSurfaceUIElement(),
    height: 100
  };
}

export function createCheckboxElement(): CheckboxElement {
  return <CheckboxElement>{
    ...createUnitUIElement('checkbox'),
    ...createInputUIElement('Label Checkbox', undefined),
    ...createTextUIElement(),
    ...createSurfaceUIElement()
  };
}

export function createDropdownElement(): DropdownElement {
  return <DropdownElement><unknown>{
    options: [],
    ...createUnitUIElement('dropdown'),
    ...createInputUIElement('Label Dropdown', undefined),
    ...createTextUIElement(),
    ...createSurfaceUIElement()
  };
}

export function createRadioButtonGroupElement(): RadioButtonGroupElement {
  return <RadioButtonGroupElement><unknown>{
    options: [],
    alignment: 'row',
    ...createUnitUIElement('radio'),
    ...createInputUIElement('Label Optionsfeld', undefined),
    ...createTextUIElement(),
    ...createSurfaceUIElement(),
    height: 75
  };
}

export function createImageElement(imageSrc: string): ImageElement {
  return {
    src: imageSrc,
    ...createUnitUIElement('image')
  };
}

export function createAudioElement(audioSrc: string): AudioElement {
  return {
    src: audioSrc,
    ...createUnitUIElement('audio')
  };
}

export function createVideoElement(videoSrc: string): VideoElement {
  return {
    src: videoSrc,
    ...createUnitUIElement('video')
  };
}

export function createCorrectionElement(): CompoundElementCorrection {
  return {
    text: 'dummy',
    sentences: [],
    ...createUnitUIElement('correction')
  };
}
