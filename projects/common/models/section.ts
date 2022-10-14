import {
  CompoundElement, PositionedUIElement, UIElement, UIElementValue, AnswerScheme, PlayerElement, InputElement
} from 'common/models/elements/element';
import { TextElement } from 'common/models/elements/text/text';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { ElementFactory } from 'common/util/element.factory';

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

  constructor(section?: Partial<Section>) {
    if (section?.height) this.height = section.height;
    if (section?.backgroundColor) this.backgroundColor = section.backgroundColor;
    if (section?.dynamicPositioning !== undefined) this.dynamicPositioning = section.dynamicPositioning;
    if (section?.autoColumnSize !== undefined) this.autoColumnSize = section.autoColumnSize;
    if (section?.autoRowSize !== undefined) this.autoRowSize = section.autoRowSize;
    if (section?.gridColumnSizes !== undefined) this.gridColumnSizes = section.gridColumnSizes;
    if (section?.gridRowSizes !== undefined) this.gridRowSizes = section.gridRowSizes;
    if (section?.activeAfterID) this.activeAfterID = section.activeAfterID;
    this.elements =
      section?.elements?.map(element => (
        ElementFactory.createElement({
          ...element,
          position: ElementFactory.initPositionProps(element.position)
        }) as PositionedUIElement)
      ) || [];
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
