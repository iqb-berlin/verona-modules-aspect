import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { ToggleButtonElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-toggle-button',
  template: `
    <div class="mat-form-field">
      <mat-button-toggle-group [formControl]="elementFormControl"
                               [value]="elementModel.value"
                               [style.height.px]="elementModel.height"
                               [style.width]="elementModel.dynamicWidth ? 'unset' : elementModel.width+'px'"
                               [vertical]="elementModel.verticalOrientation">
        <mat-button-toggle *ngFor="let option of elementModel.richTextOptions; let i = index"
                           [value]="i"
                           [ngClass]="{ 'strike' : elementModel.strikeOtherOptions &&
                                                   elementFormControl.value !== null &&
                                                   elementFormControl.value !== i }"
                           [style.color]="elementModel.styling.fontColor"
                           [style.font-size.px]="elementModel.styling.fontSize"
                           [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                           [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                           [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                           [style.font-family]="elementModel.styling.font"
                           [style.background-color]="elementFormControl.value !== null &&
                                                   elementFormControl.value === i ?
                                                   elementModel.styling.selectionColor :
                                                   elementModel.styling.backgroundColor"
                           [style.line-height.%]="elementModel.styling.lineHeight"
                           [innerHTML]="option">
                           <!--Background color does not show in editor-->
        </mat-button-toggle>
      </mat-button-toggle-group>
    </div>
  `,
  styles: [
    'mat-button-toggle-group {min-width: 70px; min-height: 20px; display: inline-flex;}',
    ':host ::ng-deep mat-button-toggle {width: 100%; height: 100%}',
    ':host ::ng-deep .mat-button-toggle-button {height: 100%}',
    ':host ::ng-deep .mat-button-toggle-label-content {line-height: unset}',
    ':host ::ng-deep .strike .mat-button-toggle-label-content {text-decoration: line-through}'
  ]
})
export class ToggleButtonComponent extends FormElementComponent {
  @Input() elementModel!: ToggleButtonElement;
}
