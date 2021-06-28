import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-dropdown',
  template: `
      <mat-form-field *ngIf="!draggable"
                      cdkDrag [cdkDragData]="this"
                      appearance="fill"
                      (click)="click($event)"
                      [ngStyle]="style">
          <mat-label>{{$any(elementModel).label}}</mat-label>
          <mat-select>
              <mat-option *ngFor="let option of $any(elementModel).options" [value]="option">
                  {{option}}
              </mat-option>
          </mat-select>
      </mat-form-field>
      <mat-form-field *ngIf="draggable"
                      appearance="fill"
                      (click)="click($event)"
                      [ngStyle]="style">
          <mat-label>{{$any(elementModel).label}}</mat-label>
          <mat-select>
              <mat-option *ngFor="let option of $any(elementModel).options" [value]="option">
                  {{option}}
              </mat-option>
          </mat-select>
      </mat-form-field>
  `,
  styles: [
    'mat-form-field {position: absolute}'
  ]
})
export class DropdownComponent extends CanvasElementComponent { }
