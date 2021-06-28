import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-image',
  template: `
      <img *ngIf="draggable"
           cdkDrag [cdkDragData]="this"
           src="{{$any(elementModel).src}}" alt="Image Placeholder"
           (click)="click($event)"
           [ngStyle]="style">
      <img *ngIf="!draggable"
           src="{{$any(elementModel).src}}" alt="Image Placeholder"
           (click)="click($event)"
           [ngStyle]="style">
  `,
  styles: [
    'img {position: absolute}'
  ]
})
export class ImageComponent extends CanvasElementComponent { }
