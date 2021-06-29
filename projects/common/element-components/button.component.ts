import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-button',
  template: `
    <button mat-button
            [ngStyle]="style">
      {{$any(elementModel).label}}
    </button>
  `
})
export class ButtonComponent extends CanvasElementComponent { }
