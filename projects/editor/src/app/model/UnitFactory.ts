import {
  AudioElement, ButtonElement,
  CheckboxElement, CompoundElementCorrection, DropdownElement,
  ImageElement, LabelElement, RadioButtonGroupElement,
  TextFieldElement, Unit, UnitPage, UnitPageSection, UnitUIElement,
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

export function createUnitUIElement(type: string): UnitUIElement {
  return {
    type,
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
    ...createUnitUIElement('label')
  };
}

export function createButtonElement(): ButtonElement {
  return {
    label: 'Button Text',
    ...createUnitUIElement('button')
  };
}

export function createTextfieldElement(): TextFieldElement {
  return {
    placeholder: 'DUMMY',
    multiline: true,
    ...createUnitUIElement('text-field')
  };
}

export function createCheckboxElement(): CheckboxElement {
  return {
    label: 'Label Checkbox',
    ...createUnitUIElement('checkbox')
  };
}

export function createDropdownElement(): DropdownElement {
  return {
    label: 'Label Dropdown',
    options: [],
    ...createUnitUIElement('dropdown')
  };
}

export function createRadioButtonGroupElement(): RadioButtonGroupElement {
  return {
    text: 'Label Optionsfeld',
    options: [],
    alignment: 'row',
    ...createUnitUIElement('radio'),
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
