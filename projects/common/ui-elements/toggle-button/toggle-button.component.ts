import { Component, Input } from '@angular/core';
import { ToggleButtonElement } from './toggle-button';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'app-toggle-button',
  template: `
    <div class="mat-form-field">
      <mat-button-toggle-group [formControl]="elementFormControl"
                               [style.height.px]="elementModel.height"
                               [style.background-color]="elementModel.surfaceProps.backgroundColor"
                               [style.color]="elementModel.fontProps.fontColor"
                               [style.font-family]="elementModel.fontProps.font"
                               [style.font-size.px]="elementModel.fontProps.fontSize"
                               [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
                               [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
                               [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
                               [style.line-height.%]="elementModel.fontProps.lineHeight">
        <mat-button-toggle *ngFor="let option of elementModel.options; let i = index"
                           [value]="i"
                           [ngClass]="{ 'strike' : elementModel.strikeOtherOptions &&
                                                   elementFormControl.value !== null &&
                                                   elementFormControl.value !== i }">
          {{option}}
        </mat-button-toggle>
      </mat-button-toggle-group>
    </div>
  `,
  styles: [
    'mat-button-toggle-group {min-width: 70px; min-height: 20px}',
    ':host ::ng-deep .mat-button-toggle-button {height: 100%}',
    ':host ::ng-deep .mat-button-toggle-label-content {height: 100%; line-height: unset}',
    ':host ::ng-deep .strike .mat-button-toggle-label-content {text-decoration: line-through}',
  ]
})
export class ToggleButtonComponent extends FormElementComponent {
  @Input() elementModel!: ToggleButtonElement;
}
