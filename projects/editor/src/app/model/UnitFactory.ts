import {
  AudioElement, ButtonElement,
  CheckboxElement, CompoundElementCorrection, DropdownElement,
  ImageElement, LabelElement, RadioButtonGroupElement,
  TextFieldElement, Unit, UnitPage, UnitPageSection, BasicUnitUIElement,
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
    backgroundColor: 'white'
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

export function createUnitUIElement(): BasicUnitUIElement {
  return {
    id: 'dummyID',
    xPosition: 0,
    yPosition: 0,
    width: 180,
    height: 60,
    backgroundColor: 'lightgrey',
    fontColor: 'blue',
    font: 'Arial',
    fontSize: 18,
    bold: true,
    italic: false,
    underline: false
  };
}

export function createLabelElement(): LabelElement {
  return {
    label: 'Label Text',
    type: 'label',
    ...createUnitUIElement()
  };
}

export function createButtonElement(): ButtonElement {
  return {
    label: 'Button Text',
    type: 'button',
    ...createUnitUIElement()
  };
}

export function createTextfieldElement(): TextFieldElement {
  return {
    type: 'text-field',
    placeholder: 'DUMMY',
    multiline: true,
    ...createUnitUIElement()
  };
}

export function createCheckboxElement(): CheckboxElement {
  return {
    type: 'checkbox',
    label: 'Label Checkbox',
    ...createUnitUIElement()
  };
}

export function createDropdownElement(): DropdownElement {
  return {
    type: 'dropdown',
    label: 'Label Dropdown',
    options: [],
    ...createUnitUIElement()
  };
}

export function createRadioButtonGroupElement(): RadioButtonGroupElement {
  return {
    type: 'radio',
    text: 'Label Optionsfeld',
    options: [],
    alignment: 'row',
    ...createUnitUIElement(),
    height: 75
  };
}

export function createImageElement(imageSrc: string): ImageElement {
  return {
    type: 'image',
    src: imageSrc,
    ...createUnitUIElement()
  };
}

export function createAudioElement(audioSrc: string): AudioElement {
  return {
    type: 'audio',
    src: audioSrc,
    ...createUnitUIElement()
  };
}

export function createVideoElement(videoSrc: string): VideoElement {
  return {
    type: 'video',
    src: videoSrc,
    ...createUnitUIElement()
  };
}

export function createCorrectionElement(): CompoundElementCorrection {
  return {
    type: 'correction',
    text: 'dummy',
    sentences: [],
    ...createUnitUIElement()
  };
}
