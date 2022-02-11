import { Component, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { SpellCorrectElement } from './spell-correct-element';

@Component({
  selector: 'aspect-spell-correct',
  template: `
    <div class="element-content-wrapper">
      <div [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
           [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : '100%'"
           [class.center-content]="elementModel.positionProps.dynamicPositioning &&
             elementModel.positionProps.fixedSize">
        <div fxFlex
             fxLayout="column"
             aspectInputBackgroundColor [backgroundColor]="elementModel.surfaceProps.backgroundColor"
             [style.width.%]="100"
             [style.height.%]="100">
          <mat-form-field class="small-input">
            <input matInput type="text"
                   [style.text-align]="'center'"
                   autocomplete="off"
                   [readonly]="elementModel.readOnly"
                   [style.color]="elementModel.fontProps.fontColor"
                   [style.font-family]="elementModel.fontProps.font"
                   [style.font-size.px]="elementModel.fontProps.fontSize"
                   [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
                   [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
                   [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
                   [value]="elementModel.value"
                   [formControl]="elementFormControl">
          </mat-form-field>
          <button #buttonElement
                  mat-button
                  type="button"
                  [disabled]="elementModel.readOnly"
                  [style.color]="elementModel.fontProps.fontColor"
                  [style.font-family]="elementModel.fontProps.font"
                  [style.font-size.px]="elementModel.fontProps.fontSize"
                  [style.font-weight]="elementModel.fontProps.bold ? 'bold' : '400'"
                  [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
                  [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
                  [style.width.%]="100"
                  [style.margin-top]="'-20px'"
                  [style.text-decoration-line]=
                    "(inputElement && inputElement.focused) ||
                    (inputElement && !!inputElement.value) ||
                    (elementFormControl && elementFormControl.value === '') ? 'line-through' : ''"
                  (click)="
                elementFormControl.value === null ?
                inputElement.focus() :
                buttonElement.focus();
                elementFormControl.value === null ?
                (elementFormControl.setValue('')) :
                elementFormControl.setValue(null)">{{elementModel.label}}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    '::ng-deep app-spell-correct .small-input div.mat-form-field-infix {border-top: none; padding: 0.75em 0 0.25em 0;}'
  ]
})
export class SpellCorrectComponent extends FormElementComponent {
  elementModel!: SpellCorrectElement;

  @ViewChild(MatInput) inputElement!: MatInput;
}
