import { Component } from '@angular/core';
import { FormElementComponent } from '../form-element-component.directive';
import { DropdownElement } from '../models/dropdown-element';

@Component({
  selector: 'app-dropdown',
  template: `
    <mat-form-field appearance="fill"
                    [style.width.%]="100"
                    [style.height.%]="100"
                    appInputBackgroundColor [backgroundColor]="elementModel.backgroundColor">
      <mat-label [style.color]="elementModel.fontColor"
                 [style.font-family]="elementModel.font"
                 [style.font-size.px]="elementModel.fontSize"
                 [style.font-weight]="elementModel.bold ? 'bold' : ''"
                 [style.font-style]="elementModel.italic ? 'italic' : ''"
                 [style.text-decoration]="elementModel.underline ? 'underline' : ''">
        {{$any(elementModel).label}}
      </mat-label>
      <mat-select [formControl]="elementFormControl">
        <mat-option *ngIf="elementModel.allowUnset" value=""></mat-option>
        <mat-option *ngFor="let option of elementModel.options; let i = index" [value]="i">
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
  elementModel!: DropdownElement;
}
