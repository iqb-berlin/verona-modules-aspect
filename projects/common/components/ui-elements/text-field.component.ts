import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { TextFieldElement } from 'common/classes/element';

@Component({
  selector: 'aspect-text-field',
  template: `
    <mat-form-field [class.small-input]="elementModel.label === ''"
                    [style.width.%]="100"
                    [style.height.%]="100"
                    [style.line-height.%]="elementModel.styling.lineHeight"
                    [style.color]="elementModel.styling.fontColor"
                    [style.font-family]="elementModel.styling.font"
                    [style.font-size.px]="elementModel.styling.fontSize"
                    [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                    aspectInputBackgroundColor [backgroundColor]="elementModel.styling.backgroundColor"
                    [appearance]="$any(elementModel.appearance)">
      <mat-label>{{elementModel.label}}</mat-label>
      <input matInput #input
             autocomplete="off"
             autocapitalize="none"
             autocorrect="off"
             spellcheck="false"
             value="{{elementModel.value}}"
             [attr.inputmode]="elementModel.showSoftwareKeyboard ? 'none' : 'text'"
             [formControl]="elementFormControl"
             [pattern]="$any(elementModel.pattern)"
             [readonly]="elementModel.readOnly"
             (keydown)="elementModel.showSoftwareKeyboard ? onKeyDown.emit(input) : null"
             (focus)="onFocusChanged.emit(input)"
             (blur)="onFocusChanged.emit(null)">
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
    ':host ::ng-deep .small-input div.mat-form-field-infix {border-top: none; padding: 0.55em 0 0.25em 0;}',
    ':host ::ng-deep .small-input .mat-form-field-outline-gap {display: none; }'
  ]
})
export class TextFieldComponent extends FormElementComponent {
  @Input() elementModel!: TextFieldElement;
  @Output() onKeyDown = new EventEmitter<HTMLElement>();
  @Output() onFocusChanged = new EventEmitter<HTMLElement | null>();
}
