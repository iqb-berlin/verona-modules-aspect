import { Component, EventEmitter, Output } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { SliderElement } from '../models/slider-element';
import { FormElementComponent } from '../form-element-component.directive';

@Component({
  selector: 'app-slider',
  template: `
    <div [style.display]="'flex'"
         [style.background-color]="elementModel.backgroundColor"
         [style.width.%]="100"
         [style.height.%]="100">
      <div *ngIf="elementModel.showValues">{{elementModel.minValue | number:'.0'}}</div>
      <mat-slider
              [formControl]="elementFormControl"
              [style.width.%]="100"
              [style.height.%]="100"
              [max]="elementModel.maxValue"
              [min]="elementModel.minValue">
      </mat-slider>
      <div *ngIf="elementModel.showValues">{{elementModel.maxValue | number:'.0'}}</div>
    </div>
  `,
  styles: [
    '.dynamic-image{width: 100%; height: fit-content}',
    '.static-image{ width: 100%; height: 100%; object-fit: contain}',
    ':host ::ng-deep .mat-slider-thumb{border-radius: 0; width: 10px; height: 40px; bottom: -15px}'
  ]
})
export class SliderComponent extends FormElementComponent {
  elementModel!: SliderElement;
}
