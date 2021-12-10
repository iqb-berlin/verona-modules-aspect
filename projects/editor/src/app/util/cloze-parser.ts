import { InputElement, UIElement, ClozePart } from '../../../../common/models/uI-element';
import { TextFieldSimpleElement } from '../../../../common/ui-elements/textfield-simple/text-field-simple-element';
import { TextFieldElement } from '../../../../common/ui-elements/text-field/text-field-element';
import { TextAreaElement } from '../../../../common/ui-elements/text-area/text-area-element';
import { CheckboxElement } from '../../../../common/ui-elements/checkbox/checkbox-element';
import { DropdownElement } from '../../../../common/ui-elements/dropdown/dropdown-element';
import { DropListSimpleElement } from '../../../../common/ui-elements/drop-list-simple/drop-list-simple';
import { ToggleButtonElement } from '../../../../common/ui-elements/toggle-button/toggle-button';
import { IdService } from '../services/id.service';

export abstract class ClozeParser {
  static parse(text: string, idService: IdService): ClozePart[][] {
    return ClozeParser.createParts(text, idService);
  }

  private static createParts(htmlText: string, idService: IdService): ClozePart[][] {
    const elementList = ClozeParser.readElementArray(htmlText);

    const parts: ClozePart[][] = [];
    elementList.forEach((element: HTMLParagraphElement | HTMLHeadingElement, i: number) => {
      ClozeParser.parseParagraphs(element, i, parts, idService);
    });
    return parts;
  }

  private static readElementArray(htmlText: string): (HTMLParagraphElement | HTMLHeadingElement)[] {
    const el = document.createElement('html');
    el.innerHTML = htmlText;
    return Array.from(el.children[1].children) as (HTMLParagraphElement | HTMLHeadingElement)[];
  }

  // TODO refactor passed parts, so the Part is returned instead if manipulating the param array
  private static parseParagraphs(
    element: HTMLParagraphElement | HTMLHeadingElement, partIndex: number, parts: ClozePart[][], idService: IdService
  ): ClozePart[][] {
    parts[partIndex] = [];
    let [nextSpecialElementIndex, nextElementType] = ClozeParser.getNextSpecialElement(element.innerHTML);
    let indexOffset = 0;

    while (nextSpecialElementIndex !== -1) {
      nextSpecialElementIndex += indexOffset;
      parts[partIndex].push({
        type: element.localName,
        value: element.innerHTML.substring(indexOffset, nextSpecialElementIndex),
        style: element.style.cssText
      });

      const newElement = ClozeParser.createElement({ type: nextElementType } as UIElement, idService);
      parts[partIndex].push({ type: nextElementType, value: newElement });

      indexOffset = nextSpecialElementIndex + 2; // + 2 to get rid of the marker, i.e. '\b'
      [nextSpecialElementIndex, nextElementType] =
        ClozeParser.getNextSpecialElement(element.innerHTML.substring(indexOffset));
    }
    parts[partIndex].push({
      type: element.localName,
      value: element.innerHTML.substring(indexOffset),
      style: element.style.cssText
    });
    return parts;
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
    if (p.indexOf('\\r') > 0) {
      x.push(p.indexOf('\\r'));
    }

    const y = Math.min(...x);
    let nextElementType = '';
    switch (p[y + 1]) {
      case 'd': nextElementType = 'dropdown'; break;
      case 'i': nextElementType = 'text-field'; break;
      case 'z': nextElementType = 'drop-list'; break;
      case 'r': nextElementType = 'toggle-button'; break;
      default: return [-1, 'unknown'];
    }
    return [y, nextElementType];
  }

  private static createElement(elementModel: Partial<UIElement>, idService: IdService): InputElement {
    let newElement: InputElement;
    elementModel.id = idService.getNewID(elementModel.type as string);
    switch (elementModel.type) {
      case 'text-field':
        newElement = new TextFieldSimpleElement(elementModel);
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
        newElement = new DropListSimpleElement(elementModel);
        newElement.height = 25;
        newElement.width = 100;
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
