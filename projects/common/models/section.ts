import { PositionedUIElement, UIElement } from 'common/models/elements/element';
import { ElementFactory } from 'common/util/element.factory';
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
import { IDManager } from 'common/util/id-manager';

export class Section {
  [index: string]: any;
  elements: PositionedUIElement[] = [];
  height: number = 400;
  backgroundColor: string = '#ffffff';
  dynamicPositioning: boolean = true;
  autoColumnSize: boolean = true;
  autoRowSize: boolean = true;
  gridColumnSizes: string = '1fr 1fr';
  gridRowSizes: string = '1fr';
  activeAfterID: string | null = null;

  static ELEMENT_CLASSES: Record<string, any> = {
    'text': TextElement,
    'button': ButtonElement,
    'text-field': TextFieldElement,
    'text-field-simple': TextFieldSimpleElement,
    'text-area': TextAreaElement,
    'checkbox': CheckboxElement,
    'dropdown': DropdownElement,
    'radio': RadioButtonGroupElement,
    'image': ImageElement,
    'audio': AudioElement,
    'video': VideoElement,
    'likert': LikertElement,
    'radio-group-images': RadioButtonGroupComplexElement,
    'drop-list': DropListElement,
    'drop-list-simple': DropListSimpleElement,
    'cloze': ClozeElement,
    'slider': SliderElement,
    'spell-correct': SpellCorrectElement,
    'frame': FrameElement,
    'toggle-button': ToggleButtonElement
  };

  constructor(section?: Partial<Section>, idManager?: IDManager) {
    if (section?.height) this.height = section.height;
    if (section?.backgroundColor) this.backgroundColor = section.backgroundColor;
    if (section?.dynamicPositioning) this.dynamicPositioning = section.dynamicPositioning;
    if (section?.autoColumnSize) this.autoColumnSize = section.autoColumnSize;
    if (section?.autoRowSize) this.autoRowSize = section.autoRowSize;
    if (section?.gridColumnSizes) this.gridColumnSizes = section.gridColumnSizes;
    if (section?.gridRowSizes) this.gridRowSizes = section.gridRowSizes;
    if (section?.activeAfterID) this.activeAfterID = section.activeAfterID;
    this.elements =
      section?.elements?.map(element => Section.createElement(element, idManager)) ||
      [];
  }

  static createElement(element: { type: string } & Partial<UIElement>, idManager?: IDManager) {
    return new Section.ELEMENT_CLASSES[element.type](element, idManager);
  }

  setProperty(property: string, value: any): void {
    this[property] = value;
  }

  addElement(element: PositionedUIElement): void {
    this.elements.push(element);
  }

  /* Includes children of children, i.e. compound children. */
  getAllElements(elementType?: string): UIElement[] {
    let allElements: UIElement[] =
      this.elements.map(element => [element, ...element.getChildElements()])
        .flat();
    if (elementType) {
      allElements = allElements.filter(element => element.type === elementType);
    }
    return allElements;
  }
}
