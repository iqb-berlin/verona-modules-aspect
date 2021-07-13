import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-dropdown',
  template: `
      <mat-form-field appearance="fill"
                      [style.width.px]="elementModel.width"
                      [style.height.px]="elementModel.height"
                      [style.background-color]="elementModel.backgroundColor">
          <mat-label [style.color]="elementModel.fontColor"
                     [style.font-family]="elementModel.font"
                     [style.font-size.px]="elementModel.fontSize"
                     [style.font-weight]="elementModel.bold ? 'bold' : ''"
                     [style.font-style]="elementModel.italic ? 'italic' : ''"
                     [style.text-decoration]="elementModel.underline ? 'underline' : ''">
            {{$any(elementModel).label}}
          </mat-label>
          <mat-select [formControl]="formControl">
              <mat-option *ngFor="let option of $any(elementModel).options" [value]="option">
                  {{option}}
              </mat-option>
          </mat-select>
      </mat-form-field>
  `
})
export class DropdownComponent extends CanvasElementComponent { }
