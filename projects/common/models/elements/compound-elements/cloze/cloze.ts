import {
  CompoundElement,
  InputElement,
  PositionedUIElement,
  UIElement, UIElementProperties, UIElementType, UIElementValue
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ClozeComponent } from 'common/components/compound-elements/cloze/cloze.component';
import {
  TextFieldSimpleElement, TextFieldSimpleProperties
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import {
  ToggleButtonElement,
  ToggleButtonProperties
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import { ButtonElement, ButtonProperties } from 'common/models/elements/button/button';
import { DropListElement, DropListProperties } from 'common/models/elements/input-elements/drop-list';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class ClozeElement extends CompoundElement implements PositionedUIElement, ClozeProperties {
  type: UIElementType = 'cloze';
  document: ClozeDocument = { type: 'doc', content: [] };
  columnCount: number = 1;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element?: ClozeProperties) {
    super(element);
    if (element && isValid(element)) {
      this.columnCount = element.columnCount;
      this.document = ClozeElement.initDocument(element.document);
      this.position = element.position;
      this.styling = element.styling;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Cloze instantiation', element);
      }
      if (element?.columnCount !== undefined) this.columnCount = element.columnCount;
      this.document = ClozeElement.initDocument(element?.document);
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 200,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        lineHeight: element?.styling?.lineHeight || 150
      };
    }
  }

  setProperty(property: string, value: UIElementValue): void {
    if (property === 'document') {
      this.document = value as ClozeDocument;
      this.document.content.forEach((node: any) => {
        if (node.type === 'paragraph' || node.type === 'heading') {
          ClozeElement.createSubNodeElements(node);
        } else if (node.type === 'bulletList' || node.type === 'orderedList') {
          node.content.forEach((listItem: any) => {
            listItem.content.forEach((listItemParagraph: any) => {
              ClozeElement.createSubNodeElements(listItemParagraph);
            });
          });
        } else if (node.type === 'blockquote') {
          node.content.forEach((blockQuoteItem: any) => {
            ClozeElement.createSubNodeElements(blockQuoteItem);
          });
        }
      });
    } else {
      super.setProperty(property, value);
    }
  }

  private static createSubNodeElements(node: any) {
    node.content?.forEach((subNode: any) => {
      if (['ToggleButton', 'DropList', 'TextField', 'Button'].includes(subNode.type) &&
        subNode.attrs.model.id === 'cloze-child-id-placeholder') {
        subNode.attrs.model =
          ClozeElement.createChildElement(subNode.attrs.model);
      }
    });
  }

  static initDocument(document?: ClozeDocument): ClozeDocument {
    return {
      ...document,
      type: 'doc',
      content: document?.content ? document.content
        .map((paragraph: ClozeDocumentParagraph) => ({
          ...paragraph,
          content: paragraph.content ? paragraph.content
            .map((paraPart: ClozeDocumentParagraphPart) => (
              ['TextField', 'DropList', 'ToggleButton', 'Button'].includes(paraPart.type) ?
                {
                  ...paraPart,
                  attrs: {
                    ...paraPart.attrs,
                    model: ClozeElement.createChildElement(paraPart.attrs?.model as InputElement)
                  }
                } :
                {
                  ...paraPart
                }
            )) : undefined
        })) : [{
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
          indent: null,
          indentSize: 20,
          hangingIndent: false,
          margin: 0
        },
        content: [
          {
            text: 'Lorem Ipsum',
            type: 'text'
          }
        ]
      }]
    } as ClozeDocument;
  }

  getElementComponent(): Type<ElementComponent> {
    return ClozeComponent;
  }

  getChildElements(): UIElement[] {
    return ClozeElement.getDocumentChildElements(this.document);
  }

  static getDocumentChildElements(document: ClozeDocument): UIElement[] {
    if (!document) return [];
    const clozeDocument: ClozeDocument = document;
    const elementList: InputElement[] = [];
    clozeDocument.content.forEach((documentPart: ClozeDocumentParagraph) => {
      if (documentPart.type === 'paragraph' || documentPart.type === 'heading') {
        elementList.push(...ClozeElement.getParagraphCustomElements(documentPart));
      } else if (documentPart.type === 'bulletList' || documentPart.type === 'orderedList') {
        documentPart.content.forEach((listItem: any) => {
          listItem.content.forEach((listItemParagraph: any) => {
            elementList.push(...ClozeElement.getParagraphCustomElements(listItemParagraph));
          });
        });
      } else if (documentPart.type === 'blockquote') {
        documentPart.content.forEach((blockQuoteItem: any) => {
          elementList.push(...ClozeElement.getParagraphCustomElements(blockQuoteItem));
        });
      }
    });
    return elementList;
  }

  private static createChildElement(elementModel: Partial<UIElement>): InputElement | ButtonElement {
    let newElement: InputElement | ButtonElement;
    switch (elementModel.type) {
      case 'text-field-simple':
        newElement = new TextFieldSimpleElement(elementModel as unknown as TextFieldSimpleProperties);
        break;
      case 'drop-list':
        newElement = new DropListElement(elementModel as unknown as DropListProperties);
        break;
      case 'toggle-button':
        newElement = new ToggleButtonElement(elementModel as unknown as ToggleButtonProperties);
        break;
      case 'button':
        newElement = new ButtonElement(elementModel as unknown as ButtonProperties);
        break;
      default:
        throw new Error(`ElementType ${elementModel.type} not found!`);
    }
    delete newElement.position;
    return newElement;
  }

  private static getParagraphCustomElements(documentPart: any): InputElement[] {
    if (!documentPart.content) {
      return [];
    }
    return documentPart.content
      .filter((word: ClozeDocumentParagraphPart) => ['TextField', 'DropList', 'ToggleButton', 'Button'].includes(word.type))
      .reduce((accumulator: any[], currentValue: any) => accumulator.concat(currentValue.attrs.model), []);
  }
}

export interface ClozeProperties extends UIElementProperties {
  document: ClozeDocument;
  columnCount: number;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isValid(blueprint?: ClozeProperties): boolean {
  if (!blueprint) return false;
  return blueprint.document !== undefined &&
    blueprint.columnCount !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling.lineHeight !== undefined;
}

export interface ClozeDocument {
  type: string;
  content: ClozeDocumentParagraph[]
}

export interface ClozeDocumentParagraph {
  type: string;
  attrs: Record<string, string | number | boolean>;
  content: ClozeDocumentParagraphPart[];
}

export interface ClozeDocumentParagraphPart {
  type: string;
  text?: string;
  marks?: Record<string, any>[];
  attrs?: Record<string, string | number | boolean | InputElement>;
}

export interface ClozeMarks {
  'font-weight'?: string;
  'font-style'?: string;
  'text-decoration'?: string;
  fontSize?: string;
  color?: string;
  'background-color'?: string;
}
