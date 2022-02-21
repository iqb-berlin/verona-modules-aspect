import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { DropdownElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-dropdown',
  template: `
    <mat-form-field
        appearance="fill"
        [style.width.%]="100"
        [style.height.%]="100"
        aspectInputBackgroundColor [backgroundColor]="elementModel.styles.backgroundColor">
      <mat-label [style.color]="elementModel.styles.fontColor"
                 [style.font-family]="elementModel.styles.font"
                 [style.font-size.px]="elementModel.styles.fontSize"
                 [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
                 [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
                 [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''">
        {{$any(elementModel).label}}
      </mat-label>
      <mat-select [formControl]="elementFormControl" [value]="elementModel.value">
        <mat-option *ngIf="elementModel.allowUnset" value=""
                    [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'"
                    (click)="$event.preventDefault()">
        </mat-option>
        <mat-option *ngFor="let option of elementModel.options; let i = index" [value]="i + 1"
                    [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'">
          {{option}}
        </mat-option>
      </mat-select>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
  `
})
export class DropdownComponent extends FormElementComponent {
  @Input() elementModel!: DropdownElement;
}
