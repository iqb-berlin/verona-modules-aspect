import { ComponentFactory, ComponentFactoryResolver } from '@angular/core';
import { TextComponent } from './element-components/text.component';
import { ButtonComponent } from './element-components/button.component';
import { TextFieldComponent } from './element-components/text-field.component';
import { TextAreaComponent } from './element-components/text-area.component';
import { CheckboxComponent } from './element-components/checkbox.component';
import { DropdownComponent } from './element-components/dropdown.component';
import { RadioButtonGroupComponent } from './element-components/radio-button-group.component';
import { ImageComponent } from './element-components/image.component';
import { AudioComponent } from './element-components/audio.component';
import { VideoComponent } from './element-components/video.component';
import { LikertComponent } from './element-components/compound-elements/likert.component';

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
    default:
      throw new Error('unknown element');
  }
}
