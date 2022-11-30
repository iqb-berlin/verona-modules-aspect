// eslint-disable-next-line max-classes-per-file
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { MathFieldElement } from 'common/models/elements/input-elements/math-field';

@Component({
  selector: 'aspect-math-field',
  template: `
    <aspect-mathlive-math-field [value]="$any(elementModel.value) | getValue: elementFormControl.value : parentForm"
                                [enableModeSwitch]="elementModel.enableModeSwitch"
                                (input)="elementFormControl.setValue($any($event.target).value)"
                                (focusout)="elementFormControl.markAsTouched()">
    </aspect-mathlive-math-field>
    <mat-error *ngIf="elementFormControl.errors">
      {{elementFormControl.errors | errorTransform: elementModel}}
    </mat-error>
  `
})
export class MathFieldComponent extends FormElementComponent {
  @Input() elementModel!: MathFieldElement;
}

@Pipe({
  name: 'getValue'
})
export class GetValuePipe implements PipeTransform {
  transform(elementModelValue: string, elementFormControlValue: string, parentForm: FormGroup): string {
    return parentForm ? elementFormControlValue : elementModelValue;
  }
}
