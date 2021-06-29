import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-checkbox',
  template: `
      <mat-checkbox class="example-margin" [ngStyle]="style">
          {{$any(elementModel).label}}
      </mat-checkbox>
  `
})
export class CheckboxComponent extends CanvasElementComponent { }
