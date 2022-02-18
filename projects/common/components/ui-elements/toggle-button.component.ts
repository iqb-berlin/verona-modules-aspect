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
        <mat-button-toggle *ngFor="let option of elementModel.options; let i = index"
                           [value]="i + 1"
                           [ngClass]="{ 'strike' : elementModel.strikeOtherOptions &&
                                                   elementFormControl.value !== null &&
                                                   elementFormControl.value !== i + 1 }"
                           [style.color]="elementModel.styles.fontColor"
                           [style.font-size.px]="elementModel.styles.fontSize"
                           [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
                           [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
                           [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''"
                           [style.font-family]="elementModel.styles.font"
                           [style.background-color]="elementFormControl.value !== null &&
                                                   elementFormControl.value === i + 1 ?
                                                   elementModel.selectionColor :
                                                   elementModel.styles.backgroundColor"
                           [style.line-height.%]="elementModel.styles.lineHeight">
                           <!--Background color does not show in editor-->
          {{option}}
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
