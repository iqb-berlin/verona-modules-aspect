import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import ToggleButtonExtension from './tiptap-editor-extensions/toggle-button';
import DropListExtension from './tiptap-editor-extensions/drop-list';
import TextFieldExtension from './tiptap-editor-extensions/text-field';
import {
  UIElement, InputElement, CompoundElement,
  ClozeDocument,
  PositionedElement, PositionProperties,
  FontElement, FontProperties, ClozeDocumentParagraph, ClozeDocumentPart
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
    return this.document.content
      .filter((paragraph: ClozeDocumentParagraph) => paragraph.content) // filter empty paragraphs
      .map((paragraph: ClozeDocumentParagraph) => paragraph.content // get custom paragraph parts
        .filter((word: ClozeDocumentPart) => ['TextField', 'DropList', 'ToggleButton'].includes(word.type)))
      .reduce((accumulator: any[], currentValue: any) => accumulator // put all collected paragraph parts into one list
        .concat(currentValue.map((node: ClozeDocumentPart) => node.attrs?.model)), []); // model is in node.attrs.model
  }

  private handleBackwardsCompatibility(serializedElement: Partial<UIElement>): void {
    const childModels = ClozeElement.parseElementList(serializedElement.parts);

    const textFieldElementList = Object.values(childModels).filter((el: any) => el.type === 'text-field');
    const dropListElementList = Object.values(childModels).filter((el: any) => el.type === 'drop-list');
    const radioElementList = Object.values(childModels).filter((el: any) => el.type === 'toggle-button');

    const replacedText = (serializedElement.text as string).replace(/\\i|\\z|\\r/g, match => {
      switch (match) {
        case '\\i':
          return `<app-nodeview-text-field id="${textFieldElementList.shift()?.id}"></app-nodeview-text-field>`;
          break;
        case '\\z':
          return `<app-nodeview-drop-list id="${dropListElementList.shift()?.id}"></app-nodeview-drop-list>`;
          break;
        case '\\r':
          return `<app-nodeview-toggle-button id="${radioElementList.shift()?.id}"></app-nodeview-toggle-button>`;
          break;
        default:
          throw Error('error in match');
      }
      return match;
    });

    if (textFieldElementList.length === 0 ||
        dropListElementList.length === 0 ||
        radioElementList.length === 0) {
      throw Error('Error while reading cloze element!');
    }

    const editor = new Editor({
      extensions: [
        StarterKit,
        ToggleButtonExtension,
        DropListExtension,
        TextFieldExtension
      ],
      content: replacedText
    });
    this.document = editor.getJSON() as ClozeDocument;
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
