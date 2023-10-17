import { Component, Input } from '@angular/core';
import { DropdownElement } from 'common/models/elements/input-elements/dropdown';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-dropdown',
  template: `
    <mat-form-field appearance="fill"
                    [style.background-color]="elementModel.styling.backgroundColor">
      <mat-label [style.color]="elementModel.styling.fontColor"
                 [style.font-size.px]="elementModel.styling.fontSize"
                 [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                 [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                 [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
        {{ elementModel.label }}
      </mat-label>
      <mat-select [formControl]="elementFormControl" [value]="elementModel.value">
        <mat-option *ngIf="elementModel.allowUnset" [value]="null"
                    [class.read-only]="elementModel.readOnly"
                    (click)="$event.preventDefault()">
        </mat-option>
        <mat-option *ngFor="let option of elementModel.options; let i = index" [value]="i"
                    [class.read-only]="elementModel.readOnly">
          {{option.text}}
        </mat-option>
      </mat-select>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
  `,
  styles: [
    'mat-form-field {width: 100%; height: 100%;}',
    'read-only {pointer-events: none;}',
    ':host ::ng-deep mat-form-field .mat-mdc-text-field-wrapper.mdc-text-field {background-color: inherit !important;}',
    ':host ::ng-deep mat-form-field .mat-mdc-form-field-subscript-wrapper {background-color: white;}'
  ]
})
export class DropdownComponent extends FormElementComponent {
  @Input() elementModel!: DropdownElement;
}
