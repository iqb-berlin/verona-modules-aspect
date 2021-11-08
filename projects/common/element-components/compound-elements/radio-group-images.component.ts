import { Component } from '@angular/core';
import { RadioGroupImagesElement } from '../../models/compound-elements/radio-group-images';
import { FormElementComponent } from '../../form-element-component.directive';

@Component({
  selector: 'app-radio-group-images',
  template: `
    <div class="mat-form-field"
         [style.width.%]="100"
         [style.height.%]="100"
         [style.background-color]="elementModel.backgroundColor"
         [style.color]="elementModel.fontColor"
         [style.font-family]="elementModel.font"
         [style.font-size.px]="elementModel.fontSize"
         [style.font-weight]="elementModel.bold ? 'bold' : ''"
         [style.font-style]="elementModel.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.underline ? 'underline' : ''">
      <label id="radio-group-label" class="white-space-break"
             [innerHTML]="elementModel.label">
      </label>
      <mat-radio-group aria-labelledby="radio-group-label" [formControl]="elementFormControl"
                       class="grid-layout" [style.display]="'grid'"
                       [style.grid-template-columns]="'1fr '.repeat(elementModel.columns.length)">
        <label *ngFor="let option of elementModel.columns; let i = index" class="columns"
               id="radio-group-label"
               fxLayout="column"
               [style.grid-column-start]="1 + i"
               [style.grid-column-end]="2 + i"
               [style.grid-row-start]="1"
               [style.grid-row-end]="2"
               (click)="selectOption(i)">
          <img *ngIf="option.imgSrc && option.position === 'above'"
               [src]="option.imgSrc | safeResourceUrl" alt="Image Placeholder">
          <div>{{option.text}}</div>
          <img *ngIf="option.imgSrc && option.position === 'below'"
               [src]="option.imgSrc | safeResourceUrl" alt="Image Placeholder">
        </label>
        <mat-radio-button *ngFor="let option of elementModel.columns; let i = index"
                          aria-labelledby="radio-group-label"
                          [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'"
                          [value]="i"
                          [style.grid-column-start]="1 + i"
                          [style.grid-column-end]="2 + i"
                          [style.grid-row-start]="2"
                          [style.grid-row-end]="3">
        </mat-radio-button>
      </mat-radio-group>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 class="error-message">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </div>
  `,
  styles: [
    '.grid-layout .columns {text-align: center;}',
    '.grid-layout .columns img {height: 100%; object-fit: none; cursor: pointer;}',
    '::ng-deep app-radio-group-images .grid-layout mat-radio-button span.mat-radio-container {left: calc(50% - 10px)}',
    'mat-radio-group {margin-top: 10px}',
    '.error-message { font-size: 75% }',
    '.grid-layout mat-radio-button {margin-top: 15px}'
  ]
})
export class RadioGroupImagesComponent extends FormElementComponent {
  elementModel!: RadioGroupImagesElement;

  selectOption(index: number): void {
    this.elementFormControl.setValue(index);
  }
}
