import { Component } from '@angular/core';
import { RadioGroupImagesElement } from './radio-group-images';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'app-radio-group-images',
  template: `
    <div [style.width.%]="100"
         [style.height.%]="100"
         [style.display]="'grid'"
         [style.grid-template-columns]="'1fr '.repeat(elementModel.columns.length)"
         [style.background-color]="elementModel.surfaceProps.backgroundColor"
         [style.color]="elementModel.fontProps.fontColor"
         [style.font-family]="elementModel.fontProps.font"
         [style.font-size.px]="elementModel.fontProps.fontSize"
         [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
         [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
      <label id="radio-group-label" class="label"
             [style.grid-column-start]="1"
             [style.grid-column-end]="2 + elementModel.columns.length"
             [style.grid-row-start]="1"
             [style.grid-row-end]="2"
             [innerHTML]="elementModel.label">
      </label>
      <div *ngFor="let option of elementModel.columns; let i = index"
           class="columns" fxLayout="column"
           [style.grid-column-start]="1 + i"
           [style.grid-column-end]="2 + i"
           [style.grid-row-start]="2"
           [style.grid-row-end]="3"
           (click)="selectOption(i)">
        <img *ngIf="option.imgSrc && option.position === 'above'"
             [src]="option.imgSrc | safeResourceUrl" alt="Image Placeholder">
        <div>{{option.text}}</div>
        <img *ngIf="option.imgSrc && option.position === 'below'"
             [src]="option.imgSrc | safeResourceUrl" alt="Image Placeholder">
      </div>
      <mat-radio-group aria-labelledby="radio-group-label"
                       [formControl]="elementFormControl"
                       [style.display]="'grid'"
                       [style.grid-template-columns]="'1fr '.repeat(elementModel.columns.length)"
                       [style.grid-column-start]="1"
                       [style.grid-column-end]="2 + elementModel.columns.length"
                       [style.grid-row-start]="3"
                       [style.grid-row-end]="4"
                       [value]="elementModel.value">
        <mat-radio-button *ngFor="let option of elementModel.columns; let i = index"
                          aria-labelledby="radio-group-label"
                          [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'"
                          [value]="i"
                          [style.grid-column-start]="1 + i"
                          [style.grid-column-end]="2 + i"
                          [style.grid-row-start]="1"
                          [style.grid-row-end]="2">
        </mat-radio-button>
      </mat-radio-group>
      <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                 class="error-message">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </div>
  `,
  styles: [
    '.columns {text-align: center; margin: 0 5px;}',
    '.grid-layout .columns img {cursor: pointer;}',
    '::ng-deep app-radio-group-images mat-radio-button span.mat-radio-container {left: calc(50% - 10px)}',
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
