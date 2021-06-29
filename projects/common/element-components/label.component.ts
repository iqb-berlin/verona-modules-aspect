import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-label',
  template: `
      <div [ngStyle]="style">
          {{$any(elementModel).label}}
      </div>
  `
})
export class LabelComponent extends CanvasElementComponent { }
