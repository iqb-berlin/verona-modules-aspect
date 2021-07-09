import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-dropdown',
  template: `
      <mat-form-field appearance="fill" [ngStyle]="style">
          <mat-label>{{$any(elementModel).label}}</mat-label>
          <mat-select (ngModelChange)="onModelChange($event)"
                      [formControl]="formControl">
              <mat-option *ngFor="let option of $any(elementModel).options" [value]="option">
                  {{option}}
              </mat-option>
          </mat-select>
      </mat-form-field>
  `
})
export class DropdownComponent extends CanvasElementComponent { }
