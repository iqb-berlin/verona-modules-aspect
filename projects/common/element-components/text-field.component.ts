import { Component, EventEmitter, Output } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { TextFieldElement } from '../unit';
import { FormElementComponent } from '../form-element-component.directive';

@Component({
  selector: 'app-text-field',
  template: `
    <mat-form-field [style.width.%]="100"
                    [style.height.%]="100"
                    [style.color]="elementModel.fontColor"
                    [style.font-family]="elementModel.font"
                    [style.font-size.px]="elementModel.fontSize"
                    [style.font-weight]="elementModel.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.underline ? 'underline' : ''"
                    appInputBackgroundColor [backgroundColor]="elementModel.backgroundColor"
                    [appearance]="$any(elementModel.appearance)">
      <input matInput type="text" [pattern]="elementModel.pattern" #input
             (focusin)="onFocusin.emit()"
             (focus)="onFocus.emit(input)"
             (blur)="onBlur.emit(input)"
             autocomplete="off"
             [formControl]="elementFormControl"
             placeholder="{{elementModel.label}}">
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
  `
})
export class TextFieldComponent extends FormElementComponent {
  @Output() onFocusin = new EventEmitter();
  @Output() onFocus = new EventEmitter<HTMLElement>();
  @Output() onBlur = new EventEmitter<HTMLElement>();
  elementModel!: TextFieldElement;

  get validators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.elementModel.required) {
      validators.push(Validators.required);
    }
    if (this.elementModel.minLength) {
      validators.push(Validators.minLength(<number> this.elementModel.minLength));
    }
    if (this.elementModel.maxLength) {
      validators.push(Validators.maxLength(<number> this.elementModel.maxLength));
    }
    if (this.elementModel.pattern) {
      validators.push(Validators.pattern(<string> this.elementModel.pattern));
    }
    return validators;
  }
}
