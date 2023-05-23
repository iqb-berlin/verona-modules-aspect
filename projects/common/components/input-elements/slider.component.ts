import { Component, Input } from '@angular/core';
import { SliderElement } from 'common/models/elements/input-elements/slider';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-slider',
  template: `
    <div [style.width.%]="100"
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
      <div class="container">
        <div *ngIf="elementModel.showValues"
             class="min-value"
             [style.color]="elementModel.styling.fontColor"
             [style.font-family]="elementModel.styling.font"
             [style.font-size.px]="elementModel.styling.fontSize"
             [style.line-height.%]="elementModel.styling.lineHeight"
             [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
             [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
             [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
          {{elementModel.minValue | number:'':'de'}}
        </div>
        <div *ngIf="elementModel.showValues"
             class="max-value"
             [style.color]="elementModel.styling.fontColor"
             [style.font-family]="elementModel.styling.font"
             [style.font-size.px]="elementModel.styling.fontSize"
             [style.line-height.%]="elementModel.styling.lineHeight"
             [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
             [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
             [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
          {{elementModel.maxValue | number:'':'de'}}
        </div>
        <div *ngIf="elementModel.barStyle" class="arrow-line"></div>
        <div *ngIf="elementModel.barStyle" class="arrow-head"></div>
        <div *ngIf="elementModel.barStyle" class="value-marker min-value-marker"></div>
        <div *ngIf="elementModel.barStyle" class="value-marker max-value-marker"></div>
        <mat-slider [class]="elementModel.barStyle ? 'slider-bar-style' : 'slider'"
                    [isDisabled]="elementModel.readOnly"
                    [thumbLabel]="elementModel.thumbLabel"
                    [formControl]="elementFormControl"
                    [style.width.%]="100"
                    [max]="elementModel.maxValue"
                    [min]="elementModel.minValue"><input matSliderThumb />
        </mat-slider>
      </div>
      <mat-error *ngIf="elementFormControl.touched && elementFormControl.errors">
        {{elementModel.requiredWarnMessage}}
      </mat-error>
    </div>
  `,
  styles: [
    `
    /* TODO(mdc-migration): The following rule targets internal classes of slider that may no longer apply for the MDC version. */
    :host ::ng-deep .slider-bar-style .mat-slider-thumb {border-radius: 0; border: none; width: 9px; height: 40px;}`,
    `
    /* TODO(mdc-migration): The following rule targets internal classes of slider that may no longer apply for the MDC version. */
    :host ::ng-deep .slider-bar-style .mat-slider-thumb {bottom: -20px; margin-right: 5px; background-color: #006064}`,
    `
    /* TODO(mdc-migration): The following rule targets internal classes of slider that may no longer apply for the MDC version. */
    :host ::ng-deep .slider-bar-style .mat-slider-track-fill {background-color: rgba(0,0,0,0);}`,
    `
    /* TODO(mdc-migration): The following rule targets internal classes of slider that may no longer apply for the MDC version. */
    :host ::ng-deep .slider-bar-style .mat-slider-track-background {background-color: rgba(0,0,0,0);}`,

    '.container {display: grid; grid-template-rows: auto auto;}',
    '.container {grid-template-columns: repeat(3, minmax(0, auto)) minmax(100px, 8fr) repeat(4, minmax(0, auto));}',
    '.min-value {text-align: center; grid-column: 1/4; grid-row: 1/2;}',
    '.max-value {text-align: center; grid-column: 5/8;grid-row: 1/2;}',
    '.slider-bar-style {grid-column: 2/7; grid-row: 2/3; margin: 0 -7px 0 -7px;}',
    '.slider {grid-column: 4/5; grid-row: 1/2;}',
    '.value-marker {width: 2px; height: 20px; background-color: #555; margin-top: 14px}',
    '.min-value-marker {grid-column: 2/3;grid-row: 2/3;}',
    '.max-value-marker {grid-column: 6/7;grid-row: 2/3;}',
    '.arrow-line {height: 2px; width: 100%; background-color: #555; grid-column: 2/8; grid-row: 2/3; margin-top: 23px}',
    '.arrow-head {width: 0; height: 0; margin-top: 15px; grid-column: 8/9;grid-row: 2/3;}',
    '.arrow-head {border-top: 8px solid transparent; border-bottom: 8px solid transparent;}',
    '.arrow-head {border-left: 20px solid #555;}'
  ]
})
export class SliderComponent extends FormElementComponent {
  @Input() elementModel!: SliderElement;
}
