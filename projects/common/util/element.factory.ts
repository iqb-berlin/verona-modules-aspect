import { UIElement } from '../models/uI-element';
import { TextElement } from '../models/text-element';
import { ButtonElement } from '../models/button-element';
import { TextFieldElement } from '../models/text-field-element';
import { TextAreaElement } from '../models/text-area-element';
import { CheckboxElement } from '../models/checkbox-element';
import { DropdownElement } from '../models/dropdown-element';
import { RadioButtonGroupElement } from '../models/radio-button-group-element';
import { ImageElement } from '../models/image-element';
import { AudioElement } from '../models/audio-element';
import { VideoElement } from '../models/video-element';

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
