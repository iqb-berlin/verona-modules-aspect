import { Component, Input } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { CheckboxElement } from './checkbox-element';

@Component({
  selector: 'app-checkbox',
  template: `
    <div class="mat-form-field"
         [style.width.%]="100"
         [style.height.%]="100"
         [style.background-color]="elementModel.surfaceProps.backgroundColor">
      <mat-checkbox #checkbox class="example-margin"
                    [formControl]="elementFormControl"
                    [checked]="$any(elementModel.value)"
                    [style.color]="elementModel.fontProps.fontColor"
                    [style.font-family]="elementModel.fontProps.font"
                    [style.font-size.px]="elementModel.fontProps.fontSize"
                    [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
                    (click)="elementModel.readOnly ? $event.preventDefault() : null">
        <div [style.line-height.%]="elementModel.lineHeight" [innerHTML]="elementModel.label"></div>
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

  get validators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.elementModel.required) {
      validators.push(Validators.requiredTrue);
    }
    return validators;
  }
}
