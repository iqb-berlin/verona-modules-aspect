import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-text-field',
  template: `
    <input *ngIf="$any(elementModel).multiline === false" matInput
           placeholder="{{$any(elementModel).placeholder}}"
           [formControl]="formControl">
    <textarea *ngIf="$any(elementModel).multiline === true" matInput
              placeholder="{{$any(elementModel).placeholder}}"
              [formControl]="formControl"
              [style.width.px]="elementModel.width"
              [style.height.px]="elementModel.height"
              [style.background-color]="elementModel.backgroundColor"
              [style.color]="elementModel.fontColor"
              [style.font-family]="elementModel.font"
              [style.font-size.px]="elementModel.fontSize"
              [style.font-weight]="elementModel.bold ? 'bold' : ''"
              [style.font-style]="elementModel.italic ? 'italic' : ''"
              [style.text-decoration]="elementModel.underline ? 'underline' : ''">
    </textarea>
  `
})
export class TextFieldComponent extends CanvasElementComponent { }
