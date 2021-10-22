import { ComponentFactory, ComponentFactoryResolver } from '@angular/core';
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
import { FileService } from '../file.service';
import { TextComponent } from '../element-components/text.component';
import { ButtonComponent } from '../element-components/button.component';
import { TextFieldComponent } from '../element-components/text-field.component';
import { TextAreaComponent } from '../element-components/text-area.component';
import { CheckboxComponent } from '../element-components/checkbox.component';
import { DropdownComponent } from '../element-components/dropdown.component';
import { RadioButtonGroupComponent } from '../element-components/radio-button-group.component';
import { ImageComponent } from '../element-components/image.component';
import { AudioComponent } from '../element-components/audio.component';
import { VideoComponent } from '../element-components/video.component';

export async function createElement(elementModel: UIElement, coordinates?: { x: number; y: number }): Promise<UIElement> {
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
      if (!elementModel.src) {
        elementModel.src = await FileService.loadImage();
      }
      newElement = new ImageElement(elementModel, coordinates);
      break;
    case 'audio':
      if (!elementModel.src) {
        elementModel.src = await FileService.loadAudio();
      }
      newElement = new AudioElement(elementModel, coordinates);
      break;
    case 'video':
      if (!elementModel.src) {
        elementModel.src = await FileService.loadVideo();
      }
      newElement = new VideoElement(elementModel, coordinates);
      break;
    default:
      throw new Error(`ElementType ${elementModel.type} not found!`);
  }
  console.log('newElement', newElement);
  return newElement;
}

export function getComponentFactory(
  elementType: string, componentFactoryResolver: ComponentFactoryResolver
): ComponentFactory<any> {
  // TODO: Find better solution than any
  switch (elementType) {
    case 'text':
      return componentFactoryResolver.resolveComponentFactory(TextComponent);
    case 'button':
      return componentFactoryResolver.resolveComponentFactory(ButtonComponent);
    case 'text-field':
      return componentFactoryResolver.resolveComponentFactory(TextFieldComponent);
    case 'text-area':
      return componentFactoryResolver.resolveComponentFactory(TextAreaComponent);
    case 'checkbox':
      return componentFactoryResolver.resolveComponentFactory(CheckboxComponent);
    case 'dropdown':
      return componentFactoryResolver.resolveComponentFactory(DropdownComponent);
    case 'radio':
      return componentFactoryResolver.resolveComponentFactory(RadioButtonGroupComponent);
    case 'image':
      return componentFactoryResolver.resolveComponentFactory(ImageComponent);
    case 'audio':
      return componentFactoryResolver.resolveComponentFactory(AudioComponent);
    case 'video':
      return componentFactoryResolver.resolveComponentFactory(VideoComponent);
    default:
      throw new Error('unknown element');
  }
}
