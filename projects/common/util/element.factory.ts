import { UIElement } from '../classes/uIElement';
import { TextElement } from '../classes/textElement';
import { ButtonElement } from '../classes/buttonElement';
import { TextFieldElement } from '../classes/textFieldElement';
import { TextAreaElement } from '../classes/textAreaElement';
import { CheckboxElement } from '../classes/checkboxElement';
import { DropdownElement } from '../classes/dropdownElement';
import { RadioButtonGroupElement } from '../classes/radioButtonGroupElement';
import { ImageElement } from '../classes/imageElement';
import { AudioElement } from '../classes/audioElement';
import { VideoElement } from '../classes/videoElement';

export function createElement(elementModel: UIElement, coordinates?: { x: number; y: number }): UIElement {
  let newElement: UIElement;
  switch (elementModel.type) {
    case 'text':
      newElement = new TextElement(elementModel, coordinates);
      break;
    case 'button':
      newElement = new ButtonElement(elementModel, coordinates);
      break;
    case 'text-field':
      newElement = new TextFieldElement(elementModel, coordinates);
      break;
    case 'text-area':
      newElement = new TextAreaElement(elementModel, coordinates);
      break;
    case 'checkbox':
      newElement = new CheckboxElement(elementModel, coordinates);
      break;
    case 'dropdown':
      newElement = new DropdownElement(elementModel, coordinates);
      break;
    case 'radio':
      newElement = new RadioButtonGroupElement(elementModel, coordinates);
      break;
    case 'image':
      newElement = new ImageElement(elementModel, coordinates);
      break;
    case 'audio':
      newElement = new AudioElement(elementModel, coordinates);
      break;
    case 'video':
      newElement = new VideoElement(elementModel, coordinates);
      break;
    default:
      throw new Error(`ElementType ${elementModel.type} not found!`);
  }
  console.log('newElement', newElement);
  return newElement;
}
