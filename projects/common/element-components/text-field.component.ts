import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-text-field',
  template: `
    <input *ngIf="$any(elementModel).multiline === false" matInput
           [formControl]="formControl"
           [ngStyle]="style"
           placeholder="{{$any(elementModel).placeholder}}">
    <textarea *ngIf="$any(elementModel).multiline === true" matInput
              [formControl]="formControl"
              [ngStyle]="style"
              placeholder="{{$any(elementModel).placeholder}}">
    </textarea>
  `
})
export class TextFieldComponent extends CanvasElementComponent { }
