// eslint-disable-next-line max-classes-per-file
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MathFieldElement } from 'common/models/elements/input-elements/math-field';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-math-field',
  template: `
  <div [style.line-height.%]="elementModel.styling.lineHeight"
       [style.color]="elementModel.styling.fontColor"
       [style.font-size.px]="elementModel.styling.fontSize"
       [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
       [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
       [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
       [style.background-color]="elementModel.styling.backgroundColor">
      <label>{{elementModel.label}}</label><br>
      <aspect-math-input [value]="$any(elementModel.value) | getValue: elementFormControl.value : parentForm"
                         [readonly]="elementModel.readOnly"
                         [enableModeSwitch]="elementModel.enableModeSwitch"
                         (input)="elementFormControl.setValue($any($event.target).value)"
                         (focusIn)="focusChanged.emit({ inputElement: $event, focused: true })"
                         (focusOut)="elementFormControl.markAsTouched();
                                     focusChanged.emit({ inputElement: $event, focused: true })">
      </aspect-math-input>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 class="error-message">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
  </div>
  `,
  styles: ['.error-message {font-size: 75%; margin-top: 15px; margin-left: 10px;}']
})
export class MathFieldComponent extends TextInputComponent {
  @Input() elementModel!: MathFieldElement;
}

@Pipe({
  name: 'getValue'
})
export class GetValuePipe implements PipeTransform {
  transform(elementModelValue: string, elementFormControlValue: string, parentForm: UntypedFormGroup): string {
    return parentForm ? elementFormControlValue : elementModelValue;
  }
}
