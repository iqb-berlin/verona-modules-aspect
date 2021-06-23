import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-radio-button-group',
  template: `
      <div *ngIf="!draggable"
           cdkDrag [cdkDragData]="this"
           (click)="click($event)"
           [ngStyle]="style">
          <label id="radio-group-label">{{$any(elementModel).text}}</label>
          <mat-radio-group aria-labelledby="radio-group-label" fxLayout="{{elementModel.alignment}}">
              <mat-radio-button *ngFor="let option of $any(elementModel).options" [value]="option">
                  {{option}}
              </mat-radio-button>
          </mat-radio-group>
      </div>
      <div *ngIf="draggable"
           (click)="click($event)"
           [ngStyle]="style">
          <label id="radio-group-label">{{$any(elementModel).text}}</label>
          <mat-radio-group aria-labelledby="radio-group-label" fxLayout="{{elementModel.alignment}}">
              <mat-radio-button *ngFor="let option of $any(elementModel).options" [value]="option">
                  {{option}}
              </mat-radio-button>
          </mat-radio-group>
      </div>
  `,
  styles: [
    'div {position: absolute}'
  ]
})
export class RadioButtonGroupComponent extends CanvasElementComponent { }
