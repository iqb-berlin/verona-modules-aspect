import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-checkbox',
  template: `
      <mat-checkbox *ngIf="!draggable"
                    cdkDrag [cdkDragData]="this"
                    class="example-margin"
                    (click)="click($event)"
                    [ngStyle]="style">
          {{$any(elementModel).label}}
      </mat-checkbox>
      <mat-checkbox *ngIf="draggable"
                    class="example-margin"
                    (click)="click($event)"
                    [ngStyle]="style">
          {{$any(elementModel).label}}
      </mat-checkbox>
  `,
  styles: [
    'button {position: absolute}'
  ]
})
export class CheckboxComponent extends CanvasElementComponent { }
