import { Component, Input } from '@angular/core';
import { RadioButtonGroupComplexElement } from 'common/models/elements/input-elements/radio-button-group-complex';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'aspect-radio-group-images',
  template: `
      <label id="radio-group-label"
              [innerHTML]="elementModel.label">
      </label>
      <mat-radio-group aria-labelledby="radio-group-label"
                       [style.grid-template-columns]="elementModel.itemsPerRow !== null ?
                                                      'repeat(' + elementModel.itemsPerRow + ', 1fr)' :
                                                      'repeat(' + elementModel.options.length + ', 1fr)'"
                       [formControl]="elementFormControl"
                       [value]="elementModel.value">
        <mat-radio-button *ngFor="let option of elementModel.options; let i = index"
                          [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'"
                          fxLayout="column" fxLayoutAlign="end center"
                          [value]="i">
          <img *ngIf="option.imgSrc && (option.imgPosition === 'above' || option.imgPosition === 'left')"
               [style.object-fit]="'scale-down'"
               [style.max-width.%]="100"
               [src]="option.imgSrc | safeResourceUrl" alt="Image Placeholder">
          <div [innerHTML]="sanitizer.bypassSecurityTrustHtml(option.text)"
               [style.background-color]="elementModel.styling.backgroundColor"
               [style.color]="elementModel.styling.fontColor"
               [style.font-family]="elementModel.styling.font"
               [style.font-size.px]="elementModel.styling.fontSize"
               [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
               [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
               [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"></div>
          <img *ngIf="option.imgSrc && (option.imgPosition === 'below' || option.imgPosition === 'right')"
               [style.object-fit]="'scale-down'"
               [style.max-width.%]="100"
               [src]="option.imgSrc | safeResourceUrl" alt="Image Placeholder">
        </mat-radio-button>
      </mat-radio-group>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 class="error-message">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
  `,
  styles: [
    'mat-radio-group {display: grid}',
    ':host ::ng-deep .mat-radio-label {flex-direction: column-reverse;}',
    ':host ::ng-deep .mat-radio-label .mat-radio-container {margin-top: 15px; margin-left: 10px;}',
    ':host ::ng-deep .mat-radio-label .mat-radio-label-content {text-align: center;}',
    'mat-radio-button {margin-bottom: 60px;}',
    '.error-message { font-size: 75% }'
  ]
})
export class RadioGroupImagesComponent extends FormElementComponent {
  @Input() elementModel!: RadioButtonGroupComplexElement;

  selectOption(index: number): void {
    this.elementFormControl.setValue(index);
  }
}
