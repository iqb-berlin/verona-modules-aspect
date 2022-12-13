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
  <div [style.line-height.%]="elementModel.styling.lineHeight"
       [style.color]="elementModel.styling.fontColor"
       [style.font-family]="elementModel.styling.font"
       [style.font-size.px]="elementModel.styling.fontSize"
       [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
       [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
       [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
       [style.backgroundColor]="elementModel.styling.backgroundColor">
      <label>{{elementModel.label}}</label><br>
      <aspect-mathlive-math-field [value]="$any(elementModel.value) | getValue: elementFormControl.value : parentForm"
                                  [readonly]="elementModel.readOnly"
                                  [enableModeSwitch]="elementModel.enableModeSwitch"
                                  (input)="elementFormControl.setValue($any($event.target).value)"
                                  (focusout)="elementFormControl.markAsTouched()">
      </aspect-mathlive-math-field>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 class="error-message">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
  </div>
  `,
  styles: ['.error-message {font-size: 75%; margin-top: 15px; margin-left: 10px;}']
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
