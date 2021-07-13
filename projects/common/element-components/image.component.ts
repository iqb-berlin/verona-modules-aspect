import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-image',
  template: `
      <img src="{{$any(elementModel).src}}" alt="Image Placeholder">
  `
})
export class ImageComponent extends CanvasElementComponent { }
