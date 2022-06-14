import {
  BasicStyles,
  CompoundElement,
  InputElement,
  PositionedUIElement,
  PositionProperties,
  UIElement, UIElementValue
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ClozeComponent } from 'common/components/compound-elements/cloze/cloze.component';
import { ElementFactory } from 'common/util/element.factory';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import {
  DropListSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/drop-list-simple';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import { IDManager } from 'common/util/id-manager';

export class ClozeElement extends CompoundElement implements PositionedUIElement {
  document: ClozeDocument = { type: 'doc', content: [] };
  columnCount: number = 1;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<ClozeElement>, idManager?: IDManager) {
    super({ height: 200, ...element }, idManager);
    if (element.columnCount) this.columnCount = element.columnCount;
    this.document = this.initDocument(element, idManager);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({ lineHeight: 150, ...element.styling })
    };
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
      if (['ToggleButton', 'DropList', 'TextField'].includes(subNode.type) &&
        subNode.attrs.model.id === 'cloze-child-id-placeholder') {
        const newID = IDManager.getInstance().getNewID(subNode.attrs.model.type);
        subNode.attrs.model =
          ClozeElement.createChildElement({ ...subNode.attrs.model, id: newID }, IDManager.getInstance());
      }
    });
  }

  private initDocument(element: Partial<ClozeElement>, idManager?: IDManager): ClozeDocument {
    return {
      ...element.document,
      content: element.document?.content ? element.document.content
        .map((paragraph: ClozeDocumentParagraph) => ({
          ...paragraph,
          content: paragraph.content
            .map((paraPart: ClozeDocumentParagraphPart) => (
              ['TextField', 'DropList', 'ToggleButton'].includes(paraPart.type) ?
                {
                  ...paraPart,
                  attrs: {
                    ...paraPart.attrs,
                    model: ClozeElement.createChildElement(paraPart.attrs?.model as InputElement, idManager)
                  }
                } :
                {
                  ...paraPart
                }
            ))
        })) : []
    } as ClozeDocument;
  }

  getComponentFactory(): Type<ElementComponent> {
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

  private static createChildElement(elementModel: Partial<UIElement>, idManager?: IDManager): InputElement {
    let newElement: InputElement;
    switch (elementModel.type) {
      case 'text-field-simple':
        newElement = new TextFieldSimpleElement(elementModel as TextFieldSimpleElement, idManager);
        break;
      case 'drop-list-simple':
        newElement = new DropListSimpleElement(elementModel as DropListSimpleElement, idManager);
        break;
      case 'toggle-button':
        newElement = new ToggleButtonElement(elementModel as ToggleButtonElement, idManager);
        break;
      default:
        throw new Error(`ElementType ${elementModel.type} not found!`);
    }
    // console.log('newElement', newElement);
    return newElement;
  }

  private static getParagraphCustomElements(documentPart: any): InputElement[] {
    if (!documentPart.content) {
      return [];
    }
    return documentPart.content
      .filter((word: ClozeDocumentParagraphPart) => ['TextField', 'DropList', 'ToggleButton'].includes(word.type))
      .reduce((accumulator: any[], currentValue: any) => accumulator.concat(currentValue.attrs.model), []);
  }
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
