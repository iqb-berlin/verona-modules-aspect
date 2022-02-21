import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { RadioButtonGroupElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-radio-button-group',
  template: `
    <div class="mat-form-field"
         [style.width.%]="100"
         [style.height.%]="100"
         [style.background-color]="elementModel.styles.backgroundColor"
         [style.color]="elementModel.styles.fontColor"
         [style.font-family]="elementModel.styles.font"
         [style.font-size.px]="elementModel.styles.fontSize"
         [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''">
      <label id="radio-group-label"
             [innerHTML]="elementModel.label">
      </label>
      <mat-radio-group aria-labelledby="radio-group-label"
                       [fxLayout]="elementModel.alignment"
                       [formControl]="elementFormControl"
                       [value]="elementModel.value"
                       [style.margin-top.px]="elementModel.label !== '' ? 10 : 0">
        <mat-radio-button *ngFor="let option of elementModel.options; let i = index"
                          [ngClass]="{ 'strike' : elementModel.strikeOtherOptions &&
                                                  elementFormControl.value !== null &&
                                                  elementFormControl.value !== i + 1 }"
                          [value]="i + 1"
                          [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'"
                          [style.line-height.%]="elementModel.styles.lineHeight">
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
    ':host ::ng-deep .mat-radio-label {white-space: normal}',
    ':host ::ng-deep .mat-radio-label .mat-radio-label-content {padding-left: 10px}',
    'mat-radio-button {margin-bottom: 6px; margin-right: 15px}',
    '.error-message { font-size: 75% }',
    ':host ::ng-deep .strike .mat-radio-label {text-decoration: line-through}',
    ':host ::ng-deep .mat-radio-label {align-items: baseline}',
    ':host ::ng-deep mat-radio-button .mat-radio-label .mat-radio-container {top: 4px;}'
  ]
})
export class RadioButtonGroupComponent extends FormElementComponent {
  @Input() elementModel!: RadioButtonGroupElement;
}
