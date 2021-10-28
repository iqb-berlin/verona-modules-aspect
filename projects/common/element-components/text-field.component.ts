import { Component, EventEmitter, Output } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { FormElementComponent } from '../form-element-component.directive';
import { TextFieldElement } from '../models/text-field-element';

@Component({
  selector: 'app-text-field',
  template: `
    <mat-form-field *ngIf="elementModel.label !== ''"
                    [style.width.%]="100"
                    [style.height.%]="100"
                    [style.color]="elementModel.fontColor"
                    [style.font-family]="elementModel.font"
                    [style.font-size.px]="elementModel.fontSize"
                    [style.font-weight]="elementModel.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.underline ? 'underline' : ''"
                    appInputBackgroundColor [backgroundColor]="elementModel.backgroundColor"
                    [appearance]="$any(elementModel.appearance)">
      <mat-label>{{elementModel.label}}</mat-label>
      <input matInput type="text" [pattern]="elementModel.pattern" #input
             (focus)="onFocus.emit(input)"
             (blur)="onBlur.emit(input)"
             autocomplete="off"
             [formControl]="elementFormControl">
      <button *ngIf="elementModel.clearable" matSuffix mat-icon-button aria-label="Clear"
              (click)="onClick($event)">
        <mat-icon>close</mat-icon>
      </button>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
    <mat-form-field *ngIf="elementModel.label === ''" class="small-input"
                    [style.width.%]="100"
                    [style.height.%]="100"
                    [style.color]="elementModel.fontColor"
                    [style.font-family]="elementModel.font"
                    [style.font-size.px]="elementModel.fontSize"
                    [style.font-weight]="elementModel.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.underline ? 'underline' : ''"
                    appInputBackgroundColor [backgroundColor]="elementModel.backgroundColor"
                    [appearance]="$any(elementModel.appearance)">
      <input matInput type="text" #input
             [pattern]="elementModel.pattern"
             (focus)="onFocus.emit(input)"
             (blur)="onBlur.emit(input)"
             autocomplete="off"
             [formControl]="elementFormControl">
      <button *ngIf="elementModel.clearable" matSuffix mat-icon-button aria-label="Clear"
              (click)="onClick($event)">
        <mat-icon>close</mat-icon>
      </button>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
  `,
  styles: [
    '::ng-deep app-text-field .small-input div.mat-form-field-infix {border-top: none; padding: 0.75em 0 0.25em 0;}'
  ]
})
export class TextFieldComponent extends FormElementComponent {
  @Output() onFocus = new EventEmitter<HTMLElement>();
  @Output() onBlur = new EventEmitter<HTMLElement>();
  elementModel!: TextFieldElement;

  onClick(event: MouseEvent) : void {
    this.elementFormControl.setValue('');
    event.preventDefault();
    event.stopPropagation();
  }

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
