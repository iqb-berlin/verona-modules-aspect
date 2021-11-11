import { Component, EventEmitter, Output } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { SliderElement } from '../models/slider-element';

@Component({
  selector: 'app-slider',
  template: `
    <div [style.display]="'flex'"
         [style.background-color]="elementModel.backgroundColor"
         [style.width.%]="100"
         [style.height.%]="100">
      <div *ngIf="elementModel.showLabel">{{elementModel.minValue | number:'.0'}}</div>
      <mat-slider
              [style.width.%]="100"
              [style.height.%]="100"
              [max]="elementModel.maxValue"
              [min]="elementModel.minValue">
      </mat-slider>
      <div *ngIf="elementModel.showLabel">{{elementModel.maxValue | number:'.0'}}</div>
    </div>
  `,
  styles: [
    '.dynamic-image{width: 100%; height: fit-content}',
    '.static-image{ width: 100%; height: 100%; object-fit: contain}'
  ]
})
export class SliderComponent extends ElementComponent {
  elementModel!: SliderElement;

}
