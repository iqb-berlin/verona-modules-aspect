import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { SliderElement } from '../models/slider-element';
import { FormElementComponent } from '../form-element-component.directive';
import {ValidatorFn, Validators} from "@angular/forms";

@Component({
  selector: 'app-slider',
  template: `
    <div [style.display]="'flex'"
         [style.flex-direction]="'row'"
         [style.background-color]="elementModel.backgroundColor"
         [style.width.%]="100"
         [style.height.%]="100">
      <div *ngIf="elementModel.showValues"
           [style.color]="elementModel.fontColor"
           [style.font-family]="elementModel.font"
           [style.font-size.px]="elementModel.fontSize"
           [style.line-height.%]="elementModel.lineHeight"
           [style.font-weight]="elementModel.bold ? 'bold' : ''"
           [style.font-style]="elementModel.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.underline ? 'underline' : ''">{{elementModel.minValue | number:'.0'}}</div>
      <div [style.display]="'flex'"
           [style.flex-direction]="'column'"
           [style.width.%]="100"
           [style.height.%]="100">
        <mat-slider
          [formControl]="elementFormControl"
          [disabled]="elementModel.readOnly"
          [style.width.%]="100"
          [max]="elementModel.maxValue"
          [min]="elementModel.minValue">
        </mat-slider>
        <mat-error *ngIf="elementFormControl.touched && elementFormControl.errors">
          {{elementFormControl.errors | errorTransform: elementModel}}
        </mat-error>
      </div>
      <div *ngIf="elementModel.showValues"
           [style.color]="elementModel.fontColor"
           [style.font-family]="elementModel.font"
           [style.font-size.px]="elementModel.fontSize"
           [style.line-height.%]="elementModel.lineHeight"
           [style.font-weight]="elementModel.bold ? 'bold' : ''"
           [style.font-style]="elementModel.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.underline ? 'underline' : ''"
      >{{elementModel.maxValue | number:'.0'}}</div>
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
  // todo: ?? setting disabled attribute of slider may cause 'changed after checked' error
  // todo: localize 'number' pipe to show '.' instead of ',' by values greater then 999

  get validators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.elementModel.required) {
      validators.push(Validators.min(this.elementModel.minValue + 1));
    }
    return validators;
  }
}
