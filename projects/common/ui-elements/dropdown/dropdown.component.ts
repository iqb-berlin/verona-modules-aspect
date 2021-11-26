import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { DropdownElement } from './dropdown-element';

@Component({
  selector: 'app-dropdown',
  template: `
    <mat-form-field appearance="fill"
                    [style.width.%]="100"
                    [style.height.%]="100"
                    appInputBackgroundColor [backgroundColor]="elementModel.surfaceProps.backgroundColor">
      <mat-label [style.color]="elementModel.fontProps.fontColor"
                 [style.font-family]="elementModel.fontProps.font"
                 [style.font-size.px]="elementModel.fontProps.fontSize"
                 [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
                 [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
                 [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        {{$any(elementModel).label}}
      </mat-label>
      <mat-select [formControl]="elementFormControl" [value]="elementModel.value">
        <mat-option *ngIf="elementModel.allowUnset" value=""
                    [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'"
                    (click)="$event.preventDefault()">
        </mat-option>
        <mat-option *ngFor="let option of elementModel.options; let i = index" [value]="i"
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
