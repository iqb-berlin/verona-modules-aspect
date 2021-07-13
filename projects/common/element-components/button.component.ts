import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-button',
  template: `
    <button mat-button
            [style.width.px]="elementModel.width"
            [style.height.px]="elementModel.height"
            [style.background-color]="elementModel.backgroundColor"
            [style.color]="elementModel.fontColor"
            [style.font-family]="elementModel.font"
            [style.font-size.px]="elementModel.fontSize"
            [style.font-weight]="elementModel.bold ? 'bold' : ''"
            [style.font-style]="elementModel.italic ? 'italic' : ''"
            [style.text-decoration]="elementModel.underline ? 'underline' : ''">
      {{$any(elementModel).label}}
    </button>
  `
})
export class ButtonComponent extends CanvasElementComponent { }
