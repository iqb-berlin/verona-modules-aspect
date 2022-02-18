import { Component, OnInit, ViewChild } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { MatSlider } from '@angular/material/slider';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { SliderElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-slider',
  template: `
    <div fxLayout="column"
         [style.background-color]="elementModel.styles.backgroundColor"
         [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
         [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : '100%'"
         [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                    elementModel.positionProps.fixedSize">
      <div *ngIf="elementModel.label"
           [style.color]="elementModel.styles.fontColor"
           [style.font-family]="elementModel.styles.font"
           [style.font-size.px]="elementModel.styles.fontSize"
           [style.line-height.%]="elementModel.styles.lineHeight"
           [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''">
        {{elementModel.label}}
      </div>
      <div #valueContainer
           [class.values]="elementModel.label && !elementModel.showValues">
        <div fxFlex fxLayout="row" fxLayoutAlign="space-between">
          <div #valueMin
               class="value-container-min">
            <div *ngIf="elementModel.showValues"
                 class="value-container">
              <div
                  [style.color]="elementModel.styles.fontColor"
                  [style.font-family]="elementModel.styles.font"
                  [style.font-size.px]="elementModel.styles.fontSize"
                  [style.line-height.%]="elementModel.styles.lineHeight"
                  [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
                  [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
                  [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''">
                {{elementModel.minValue | number:'':'de'}}
              </div>
              <div *ngIf="elementModel.barStyle" class="number-marker"></div>
            </div>
          </div>
          <div #valueMax
               [class.value-container-max]="elementModel.barStyle">
            <div *ngIf="elementModel.showValues"
                 class="value-container">
              <div
                  [style.color]="elementModel.styles.fontColor"
                  [style.font-family]="elementModel.styles.font"
                  [style.font-size.px]="elementModel.styles.fontSize"
                  [style.line-height.%]="elementModel.styles.lineHeight"
                  [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
                  [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
                  [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''">
                {{elementModel.maxValue | number:'':'de'}}
              </div>
              <div *ngIf="elementModel.barStyle"
                   class="number-marker">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="elementModel.barStyle"
           fxFlex fxLayout="row" fxLayoutAlign="space-between center"
           [style.margin-top.px]="elementModel.showValues ? -18 : 0"
           [style.margin-left.px]="valueMin.offsetWidth/2">
        <div class="arrow-line"></div>
        <div class="arrow-head"></div>
      </div>
      <div *ngIf="valueMax && valueMin"
           [style.display]="'flex'"
           [style.flex-direction]="'column'"
           [style.height.%]="100"
           [style.margin-right.px]="elementModel.barStyle ? valueMax.offsetWidth/2 - 8 : valueMax.offsetWidth"
           [style.margin-left.px]="elementModel.barStyle ? valueMin.offsetWidth/2 - 8: valueMin.offsetWidth"
           [style.margin-top.px]="elementModel.barStyle ? -32 : -valueContainer.offsetHeight">
        <mat-slider
            [class]="elementModel.barStyle ? 'bar-style' : ''"
            [thumbLabel]="elementModel.thumbLabel"
            [formControl]="elementFormControl"
            [style.width.%]="100"
            [max]="elementModel.maxValue"
            [min]="elementModel.minValue">
        </mat-slider>
        <mat-error *ngIf="elementFormControl.touched && elementFormControl.errors">
          {{elementModel.requiredWarnMessage}}
        </mat-error>
      </div>
    </div>
  `,
  styles: [
    '.values {margin-top: 10px;}',
    '.value-container {text-align: center;}',
    '.value-container-max {min-width: 100px}',
    '.value-container-min {min-width: 8px}',
    '.arrow-line {height: 2px; width: 100%; background-color: #555;}',
    '.number-marker {width: 2px; height: 20px; background-color: #555; margin: 10px auto 0 auto}',
    // eslint-disable-next-line max-len
    '.arrow-head {width: 0; height: 0; border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-left: 20px solid #555;}',
    // Background color must use !important to be displayed also in the editor
    // eslint-disable-next-line max-len
    ':host ::ng-deep .bar-style .mat-slider-thumb {border-radius: 0; border: none; width: 9px; height: 40px; bottom: -20px; margin-right: 5px; background-color: #006064 !important}',
    ':host ::ng-deep .bar-style .mat-slider-track-fill {background-color: rgba(0,0,0,0);}',
    ':host ::ng-deep .bar-style .mat-slider-track-background {background-color: rgba(0,0,0,0);}'
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
      this.inputElement.disabled = this.elementModel.readOnly as boolean;
    }
  }
}
