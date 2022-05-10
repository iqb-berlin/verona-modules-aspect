import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { RadioButtonGroupElement } from 'common/ui-elements/radio/radio-button-group';

@Component({
  selector: 'aspect-radio-button-group',
  template: `
    <div class="mat-form-field"
         [style.width.%]="100"
         [style.height.%]="100"
         [style.background-color]="elementModel.styling.backgroundColor"
         [style.color]="elementModel.styling.fontColor"
         [style.font-family]="elementModel.styling.font"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
      <label id="radio-group-label"
             [innerHTML]="elementModel.label">
      </label>
      <mat-radio-group aria-labelledby="radio-group-label"
                       [fxLayout]="elementModel.alignment"
                       [formControl]="elementFormControl"
                       [value]="elementModel.value"
                       [style.margin-top.px]="elementModel.label !== '' ? 10 : 0">
        <mat-radio-button *ngFor="let option of elementModel.richTextOptions; let i = index"
                          [ngClass]="{ 'strike' : elementModel.strikeOtherOptions &&
                                                  elementFormControl.value !== null &&
                                                  elementFormControl.value !== i }"
                          [value]="i"
                          [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'"
                          [style.line-height.%]="elementModel.styling.lineHeight">
          <div class="radio-button-label" [innerHTML]="sanitizer.bypassSecurityTrustHtml(option)"></div>
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
    ':host ::ng-deep mat-radio-button .mat-radio-label .mat-radio-container {top: 4px;}',
    '.radio-button-label {pointer-events: none;}'
  ]
})
export class RadioButtonGroupComponent extends FormElementComponent {
  @Input() elementModel!: RadioButtonGroupElement;
}
