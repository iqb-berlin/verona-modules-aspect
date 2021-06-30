import { ComponentFactory, ComponentFactoryResolver } from '@angular/core';
import { CanvasElementComponent } from './canvas-element-component.directive';
import { LabelComponent } from './element-components/label.component';
import { ButtonComponent } from './element-components/button.component';
import { TextFieldComponent } from './element-components/text-field.component';
import { CheckboxComponent } from './element-components/checkbox.component';
import { DropdownComponent } from './element-components/dropdown.component';
import { RadioButtonGroupComponent } from './element-components/radio-button-group.component';
import { ImageComponent } from './element-components/image.component';
import { AudioComponent } from './element-components/audio.component';
import { VideoComponent } from './element-components/video.component';
import { CorrectionComponent } from './element-components/compound-components/correction.component';

export function getComponentFactory(
  elementType: string,
  componentFactoryResolver: ComponentFactoryResolver): ComponentFactory<CanvasElementComponent> {
  switch (elementType) {
    case 'label':
      return componentFactoryResolver.resolveComponentFactory(LabelComponent);
    case 'button':
      return componentFactoryResolver.resolveComponentFactory(ButtonComponent);
    case 'text-field':
      return componentFactoryResolver.resolveComponentFactory(TextFieldComponent);
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
    case 'correction':
      return componentFactoryResolver.resolveComponentFactory(CorrectionComponent);
    default:
      throw new Error('unknown element');
  }
}
