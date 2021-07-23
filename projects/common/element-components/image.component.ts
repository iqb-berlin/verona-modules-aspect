import { Component } from '@angular/core';
import { ImageElement } from '../unit';
import { ElementComponent } from '../element-component.directive';

@Component({
  selector: 'app-image',
  template: `
      <img src="{{elementModel.src}}" alt="Image Placeholder">
  `
})
export class ImageComponent extends ElementComponent {
  elementModel!: ImageElement;
}
