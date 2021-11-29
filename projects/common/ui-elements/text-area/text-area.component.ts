import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { TextAreaElement } from './text-area-element';

@Component({
  selector: 'app-text-area',
  template: `
    <mat-form-field [style.width.%]="100"
                    [style.min-height.%]="100"
                    appInputBackgroundColor [backgroundColor]="elementModel.surfaceProps.backgroundColor"
                    [style.color]="elementModel.fontProps.fontColor"
                    [style.font-family]="elementModel.fontProps.font"
                    [style.font-size.px]="elementModel.fontProps.fontSize"
                    [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
                    [appearance]="$any(elementModel.appearance)">
      <textarea matInput #input
                autocomplete="off" rows="{{elementModel.rowCount}}" placeholder="{{elementModel.label}}"
                [formControl]="elementFormControl"
                [value]="elementModel.value"
                [readonly]="elementModel.readOnly"
                [style.min-width.%]="100"
                [style.line-height.%]="elementModel.fontProps.lineHeight"
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
  @Input() elementModel!: TextAreaElement;
  @Output() onFocusChanged = new EventEmitter<HTMLElement | null>();
}
