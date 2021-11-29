import { ComponentFactory, ComponentFactoryResolver } from '@angular/core';
import { UIElement } from '../models/uI-element';
import { TextElement } from '../ui-elements/text/text-element';
import { ButtonElement } from '../ui-elements/button/button-element';
import { TextFieldElement } from '../ui-elements/text-field/text-field-element';
import { TextAreaElement } from '../ui-elements/text-area/text-area-element';
import { CheckboxElement } from '../ui-elements/checkbox/checkbox-element';
import { DropdownElement } from '../ui-elements/dropdown/dropdown-element';
import { RadioButtonGroupElement } from '../ui-elements/radio/radio-button-group-element';
import { ImageElement } from '../ui-elements/image/image-element';
import { AudioElement } from '../ui-elements/audio/audio-element';
import { VideoElement } from '../ui-elements/video/video-element';
import { TextComponent } from '../ui-elements/text/text.component';
import { ButtonComponent } from '../ui-elements/button/button.component';
import { TextFieldComponent } from '../ui-elements/text-field/text-field.component';
import { TextAreaComponent } from '../ui-elements/text-area/text-area.component';
import { CheckboxComponent } from '../ui-elements/checkbox/checkbox.component';
import { DropdownComponent } from '../ui-elements/dropdown/dropdown.component';
import { RadioButtonGroupComponent } from '../ui-elements/radio/radio-button-group.component';
import { ImageComponent } from '../ui-elements/image/image.component';
import { AudioComponent } from '../ui-elements/audio/audio.component';
import { VideoComponent } from '../ui-elements/video/video.component';
import { LikertElement } from '../ui-elements/likert/likert-element';
import { LikertComponent } from '../ui-elements/likert/likert.component';
import { RadioGroupImagesComponent } from '../ui-elements/radio-with-images/radio-group-images.component';
import { RadioGroupImagesElement } from '../ui-elements/radio-with-images/radio-group-images';
import { DropListComponent } from '../ui-elements/drop-list/drop-list.component';
import { DropListElement } from '../ui-elements/drop-list/drop-list';
import { ClozeComponent } from '../ui-elements/cloze/cloze.component';
import { ClozeElement } from '../ui-elements/cloze/cloze-element';
import { SliderElement } from '../ui-elements/slider/slider-element';
import { SpellCorrectElement } from '../ui-elements/spell-correct/spell-correct-element';
import { SliderComponent } from '../ui-elements/slider/slider.component';
import { SpellCorrectComponent } from '../ui-elements/spell-correct/spell-correct.component';

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
    case 'cloze':
      newElement = new ClozeElement(elementModel);
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
    case 'cloze':
      return componentFactoryResolver.resolveComponentFactory(ClozeComponent);
    case 'slider':
      return componentFactoryResolver.resolveComponentFactory(SliderComponent);
    case 'spell-correct':
      return componentFactoryResolver.resolveComponentFactory(SpellCorrectComponent);
    default:
      throw new Error('unknown element');
  }
}
