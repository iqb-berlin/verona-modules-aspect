import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  CompoundElement,
  InputElement,
  PositionedUIElement,
  PositionProperties,
  UIElement
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ClozeComponent } from 'common/components/compound-elements/cloze/cloze.component';

export class ClozeElement extends CompoundElement implements PositionedUIElement {
  document: ClozeDocument = { type: 'doc', content: [] };
  columnCount: number = 1;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<ClozeElement>) {
    super({ height: 200, ...element });
    Object.assign(this, element);
    this.document = this.initDocument(element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({ lineHeight: 150, ...element.styling })
    };
  }

  private initDocument(element: Partial<ClozeElement>): ClozeDocument {
    return {
      ...element.document,
      content: element.document?.content
        .map((paragraph: ClozeDocumentParagraph) => ({
          ...paragraph,
          content: paragraph.content
            .map((paraPart: ClozeDocumentParagraphPart) => (
              ['TextField', 'DropList', 'ToggleButton'].includes(paraPart.type) ?
                {
                  ...paraPart,
                  attrs: {
                    ...paraPart.attrs,
                    model: ElementFactory.createElement(
                      (paraPart.attrs?.model as InputElement).type, paraPart.attrs?.model as InputElement
                    )
                  }
                } :
                {
                  ...paraPart
                }
            ))
        }))
    };
  }

  getComponentFactory(): Type<ElementComponent> {
    return ClozeComponent;
  }

  getChildElements(): UIElement[] {
    if (!this.document) return [];
    const clozeDocument: ClozeDocument = this.document;
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
