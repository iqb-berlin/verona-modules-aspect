import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { TextFieldElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-text-field',
  template: `
    <mat-form-field
            *ngIf="elementModel.label !== ''"
            [style.width.%]="100"
            [style.height.%]="100"
            [style.color]="elementModel.styling.fontColor"
            [style.font-family]="elementModel.styling.font"
            [style.font-size.px]="elementModel.styling.fontSize"
            [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
            [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
            [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
            aspectInputBackgroundColor [backgroundColor]="elementModel.styling.backgroundColor"
            [appearance]="$any(elementModel.appearance)">
      <mat-label>{{elementModel.label}}</mat-label>
      <input matInput type="text" #input
             autocomplete="off"
             autocapitalize="none"
             autocorrect="off"
             spellcheck="false"
             value="{{elementModel.value}}"
             [formControl]="elementFormControl"
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
                    [style.width.%]="100"
                    [style.height.%]="100"
                    [style.color]="elementModel.styling.fontColor"
                    [style.font-family]="elementModel.styling.font"
                    [style.font-size.px]="elementModel.styling.fontSize"
                    [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                    aspectInputBackgroundColor [backgroundColor]="elementModel.styling.backgroundColor"
                    [appearance]="$any(elementModel.appearance)">
      <input matInput type="text" #input
             autocomplete="off"
             autocapitalize="none"
             autocorrect="off"
             spellcheck="false"
             value="{{elementModel.value}}"
             [formControl]="elementFormControl"
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
    ':host ::ng-deep .small-input div.mat-form-field-infix {border-top: none; padding: 0.55em 0 0.25em 0;}'
  ]
})
export class TextFieldComponent extends FormElementComponent {
  @Input() elementModel!: TextFieldElement;
  @Output() onFocusChanged = new EventEmitter<HTMLElement | null>();
}
