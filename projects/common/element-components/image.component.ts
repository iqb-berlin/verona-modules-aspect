import { Component } from '@angular/core';
import { ImageElement } from '../unit';

@Component({
  selector: 'app-image',
  template: `
      <img src="{{elementModel.src}}" alt="Image Placeholder">
  `
})
export class ImageComponent {
  elementModel!: ImageElement;
}
