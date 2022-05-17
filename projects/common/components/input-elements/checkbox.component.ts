import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { CheckboxElement } from 'common/models/elements/input-elements/checkbox';

@Component({
  selector: 'aspect-checkbox',
  template: `
    <div class="mat-form-field"
         [style.width.%]="100"
         [style.height.%]="100"
         [style.background-color]="elementModel.styling.backgroundColor">
      <mat-checkbox #checkbox class="example-margin"
                    [formControl]="elementFormControl"
                    [checked]="$any(elementModel.value)"
                    [style.color]="elementModel.styling.fontColor"
                    [style.font-family]="elementModel.styling.font"
                    [style.font-size.px]="elementModel.styling.fontSize"
                    [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                    (click)="elementModel.readOnly ? $event.preventDefault() : null">
        <div [innerHTML]="elementModel.label"></div>
      </mat-checkbox>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 class="error-message">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </div>
  `,
  styles: [
    ':host ::ng-deep .mat-checkbox-layout {white-space: normal !important}',
    '.error-message { position: absolute; display: block; margin-top: 5px; font-size: 75% }'
  ]
})
export class CheckboxComponent extends FormElementComponent {
  @Input() elementModel!: CheckboxElement;
}
