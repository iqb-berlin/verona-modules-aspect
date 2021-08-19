import { Component } from '@angular/core';
import { DropdownElement } from '../unit';
import { FormElementComponent } from '../form-element-component.directive';

@Component({
  selector: 'app-dropdown',
  template: `
      <mat-form-field appearance="fill"
                      [style.width.%]="100"
                      [style.height.%]="100"
                      [style.background-color]="elementModel.backgroundColor">
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
              <mat-option *ngFor="let option of elementModel.options" [value]="option">
                  {{option}}
              </mat-option>
          </mat-select>
      </mat-form-field>
  `
})
export class DropdownComponent extends FormElementComponent {
  elementModel!: DropdownElement;
}
