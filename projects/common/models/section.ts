import { Type } from '@angular/core';
import { IDManager } from 'common/util/id-manager';
import {
  CompoundElement, PositionedUIElement, UIElement, UIElementValue, AnswerScheme, PlayerElement, InputElement
} from 'common/models/elements/element';
import { ButtonElement } from 'common/models/elements/button/button';
import { TextElement } from 'common/models/elements/text/text';
import { TextFieldElement } from 'common/models/elements/input-elements/text-field';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';
import { CheckboxElement } from 'common/models/elements/input-elements/checkbox';
import { DropdownElement } from 'common/models/elements/input-elements/dropdown';
import { RadioButtonGroupElement } from 'common/models/elements/input-elements/radio-button-group';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';
import { RadioButtonGroupComplexElement } from 'common/models/elements/input-elements/radio-button-group-complex';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import {
  DropListSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/drop-list-simple';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { SliderElement } from 'common/models/elements/input-elements/slider';
import { SpellCorrectElement } from 'common/models/elements/input-elements/spell-correct';
import { FrameElement } from 'common/models/elements/frame/frame';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';

export class Section {
  [index: string]: unknown;
  elements: PositionedUIElement[] = [];
  height: number = 400;
  backgroundColor: string = '#ffffff';
  dynamicPositioning: boolean = true;
  autoColumnSize: boolean = true;
  autoRowSize: boolean = true;
  gridColumnSizes: string = '1fr 1fr';
  gridRowSizes: string = '1fr';
  activeAfterID: string | null = null;

  static ELEMENT_CLASSES: Record<string, Type<UIElement>> = {
    text: TextElement,
    button: ButtonElement,
    'text-field': TextFieldElement,
    'text-field-simple': TextFieldSimpleElement,
    'text-area': TextAreaElement,
    checkbox: CheckboxElement,
    dropdown: DropdownElement,
    radio: RadioButtonGroupElement,
    image: ImageElement,
    audio: AudioElement,
    video: VideoElement,
    likert: LikertElement,
    'radio-group-images': RadioButtonGroupComplexElement,
    'drop-list': DropListElement,
    'drop-list-simple': DropListSimpleElement,
    cloze: ClozeElement,
    slider: SliderElement,
    'spell-correct': SpellCorrectElement,
    frame: FrameElement,
    'toggle-button': ToggleButtonElement
  };

  constructor(section?: Partial<Section>, idManager?: IDManager) {
    if (section?.height) this.height = section.height;
    if (section?.backgroundColor) this.backgroundColor = section.backgroundColor;
    if (section?.dynamicPositioning !== undefined) this.dynamicPositioning = section.dynamicPositioning;
    if (section?.autoColumnSize !== undefined) this.autoColumnSize = section.autoColumnSize;
    if (section?.autoRowSize !== undefined) this.autoRowSize = section.autoRowSize;
    if (section?.gridColumnSizes !== undefined) this.gridColumnSizes = section.gridColumnSizes;
    if (section?.gridRowSizes !== undefined) this.gridRowSizes = section.gridRowSizes;
    if (section?.activeAfterID) this.activeAfterID = section.activeAfterID;
    this.elements =
      section?.elements?.map(element => Section.createElement(element, idManager)) ||
      [];
  }

  static createElement(element: { type: string } & Partial<UIElement>, idManager?: IDManager): PositionedUIElement {
    return new Section.ELEMENT_CLASSES[element.type](element, idManager) as PositionedUIElement;
  }

  setProperty(property: string, value: UIElementValue): void {
    this[property] = value;
  }

  addElement(element: PositionedUIElement): void {
    element.position.dynamicPositioning = this.dynamicPositioning;
    this.elements.push(element);
  }

  /* Includes children of children, i.e. compound children. */
  getAllElements(elementType?: string): UIElement[] {
    let allElements: UIElement[] =
      this.elements.map(element => [element, ...(element as CompoundElement).getChildElements() || []])
        .flat();
    if (elementType) {
      allElements = allElements.filter(element => element.type === elementType);
    }
    return allElements;
  }

  getAnswerScheme(dropLists: UIElement[]): AnswerScheme[] {
    return this.getAllElements()
      .filter(element => element.hasAnswerScheme())
      .map(element => ((element.type === 'drop-list' || element.type === 'drop-list-simple') ?
        (element as InputElement).getAnswerScheme(dropLists) :
        (element as InputElement | PlayerElement | TextElement | ImageElement).getAnswerScheme()));
  }
}
