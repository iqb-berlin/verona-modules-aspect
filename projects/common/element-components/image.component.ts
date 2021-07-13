import { Component } from '@angular/core';
import { FormElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-image',
  template: `
      <img src="{{$any(elementModel).src}}" alt="Image Placeholder">
  `
})
export class ImageComponent extends FormElementComponent { }
