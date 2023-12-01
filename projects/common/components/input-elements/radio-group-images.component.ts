import { Component, Input } from '@angular/core';
import { RadioButtonGroupComplexElement } from 'common/models/elements/input-elements/radio-button-group-complex';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-radio-group-images',
  template: `
      <label [id]="elementModel.id+'-radio-group-label'"
             [innerHTML]="elementModel.label | safeResourceHTML">
      </label>
      <mat-radio-group [attr.aria-labelledby]="elementModel.id+'-radio-group-label'"
                       [style.grid-template-columns]="elementModel.itemsPerRow !== null ?
                                                      'repeat(' + elementModel.itemsPerRow + ', 1fr)' :
                                                      'repeat(' + elementModel.options.length + ', 1fr)'"
                       [formControl]="elementFormControl"
                       [value]="elementModel.value">
        <mat-radio-button *ngFor="let option of elementModel.options; let i = index"
                          [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'"
                          [value]="i">
          <aspect-text-image-panel class="radio-button-label"
                                   [label]="option"
                                   [style.color]="elementModel.styling.fontColor"
                                   [style.font-size.px]="elementModel.styling.fontSize"
                                   [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                                   [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                                   [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
          </aspect-text-image-panel>
        </mat-radio-button>
      </mat-radio-group>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 class="error-message">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
  `,
  styles: [`
    .radio-button-label {
      cursor: pointer;
      justify-content: center;
    }
    mat-radio-group {
      display: grid;
      align-items: end;
    }

    :host ::ng-deep mat-radio-button .mdc-form-field {
      display: flex;
      flex-direction: column-reverse;
      margin-bottom: 60px;
    }

    :host ::ng-deep mat-radio-button .mdc-form-field label {
      margin: 0;
      padding: 0;
    }

    .error-message {
      font-size: 75%;
    }
  `]
})
export class RadioGroupImagesComponent extends FormElementComponent {
  @Input() elementModel!: RadioButtonGroupComplexElement;
}
