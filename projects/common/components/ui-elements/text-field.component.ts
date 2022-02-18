import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { TextFieldElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-text-field',
  template: `
    <mat-form-field *ngIf="elementModel.label !== ''"
                    [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                    elementModel.positionProps.fixedSize"
                    [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
                    [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : '100%'"
                    [style.color]="elementModel.styles.fontColor"
                    [style.font-family]="elementModel.styles.font"
                    [style.font-size.px]="elementModel.styles.fontSize"
                    [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''"
                    aspectInputBackgroundColor [backgroundColor]="elementModel.styles.backgroundColor"
                    [appearance]="elementModel.appearance">
      <mat-label>{{elementModel.label}}</mat-label>
      <input matInput type="text" #input autocomplete="off"
             [formControl]="elementFormControl"
             [value]="elementModel.value"
             [pattern]="elementModel.pattern"
             [readonly]="elementModel.readOnly"
             (focus)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(input) : null"
             (blur)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(null): null">
      <button *ngIf="elementModel.clearable"
              type="button"
              matSuffix mat-icon-button aria-label="Clear"
              (click)="this.elementFormControl.setValue('')">
        <mat-icon>close</mat-icon>
      </button>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
    <mat-form-field *ngIf="elementModel.label === ''" class="small-input"
                    [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                    elementModel.positionProps.fixedSize"
                    [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
                    [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : '100%'"
                    [style.color]="elementModel.styles.fontColor"
                    [style.font-family]="elementModel.styles.font"
                    [style.font-size.px]="elementModel.styles.fontSize"
                    [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''"
                    aspectInputBackgroundColor [backgroundColor]="elementModel.styles.backgroundColor"
                    [appearance]="$any(elementModel.appearance)">
      <input matInput type="text" #input autocomplete="off"
             [formControl]="elementFormControl"
             [value]="$any(elementModel.value)"
             [readonly]="elementModel.readOnly"
             [pattern]="elementModel.pattern"
             (focus)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(input) : null"
             (blur)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(null): null">
      <button *ngIf="elementModel.clearable"
              type="button"
              matSuffix mat-icon-button aria-label="Clear"
              (click)="this.elementFormControl.setValue('')">
        <mat-icon>close</mat-icon>
      </button>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
  `,
  styles: [
    '.center-content {display: block; margin: auto; top: 50%; transform: translateY(-50%);}',
    '::ng-deep app-text-field .small-input div.mat-form-field-infix {border-top: none; padding: 0.55em 0 0.25em 0;}' // TODO
  ]
})
export class TextFieldComponent extends FormElementComponent {
  @Input() elementModel!: TextFieldElement;
  @Output() onFocusChanged = new EventEmitter<HTMLElement | null>();

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
