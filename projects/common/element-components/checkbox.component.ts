import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { FormElementComponent } from '../form-element-component.directive';
import { CheckboxElement } from '../models/checkbox-element';

@Component({
  selector: 'app-checkbox',
  template: `
    <div class="mat-form-field"
         [style.width.%]="100"
         [style.height.%]="100"
         [style.background-color]="elementModel.backgroundColor">
      <mat-checkbox #checkbox class="example-margin"
                    [formControl]="elementFormControl"
                    [style.color]="elementModel.fontColor"
                    [style.font-family]="elementModel.font"
                    [style.font-size.px]="elementModel.fontSize"
                    [style.font-weight]="elementModel.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.underline ? 'underline' : ''">
        <div [innerHTML]="elementModel.label"></div>
      </mat-checkbox>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 [style.margin-top.px]="5"
                 [style.position]="'absolute'"
                 [style.display]="'block'"
                 [style.font-size.%]="75">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </div>
  `,
  styles: ['::ng-deep .mat-checkbox-layout {white-space: normal !important}']
})
export class CheckboxComponent extends FormElementComponent {
  elementModel!: CheckboxElement;

  get validators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.elementModel.required) {
      validators.push(Validators.requiredTrue);
    }
    return validators;
  }
}
