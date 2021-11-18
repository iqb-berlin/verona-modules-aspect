import { CompoundElement, InputElementValue, UIElement } from '../uI-element';
import { ClozePart, LikertColumn, LikertRow } from '../../interfaces/UIElementInterfaces';
import { TextElement } from '../text-element';
import { ButtonElement } from '../button-element';
import { TextFieldElement } from '../text-field-element';
import { TextAreaElement } from '../text-area-element';
import { CheckboxElement } from '../checkbox-element';
import { DropdownElement } from '../dropdown-element';
import { RadioButtonGroupElement } from '../radio-button-group-element';
import { ImageElement } from '../image-element';
import { AudioElement } from '../audio-element';
import { VideoElement } from '../video-element';
import { LikertElement } from './likert-element';
import { RadioGroupImagesElement } from './radio-group-images';
import { DropListElement } from './drop-list';

export class ClozeElement extends CompoundElement {
  text: string = '<p>Lorem ipsum dolor \\z sit amet \\i</p>';
  parts: ClozePart[][] = [];
  childElements: UIElement[] = [];

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
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
    if (p.indexOf('\\b') > 0) {
      x.push(p.indexOf('\\b'));
    }
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
      case 'b': nextElementType = 'button'; break;
      case 'd': nextElementType = 'dropdown'; break;
      case 'i': nextElementType = 'text-field'; break;
      case 'z': nextElementType = 'drop-list'; break;
      default: return [-1, 'unknown'];
    }
    return [y, nextElementType];
  }

  private static createElement(elementType: string): UIElement {
    const elementModel: UIElement = { type: elementType } as UIElement;
    let newElement: UIElement;
    switch (elementModel.type) {
      case 'text':
        newElement = new TextElement(elementModel);
        break;
      case 'button':
        newElement = new ButtonElement(elementModel);
        break;
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
      case 'radio':
        newElement = new RadioButtonGroupElement(elementModel);
        break;
      case 'image':
        newElement = new ImageElement(elementModel);
        break;
      case 'audio':
        newElement = new AudioElement(elementModel);
        break;
      case 'video':
        newElement = new VideoElement(elementModel);
        break;
      case 'likert':
        newElement = new LikertElement(elementModel);
        break;
      case 'radio-group-images':
        newElement = new RadioGroupImagesElement(elementModel);
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
