import { Component, Input } from '@angular/core';
import { SliderElement } from 'common/models/elements/input-elements/slider';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-slider',
  template: `
    <div fxLayout="column"
         [style.width.%]="100"
         [style.height.%]="100"
         [style.background-color]="elementModel.styling.backgroundColor">
      <div *ngIf="elementModel.label"
           [style.color]="elementModel.styling.fontColor"
           [style.font-family]="elementModel.styling.font"
           [style.font-size.px]="elementModel.styling.fontSize"
           [style.line-height.%]="elementModel.styling.lineHeight"
           [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
          {{elementModel.label}}
      </div>
      <div #valueContainer
           [class.values]="elementModel.label && !elementModel.showValues">
        <div fxFlex fxLayout="row" fxLayoutAlign="space-between">
          <div #valueMin
               class="value-container-min">
            <div *ngIf="elementModel.showValues"
                 class="value-container">
                <div [style.color]="elementModel.styling.fontColor"
                     [style.font-family]="elementModel.styling.font"
                     [style.font-size.px]="elementModel.styling.fontSize"
                     [style.line-height.%]="elementModel.styling.lineHeight"
                     [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                     [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                     [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
                  {{elementModel.minValue | number:'':'de'}}
                </div>
                <div *ngIf="elementModel.barStyle" class="number-marker"></div>
            </div>
          </div>
          <div #valueMax
               [class.value-container-max]="elementModel.barStyle">
            <div *ngIf="elementModel.showValues"
                 class="value-container">
                <div [style.color]="elementModel.styling.fontColor"
                     [style.font-family]="elementModel.styling.font"
                     [style.font-size.px]="elementModel.styling.fontSize"
                     [style.line-height.%]="elementModel.styling.lineHeight"
                     [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                     [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                     [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
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
        <mat-slider [class]="elementModel.barStyle ? 'bar-style' : ''"
                    [isDisabled]="elementModel.readOnly"
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
    '.arrow-head {width: 0; height: 0; border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-left: 20px solid #555;}',
    // Background color must use !important to be displayed also in the editor
    ':host ::ng-deep .bar-style .mat-slider-thumb {border-radius: 0; border: none; width: 9px; height: 40px; bottom: -20px; margin-right: 5px; background-color: #006064 !important}',
    ':host ::ng-deep .bar-style .mat-slider-track-fill {background-color: rgba(0,0,0,0);}',
    ':host ::ng-deep .bar-style .mat-slider-track-background {background-color: rgba(0,0,0,0);}'
  ]
})
export class SliderComponent extends FormElementComponent {
  @Input() elementModel!: SliderElement;
}
