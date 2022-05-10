import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, InputElement, PositionedUIElement, PositionProperties, UIElement } from 'common/classes/element';

export class ClozeElement extends UIElement implements PositionedUIElement {
  document: ClozeDocument;
  columnCount: number = 1;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<ClozeElement>) {
    super(element);
    Object.assign(this, element);
    this.document = {} as ClozeDocument;
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps(element.styling),
      lineHeight: element.styling?.lineHeight || 150
    };
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
