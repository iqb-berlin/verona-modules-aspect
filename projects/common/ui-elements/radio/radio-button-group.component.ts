import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { RadioButtonGroupElement } from './radio-button-group-element';

@Component({
  selector: 'app-radio-button-group',
  template: `
    <div class="mat-form-field"
         [style.width.%]="100"
         [style.height.%]="100"
         [style.background-color]="elementModel.surfaceProps.backgroundColor"
         [style.color]="elementModel.fontProps.fontColor"
         [style.font-family]="elementModel.fontProps.font"
         [style.font-size.px]="elementModel.fontProps.fontSize"
         [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
         [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
      <label id="radio-group-label"
             [innerHTML]="elementModel.label">
      </label>
      <mat-radio-group aria-labelledby="radio-group-label"
                       [fxLayout]="elementModel.alignment"
                       [formControl]="elementFormControl"
                       [value]="elementModel.value"
                       [style.margin-top.px]="10">
        <mat-radio-button *ngFor="let option of elementModel.options; let i = index"
                          [ngClass]="{ 'strike' : elementModel.strikeOtherOptions &&
                                                  elementFormControl.value !== null &&
                                                  elementFormControl.value !== i }"
                          [value]="i"
                          [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'"
                          [style.line-height.%]="elementModel.fontProps.lineHeight">
          {{option}}
        </mat-radio-button>
        <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                   class="error-message">
          {{elementFormControl.errors | errorTransform: elementModel}}
        </mat-error>
      </mat-radio-group>
    </div>
  `,
  styles: [
    '::ng-deep app-radio-button-group .mat-radio-label {white-space: normal}',
    '::ng-deep app-radio-button-group .mat-radio-label .mat-radio-label-content {padding-left: 10px}',
    'mat-radio-button {margin-bottom: 6px; margin-right: 15px}',
    '.error-message { font-size: 75% }',
    '::ng-deep app-radio-button-group .strike .mat-radio-label {text-decoration: line-through}',
    '::ng-deep app-radio-button-group .mat-radio-label {align-items: baseline}',
    '::ng-deep app-radio-button-group mat-radio-button .mat-radio-label .mat-radio-container {top: 4px;}',
    ':host ::ng-deep mat-radio-button.mat-radio-checked .mat-radio-label .mat-radio-outer-circle' +
      '{border-color: #006064 !important}',
    ':host ::ng-deep mat-radio-button.mat-radio-checked .mat-radio-label .mat-radio-inner-circle' +
      '{background-color: #006064 !important}',
    ':host ::ng-deep mat-radio-button.mat-radio-checked .mat-radio-label .mat-ripple-element' +
      '{background-color: #006064 !important}'
  ]
})
export class RadioButtonGroupComponent extends FormElementComponent {
  @Input() elementModel!: RadioButtonGroupElement;
}
