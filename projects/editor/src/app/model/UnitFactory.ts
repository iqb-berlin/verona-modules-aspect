import {
  AudioElement, ButtonElement,
  CheckboxElement, CompoundElementCorrection, DropdownElement,
  ImageElement, TextElement, RadioButtonGroupElement, SurfaceUIElement,
  TextFieldElement, TextUIElement, Unit, UnitPage, UnitPageSection, UnitUIElement,
  VideoElement, InputUIElement
} from '../../../../common/unit';

export function createUnit(): Unit {
  return {
    pages: []
  };
}

export function createUnitPage(): UnitPage {
  return {
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

export function createTextUIElement(type: string): TextUIElement {
  return {
    fontColor: 'blue',
    font: 'Arial',
    fontSize: 18,
    bold: true,
    italic: false,
    underline: false,
    ...createUnitUIElement(type)
  };
}

export function createInputUIElement(): InputUIElement {
  return {
    required: false,
    validationWarnMessage: ''
  };
}

export function createSurfaceUIElement(): SurfaceUIElement {
  return {
    backgroundColor: 'lightgrey'
  };
}

export function createTextElement(): TextElement {
  return {
    text: 'Example Text',
    ...createTextUIElement('text'),
    ...createSurfaceUIElement()
  };
}

export function createButtonElement(): ButtonElement {
  return {
    label: 'Button Text',
    ...createTextUIElement('button'),
    ...createSurfaceUIElement()
  };
}

export function createTextfieldElement(): TextFieldElement {
  return {
    label: 'Example Label',
    value: '',
    ...createTextUIElement('text-field'),
    ...createSurfaceUIElement(),
    ...createInputUIElement()
  };
}

export function createTextareaElement(): TextFieldElement {
  return {
    label: 'Example Label',
    value: '',
    resizeEnabled: false,
    ...createTextUIElement('text-area'),
    ...createSurfaceUIElement(),
    ...createInputUIElement(),
    height: 100
  };
}

export function createCheckboxElement(): CheckboxElement {
  return {
    label: 'Label Checkbox',
    value: undefined,
    ...createTextUIElement('checkbox'),
    ...createSurfaceUIElement(),
    ...createInputUIElement()
  };
}

export function createDropdownElement(): DropdownElement {
  return {
    label: 'Label Dropdown',
    options: [],
    value: undefined,
    ...createTextUIElement('dropdown'),
    ...createSurfaceUIElement(),
    ...createInputUIElement()
  };
}

export function createRadioButtonGroupElement(): RadioButtonGroupElement {
  return {
    label: 'Label Optionsfeld',
    options: [],
    alignment: 'row',
    value: undefined,
    ...createTextUIElement('radio'),
    ...createSurfaceUIElement(),
    ...createInputUIElement(),
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
