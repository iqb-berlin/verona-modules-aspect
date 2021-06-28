import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-audio',
  template: `
      <div *ngIf="!draggable"
           cdkDrag [cdkDragData]="this"
           (click)="click($event)"
           [ngStyle]="style">
          <audio controls src="{{$any(elementModel).src}}"></audio>
      </div>
      <div *ngIf="draggable"
           (click)="click($event)"
           [ngStyle]="style">
          <audio controls src="{{$any(elementModel).src}}"></audio>
      </div>
  `,
  styles: [
    'div {position: absolute; display: inline-block; border: 5px solid; padding: 12px 9px 9px 9px;}'
  ]
})
export class AudioComponent extends CanvasElementComponent {
}
