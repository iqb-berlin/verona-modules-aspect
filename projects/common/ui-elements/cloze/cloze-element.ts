import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import ToggleButtonExtension from './tiptap-editor-extensions/toggle-button';
import DropListExtension from './tiptap-editor-extensions/drop-list';
import TextFieldExtension from './tiptap-editor-extensions/text-field';
import {
  UIElement, InputElement, CompoundElement,
  ClozeDocument,
  PositionedElement, PositionProperties,
  FontElement, FontProperties, ClozeDocumentParagraphPart, ClozeDocumentParagraph
} from '../../models/uI-element';
import { initFontElement, initPositionedElement } from '../../util/unit-interface-initializer';
import { TextFieldSimpleElement } from '../textfield-simple/text-field-simple-element';
import { DropListSimpleElement } from '../drop-list-simple/drop-list-simple';
import { ToggleButtonElement } from '../toggle-button/toggle-button';

export class ClozeElement extends CompoundElement implements PositionedElement, FontElement {
  document: ClozeDocument = { type: 'doc', content: [] };

  positionProps: PositionProperties;
  fontProps: FontProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);

    if (serializedElement.document) {
      serializedElement.document.content.forEach((paragraph: any) => {
        paragraph.content?.forEach((node: any) => {
          if (['ToggleButton', 'DropList', 'TextField'].includes(node.type)) {
            node.attrs.model = ClozeElement.createElement(node.attrs.model);
          }
        });
      });
    }

    // text property indicates old unit definition
    if (serializedElement.text) {
      this.handleBackwardsCompatibility(serializedElement);
    }

    this.width = serializedElement.width || 450;
    this.height = serializedElement.height || 200;
  }

  getChildElements(): InputElement[] {
    const elementList: InputElement[] = [];
    this.document.content.forEach((documentPart: ClozeDocumentParagraph) => {
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

  private handleBackwardsCompatibility(serializedElement: Partial<UIElement>): void {
    const childModels = ClozeElement.parseElementList(serializedElement.parts);

    const newText = ClozeElement.replaceElementMarkers(serializedElement.text);
    const newDocument = ClozeElement.createClozeDocument(newText);
    this.document = ClozeElement.createDocumentModels(newDocument, childModels);
    delete this.text;
    delete this.parts;
  }

  static replaceElementMarkers(text: string): string {
    return text.replace(/\\i|\\z|\\r/g, match => {
      switch (match) {
        case '\\i':
          return '<app-nodeview-text-field></app-nodeview-text-field>';
        case '\\z':
          return '<app-nodeview-drop-list></app-nodeview-drop-list>';
        case '\\r':
          return '<app-nodeview-toggle-button></app-nodeview-toggle-button>';
        default:
          throw Error('error in match');
      }
    });
  }

  static createClozeDocument(text: string): ClozeDocument {
    const editor = new Editor({
      extensions: [
        StarterKit,
        ToggleButtonExtension,
        DropListExtension,
        TextFieldExtension
      ],
      content: text
    });
    return editor.getJSON() as ClozeDocument;
  }

  private static createDocumentModels(document: ClozeDocument, modelList: InputElement[]): ClozeDocument {
    document.content.forEach((paragraph: ClozeDocumentParagraph) => {
      paragraph.content.forEach((part: ClozeDocumentParagraphPart) => {
        if (['TextField', 'DropList', 'ToggleButton'].includes(part.type)) {
          part.attrs!.model = ClozeElement.createElement(modelList.shift() as InputElement);
        }
      });
    });
    return document;
  }

  private static parseElementList(
    serializedParts: { type: string; value: string | UIElement; style?: string; }[][]
  ): InputElement[] {
    const knownElementTypes = ['text-field', 'drop-list', 'toggle-button'];
    const newElementList: InputElement[] = [];

    serializedParts.forEach((part: any) => {
      for (const subPart of part) {
        if (knownElementTypes.includes(subPart.type)) {
          newElementList.push(subPart.value);
        }
      }
    });
    return newElementList;
  }

  private static createElement(elementModel: Partial<UIElement>): InputElement {
    let newElement: InputElement;
    switch (elementModel.type) {
      case 'text-field':
        newElement = new TextFieldSimpleElement(elementModel);
        break;
      case 'drop-list':
        newElement = new DropListSimpleElement(elementModel);
        break;
      case 'toggle-button':
        newElement = new ToggleButtonElement(elementModel);
        break;
      default:
        throw new Error(`ElementType ${elementModel.type} not found!`);
    }
    return newElement;
  }
}
