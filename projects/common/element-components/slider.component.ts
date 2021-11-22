import { Component, OnInit, ViewChild } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { MatSlider } from '@angular/material/slider';
import { SliderElement } from '../models/slider-element';
import { FormElementComponent } from '../form-element-component.directive';

@Component({
  selector: 'app-slider',
  template: `
    <div fxLayout="column"
         [style.background-color]="elementModel.backgroundColor"
         [style.width.%]="100"
         [style.height.%]="100">
      <div *ngIf="elementModel.label"
         [style.color]="elementModel.fontColor"
         [style.font-family]="elementModel.font"
         [style.font-size.px]="elementModel.fontSize"
         [style.line-height.%]="elementModel.lineHeight"
         [style.font-weight]="elementModel.bold ? 'bold' : ''"
         [style.font-style]="elementModel.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.underline ? 'underline' : ''">
          {{elementModel.label}}
      </div>
      <div fxFlex fxLayout="row">
        <div *ngIf="elementModel.showValues" fxFlex
             [style.color]="elementModel.fontColor"
             [style.font-family]="elementModel.font"
             [style.font-size.px]="elementModel.fontSize"
             [style.line-height.%]="elementModel.lineHeight"
             [style.font-weight]="elementModel.bold ? 'bold' : ''"
             [style.font-style]="elementModel.italic ? 'italic' : ''"
             [style.text-decoration]="elementModel.underline ? 'underline' : ''">
          {{elementModel.minValue | number:'.0'}}
        </div>
        <div [style.display]="'flex'"
             [style.flex-direction]="'column'"
             [style.width.%]="100"
             [style.height.%]="100">
          <mat-slider
            [class]="elementModel.barStyle ? 'bar-style' : ''"
            [formControl]="elementFormControl"
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
    </div>
  `,
  styles: [
    ':host ::ng-deep .bar-style .mat-slider-thumb {border-radius: 0; width: 10px; height: 40px; bottom: -15px}'
  ]
})
export class SliderComponent extends FormElementComponent implements OnInit {
  @ViewChild(MatSlider) inputElement!: MatSlider;
  elementModel!: SliderElement;

  get validators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.elementModel.required) {
      validators.push(Validators.min(this.elementModel.minValue + 1));
    }
    return validators;
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.inputElement) {
      this.inputElement.disabled = this.elementModel.readOnly;
    }
  }
}
