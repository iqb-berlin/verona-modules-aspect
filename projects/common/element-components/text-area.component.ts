import { Component, Output, EventEmitter } from '@angular/core';
import { FormElementComponent } from '../form-element-component.directive';
import { TextAreaElement } from '../models/text-area-element';

@Component({
  selector: 'app-text-area',
  template: `
    <mat-form-field [style.width.%]="100"
                    [style.min-height.%]="100"
                    appInputBackgroundColor [backgroundColor]="elementModel.backgroundColor"
                    [style.color]="elementModel.fontColor"
                    [style.font-family]="elementModel.font"
                    [style.font-size.px]="elementModel.fontSize"
                    [style.font-weight]="elementModel.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.underline ? 'underline' : ''"
                    [appearance]="$any(elementModel.appearance)">
      <textarea matInput #input
                autocomplete="off" rows="{{elementModel.rowCount}}" placeholder="{{elementModel.label}}"
                [formControl]="elementFormControl"
                [value]="elementModel.value"
                [readonly]="elementModel.readOnly"
                [style.min-width.%]="100"
                [style.line-height.%]="elementModel.lineHeight"
                [style.resize]="elementModel.resizeEnabled ? 'both' : 'none'"
                (focus)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(input) : null"
                (blur)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(null): null">
      </textarea>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
  `
})
export class TextAreaComponent extends FormElementComponent {
  @Output() onFocusChanged = new EventEmitter<HTMLElement | null>();
  elementModel!: TextAreaElement;
}
