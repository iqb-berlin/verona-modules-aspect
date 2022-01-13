import { Component, Input } from '@angular/core';
import { ToggleButtonElement } from './toggle-button';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'app-toggle-button',
  template: `
    <div class="mat-form-field">
      <mat-button-toggle-group [formControl]="elementFormControl"
                               [value]="elementModel.value"
                               [style.height.px]="elementModel.height"
                               [style.width]="elementModel.dynamicWidth ? 'unset' : elementModel.width+'px'"
                               [vertical]="elementModel.verticalOrientation">
        <mat-button-toggle *ngFor="let option of elementModel.options; let i = index"
                           [value]="i"
                           [ngClass]="{ 'strike' : elementModel.strikeOtherOptions &&
                                                   elementFormControl.value !== null &&
                                                   elementFormControl.value !== i }"
                           [style.color]="elementModel.fontProps.fontColor"
                           [style.font-size.px]="elementModel.fontProps.fontSize"
                           [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
                           [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
                           [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
                           [style.font-family]="elementModel.fontProps.font"
                           [style.background-color]="elementFormControl.value !== null &&
                                                   elementFormControl.value === i ?
                                                   elementModel.selectionColor :
                                                   elementModel.surfaceProps.backgroundColor"
                           [style.line-height.%]="elementModel.fontProps.lineHeight">
                           <!--Background color does not show in editor-->
          {{option}}
        </mat-button-toggle>
      </mat-button-toggle-group>
    </div>
  `,
  styles: [
    'mat-button-toggle-group {min-width: 70px; min-height: 20px}',
    ':host ::ng-deep mat-button-toggle {width: 100%; height: 100%}',
    ':host ::ng-deep .mat-button-toggle-button {height: 100%}',
    ':host ::ng-deep .mat-button-toggle-label-content {line-height: unset}',
    ':host ::ng-deep .strike .mat-button-toggle-label-content {text-decoration: line-through}'
  ]
})
export class ToggleButtonComponent extends FormElementComponent {
  @Input() elementModel!: ToggleButtonElement;
}
