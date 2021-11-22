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
import { LikertElement } from '../models/compound-elements/likert-element';
import { LikertComponent } from '../element-components/compound-elements/likert.component';
import { RadioGroupImagesComponent } from '../element-components/compound-elements/radio-group-images.component';
import { RadioGroupImagesElement } from '../models/compound-elements/radio-group-images';
import { DropListComponent } from '../element-components/compound-elements/drop-list.component';
import { DropListElement } from '../models/compound-elements/drop-list';
import { SliderElement } from '../models/slider-element';
import { SliderComponent } from '../element-components/slider.component';
import { SpellCorrectElement } from '../models/spell-correct-element';
import { SpellCorrectComponent } from '../element-components/spell-correct.component';

export function createElement(elementModel: UIElement): UIElement {
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
      break;
    case 'slider':
      newElement = new SliderElement(elementModel);
      break;
    case 'spell-correct':
      newElement = new SpellCorrectElement(elementModel);
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
    case 'likert':
      return componentFactoryResolver.resolveComponentFactory(LikertComponent);
    case 'radio-group-images':
      return componentFactoryResolver.resolveComponentFactory(RadioGroupImagesComponent);
    case 'drop-list':
      return componentFactoryResolver.resolveComponentFactory(DropListComponent);
    case 'slider':
      return componentFactoryResolver.resolveComponentFactory(SliderComponent);
    case 'spell-correct':
      return componentFactoryResolver.resolveComponentFactory(SpellCorrectComponent);
    default:
      throw new Error('unknown element');
  }
}
