import { Component, Input } from '@angular/core';
import { RadioButtonGroupElement } from 'common/models/elements/input-elements/radio-button-group';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-radio-button-group',
  template: `
    <div class="mat-form-field"
         [style.width.%]="100"
         [style.height.%]="100"
         [style.background-color]="elementModel.styling.backgroundColor"
         [style.color]="elementModel.styling.fontColor"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
         [style.line-height.%]="elementModel.styling.lineHeight">
      <label [id]="elementModel.id +'-radio-group-label'"
             [innerHTML]="elementModel.label | safeResourceHTML">
      </label>
      <mat-radio-group [attr.aria-labelledby]="elementModel.id +'-radio-group-label'"
                       [style.flex-direction]="elementModel.alignment === 'column' ? 'column' : 'row'"
                       [formControl]="elementFormControl"
                       [value]="elementModel.value"
                       [style.margin-top.px]="elementModel.label !== '' ? 10 : 0">
        <mat-radio-button *ngFor="let option of elementModel.options; let i = index"
                          [ngClass]="{ 'strike' : elementModel.strikeOtherOptions &&
                                                  elementFormControl.value !== null &&
                                                  elementFormControl.value !== i }"
                          [value]="i"
                          [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'">
          <div class="radio-button-label" [innerHTML]="option.text | safeResourceHTML"></div>
        </mat-radio-button>
        <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                   class="error-message">
          {{elementFormControl.errors | errorTransform: elementModel}}
        </mat-error>
      </mat-radio-group>
    </div>
  `,
  styles: [`
    mat-radio-group {
      display: flex;
    }
    .radio-button-label {
        cursor: pointer;
    }
    mat-radio-button {
      margin-bottom: 8px;
    }
    :host ::ng-deep .mdc-form-field.mat-internal-form-field{
      font-size: inherit;
      font-weight: inherit;
    }
    :host ::ng-deep mat-radio-button .mdc-form-field {
      align-items: flex-start;
    }
    :host ::ng-deep mat-radio-button .mdc-form-field .mdc-label {
      padding-top: calc((var(--mat-radio-state-layer-size) - 20px) / 2);
    }
    :host ::ng-deep .strike .mdc-form-field {
      text-decoration: line-through;
    }
    .error-message {
      font-size: 12px; line-height: 100%;
    }
  `],
  standalone: false
})
export class RadioButtonGroupComponent extends FormElementComponent {
  @Input() elementModel!: RadioButtonGroupElement;
}
