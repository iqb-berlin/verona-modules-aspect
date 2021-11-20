import {
  CompoundElement, InputElement, InputElementValue, UIElement
} from '../uI-element';
import {
  ClozePart, FontElement, LikertColumn, LikertRow
} from '../../interfaces/UIElementInterfaces';
import { TextFieldElement } from '../text-field-element';
import { TextAreaElement } from '../text-area-element';
import { CheckboxElement } from '../checkbox-element';
import { DropdownElement } from '../dropdown-element';
import { DropListElement } from './drop-list';
import { initFontElement } from '../../util/unit-interface-initializer';

export class ClozeElement extends CompoundElement implements FontElement {
  text: string = '<p>Lorem ipsum dolor \\z sit amet \\i\n' +
    '\n' +
    'Lorem ipsum dolor \\z sit amet \\i\n' +
    '\n' +
    'Lorem ipsum dolor \\z sit amet \\i</p>';

  parts: ClozePart[][] = [];
  childElements: InputElement[] = [];

  fontColor: string = 'black';
  font: string = 'Roboto';
  fontSize: number = 20;
  lineHeight: number = 120;
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    Object.assign(this, initFontElement(serializedElement));
    this.createParts(this.text as string);

    this.height = 200;
    this.width = 500;
  }

  setProperty(property: string, value: InputElementValue | string[] | LikertColumn[] | LikertRow[]): void {
    super.setProperty(property, value);

    if (property === 'text') {
      this.createParts(value as string);
    }
  }

  private createParts(htmlText: string): void {
    const paragraphList = ClozeElement.readElementArray(htmlText);

    this.parts = [];
    paragraphList.forEach((p, i) => {
      this.parseParagraphs(p.innerText, i);
    });
    // console.log('PARTS:', this.parts);
  }

  private static readElementArray(htmlText: string): HTMLParagraphElement[] {
    const el = document.createElement('html');
    el.innerHTML = htmlText;
    return Array.from(el.getElementsByTagName('p'));
  }

  parseParagraphs(p: string, partIndex: number): void {
    this.parts[partIndex] = []; // init array to be able to push
    let [nextSpecialElementIndex, nextElementType] = ClozeElement.getNextSpecialElement(p);
    let indexOffset = 0;

    while (nextSpecialElementIndex !== -1) {
      nextSpecialElementIndex += indexOffset;
      this.parts[partIndex].push({ type: 'text', value: p.substring(indexOffset, nextSpecialElementIndex) });

      const newElement = ClozeElement.createElement(nextElementType);
      this.childElements.push(newElement);
      this.parts[partIndex].push({ type: nextElementType, value: newElement });

      indexOffset = nextSpecialElementIndex + 2; // + 2 to get rid of the marker, i.e. '\b'
      [nextSpecialElementIndex, nextElementType] =
        ClozeElement.getNextSpecialElement(p.substring(indexOffset));
    }
    this.parts[partIndex].push({ type: 'text', value: p.substring(indexOffset) });
  }

  private static getNextSpecialElement(p: string): [number, string] {
    const x = [];
    if (p.indexOf('\\d') > 0) {
      x.push(p.indexOf('\\d'));
    }
    if (p.indexOf('\\i') > 0) {
      x.push(p.indexOf('\\i'));
    }
    if (p.indexOf('\\z') > 0) {
      x.push(p.indexOf('\\z'));
    }

    const y = Math.min(...x);
    let nextElementType = '';
    switch (p[y + 1]) {
      case 'd': nextElementType = 'dropdown'; break;
      case 'i': nextElementType = 'text-field'; break;
      case 'z': nextElementType = 'drop-list'; break;
      default: return [-1, 'unknown'];
    }
    return [y, nextElementType];
  }

  private static createElement(elementType: string): InputElement {
    const elementModel: UIElement = { type: elementType } as UIElement;
    let newElement: InputElement;
    switch (elementModel.type) {
      case 'text-field':
        newElement = new TextFieldElement(elementModel);
        (newElement as TextFieldElement).label = '';
        break;
      case 'text-area':
        newElement = new TextAreaElement(elementModel);
        break;
      case 'checkbox':
        newElement = new CheckboxElement(elementModel);
        break;
      case 'dropdown':
        newElement = new DropdownElement(elementModel);
        break;
      case 'drop-list':
        newElement = new DropListElement(elementModel);
        newElement.height = 30;
        newElement.width = 100;
        break;
      default:
        throw new Error(`ElementType ${elementModel.type} not found!`);
    }
    console.log('newElement', newElement);
    return newElement;
  }
}
