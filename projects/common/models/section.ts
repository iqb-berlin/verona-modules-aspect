import {
  CompoundElement,
  PositionedUIElement,
  UIElement,
  UIElementValue,
  PlayerElement,
  InputElement, Measurement
} from 'common/models/elements/element';
import { TextElement } from 'common/models/elements/text/text';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { ElementFactory } from 'common/util/element.factory';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { VisibilityRule } from 'common/models/visibility-rule';

export class Section {
  [index: string]: unknown;
  elements: PositionedUIElement[] = [];
  height: number = 400;
  backgroundColor: string = '#ffffff';
  dynamicPositioning: boolean = true;
  autoColumnSize: boolean = true;
  autoRowSize: boolean = true;
  gridColumnSizes: { value: number; unit: string }[] = [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }];
  gridRowSizes: { value: number; unit: string }[] = [{ value: 1, unit: 'fr' }];
  visibilityDelay: number = 0;
  animatedVisibility: boolean = false;
  enableReHide: boolean = false;
  visibilityRules: VisibilityRule[] = [];

  constructor(blueprint?: Record<string, any>) {
    const sanitizedBlueprint = Section.sanitizeBlueprint(blueprint);
    if (sanitizedBlueprint.height) this.height = sanitizedBlueprint.height;
    if (sanitizedBlueprint.backgroundColor) this.backgroundColor = sanitizedBlueprint.backgroundColor;
    if (sanitizedBlueprint.dynamicPositioning !== undefined) this.dynamicPositioning = sanitizedBlueprint.dynamicPositioning;
    if (sanitizedBlueprint.autoColumnSize !== undefined) this.autoColumnSize = sanitizedBlueprint.autoColumnSize;
    if (sanitizedBlueprint.autoRowSize !== undefined) this.autoRowSize = sanitizedBlueprint.autoRowSize;
    if (sanitizedBlueprint.gridColumnSizes !== undefined) this.gridColumnSizes = sanitizedBlueprint.gridColumnSizes;
    if (sanitizedBlueprint.gridRowSizes !== undefined) this.gridRowSizes = sanitizedBlueprint.gridRowSizes;
    if (sanitizedBlueprint.visibilityDelay) this.visibilityDelay = sanitizedBlueprint.visibilityDelay;
    if (sanitizedBlueprint.animatedVisibility) this.animatedVisibility = sanitizedBlueprint.animatedVisibility;
    if (sanitizedBlueprint.enableReHide) this.enableReHide = sanitizedBlueprint.enableReHide;
    if (sanitizedBlueprint.visibilityRules) this.visibilityRules = sanitizedBlueprint.visibilityRules;
    this.elements =
      sanitizedBlueprint.elements?.map(element => ElementFactory.createElement({
        ...element,
        position: UIElement.initPositionProps(element.position)
      }) as PositionedUIElement) ||
      [];
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
      .map(element => ((element.type === 'drop-list') ?
        (element as InputElement).getAnswerScheme(dropLists) :
        (element as InputElement | PlayerElement | TextElement | ImageElement).getAnswerScheme()));
  }

  static sanitizeBlueprint(blueprint?: Record<string, UIElementValue>): Partial<Section> {
    if (!blueprint) return {};

    return {
      ...blueprint,
      gridColumnSizes: typeof blueprint.gridColumnSizes === 'string' ?
        (blueprint.gridColumnSizes as string)
          .split(' ')
          .map(size => ({ value: Number(size.slice(0, -2)), unit: size.slice(-2) })) :
        blueprint.gridColumnSizes as Measurement[],
      gridRowSizes: typeof blueprint.gridRowSizes === 'string' ?
        (blueprint.gridRowSizes as string)
          .split(' ')
          .map(size => ({ value: Number(size.slice(0, -2)), unit: size.slice(-2) })) :
        blueprint.gridRowSizes as Measurement[]
    };
  }
}
