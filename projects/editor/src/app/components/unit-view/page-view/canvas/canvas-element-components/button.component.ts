import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-button',
  template: `
    <button *ngIf="!manualPositioning"
            cdkDrag [cdkDragData]="this"
            mat-button (click)="click($event)"
            [ngStyle]="style">
      {{$any(elementModel).label}}
    </button>
    <button *ngIf="manualPositioning"
            mat-button (click)="click($event)"
            [ngStyle]="style">
      {{$any(elementModel).label}}
    </button>
  `,
  styles: [
    'button {position: absolute}'
  ]
})
export class ButtonComponent extends CanvasElementComponent { }
