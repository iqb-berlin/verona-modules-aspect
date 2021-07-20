import {
  AudioElement, ButtonElement,
  CheckboxElement, CompoundElementCorrection, DropdownElement,
  ImageElement, TextElement, RadioButtonGroupElement, SurfaceUIElement,
  TextFieldElement, TextUIElement, Unit, UnitPage, UnitPageSection, UnitUIElement,
  VideoElement
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

export function createSurfaceUIElement(type: string): SurfaceUIElement {
  return {
    backgroundColor: 'lightgrey',
    ...createUnitUIElement(type)
  };
}

export function createTextElement(): TextElement {
  return {
    text: 'Example Text',
    ...createTextUIElement('text'),
    ...createSurfaceUIElement('text')
  };
}

export function createButtonElement(): ButtonElement {
  return {
    label: 'Button Text',
    ...createTextUIElement('button'),
    ...createSurfaceUIElement('button')
  };
}

export function createTextfieldElement(): TextFieldElement {
  return {
    label: 'Example Label',
    text: '',
    ...createTextUIElement('text-field'),
    ...createSurfaceUIElement('text-field')
  };
}

export function createTextareaElement(): TextFieldElement {
  return {
    label: 'Example Label',
    text: '',
    resizeEnabled: false,
    ...createTextUIElement('text-area'),
    ...createSurfaceUIElement('text-area'),
    height: 100
  };
}

export function createCheckboxElement(): CheckboxElement {
  return {
    label: 'Label Checkbox',
    ...createTextUIElement('checkbox'),
    ...createSurfaceUIElement('checkbox')
  };
}

export function createDropdownElement(): DropdownElement {
  return {
    label: 'Label Dropdown',
    options: [],
    ...createTextUIElement('dropdown'),
    ...createSurfaceUIElement('dropdown')
  };
}

export function createRadioButtonGroupElement(): RadioButtonGroupElement {
  return {
    label: 'Label Optionsfeld',
    options: [],
    alignment: 'row',
    ...createTextUIElement('radio'),
    ...createSurfaceUIElement('radio'),
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
