import {
  ClozePart,
  CompoundElement,
  FontElement,
  FontProperties, InputElement,
  PositionedElement, PositionProperties,
  UIElement
} from '../../models/uI-element';
import { initFontElement, initPositionedElement } from '../../util/unit-interface-initializer';
import { TextFieldSimpleElement } from '../textfield-simple/text-field-simple-element';
import { TextFieldElement } from '../text-field/text-field-element';
import { TextAreaElement } from '../text-area/text-area-element';
import { CheckboxElement } from '../checkbox/checkbox-element';
import { DropdownElement } from '../dropdown/dropdown-element';
import { DropListSimpleElement } from '../drop-list-simple/drop-list-simple';
import { ToggleButtonElement } from '../toggle-button/toggle-button';

// TODO styles like em dont continue after inserted components

export class ClozeElement extends CompoundElement implements PositionedElement, FontElement {
  text: string = 'Lorem ipsum dolor \\r sdfsdf \\i sdfsdf';
  parts: ClozePart[][] = [];

  positionProps: PositionProperties;
  fontProps: FontProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);

    if (serializedElement?.parts) {
      serializedElement?.parts.forEach((subParts: ClozePart[]) => {
        subParts.forEach((part: ClozePart) => {
          if (!['p', 'h1', 'h2', 'h3', 'h4'].includes(part.type)) {
            part.value = ClozeElement.createElement(part.value as UIElement);
          }
        });
      });
    }

    this.width = serializedElement.width || 450;
    this.height = serializedElement.height || 200;
  }

  static createElement(elementModel: Partial<UIElement>): InputElement {
    let newElement: InputElement;
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
        newElement.height = 25; // TODO weg?
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
