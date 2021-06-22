import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-video',
  template: `
    <div *ngIf="!manualPositioning"
         cdkDrag [cdkDragData]="this"
         (click)="click($event)"
         [ngStyle]="style">
      <video controls src="{{$any(elementModel).src}}"></video>
    </div>
    <div *ngIf="manualPositioning"
         (click)="click($event)"
         [ngStyle]="style">
      <video controls src="{{$any(elementModel).src}}"></video>
    </div>
  `,
  styles: [
    'div {position: absolute; display: inline-block;border: 5px solid; padding: 12px 9px 9px 9px}'
  ]
})
export class VideoComponent extends CanvasElementComponent { }
