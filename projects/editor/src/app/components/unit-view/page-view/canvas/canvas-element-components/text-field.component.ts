import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-text-field',
  template: `
      <div *ngIf="!draggable"
           cdkDrag [cdkDragData]="this">
          <input *ngIf="$any(elementModel).multiline === false" matInput (click)="click($event)"
                 [ngStyle]="style"
                 placeholder="{{$any(elementModel).placeholder}}">
          <textarea *ngIf="$any(elementModel).multiline === true" matInput
                    (click)="click($event)"
                    [ngStyle]="style"
                    placeholder="{{$any(elementModel).placeholder}}">
      </textarea>
      </div>
      <div *ngIf="draggable">
          <input *ngIf="$any(elementModel).multiline === false" matInput (click)="click($event)"
                 [ngStyle]="style"
                 placeholder="{{$any(elementModel).placeholder}}">
          <textarea *ngIf="$any(elementModel).multiline === true" matInput
                    (click)="click($event)"
                    [ngStyle]="style"
                    placeholder="{{$any(elementModel).placeholder}}">
      </textarea>
      </div>
  `,
  styles: [
    'div {position: absolute}'
  ]
})
export class TextFieldComponent extends CanvasElementComponent { }
