import {
  Component, Output, EventEmitter, Input
} from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { TextAreaElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-text-area',
  template: `
    <mat-form-field [ngClass]="{ 'no-label' : !elementModel.label}"
                    [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
                    [style.min-height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : '100%'"
                    [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                    elementModel.positionProps.fixedSize"
                    aspectInputBackgroundColor [backgroundColor]="elementModel.styles.backgroundColor"
                    [style.color]="elementModel.styles.fontColor"
                    [style.font-family]="elementModel.styles.font"
                    [style.font-size.px]="elementModel.styles.fontSize"
                    [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''"
                    [appearance]="elementModel.appearance">
      <mat-label *ngIf="elementModel.label">{{elementModel.label}}</mat-label>
      <textarea matInput #input
                autocomplete="off" rows="{{elementModel.rowCount}}"
                [formControl]="elementFormControl"
                [value]="elementModel.value"
                [readonly]="elementModel.readOnly"
                [style.min-width.%]="100"
                [style.line-height.%]="elementModel.styles.lineHeight"
                [style.resize]="elementModel.resizeEnabled ? 'both' : 'none'"
                (focus)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(input) : null"
                (blur)="elementModel.inputAssistancePreset !== 'none' ? onFocusChanged.emit(null): null">
      </textarea>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
  `,
  styles: [
    ':host ::ng-deep div.mat-form-field-infix {padding-top: 0.2em; padding-bottom: 0.2em;}',
    ':host ::ng-deep .no-label .mat-form-field-outline-gap {border-top-color: unset !important}'
  ]
})
export class TextAreaComponent extends FormElementComponent {
  @Input() elementModel!: TextAreaElement;
  @Output() onFocusChanged = new EventEmitter<HTMLElement | null>();
}
