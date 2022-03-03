import { Component, Input, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { SpellCorrectElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-spell-correct',
  template: `
    <div [style.width.%]="100"
         [style.height.%]="100">
      <div fxFlex fxLayout="column"
           aspectInputBackgroundColor [backgroundColor]="elementModel.styling.backgroundColor"
           [style.width.%]="100"
           [style.height.%]="100">
        <mat-form-field class="small-input">
          <input matInput type="text"
                 [style.text-align]="'center'"
                 autocomplete="off"
                 [readonly]="elementModel.readOnly"
                 [style.color]="elementModel.styling.fontColor"
                 [style.font-family]="elementModel.styling.font"
                 [style.font-size.px]="elementModel.styling.fontSize"
                 [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
                 [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                 [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                 [value]="elementModel.value"
                 [formControl]="elementFormControl">
        </mat-form-field>
        <button #buttonElement
                mat-button
                type="button"
                [disabled]="elementModel.readOnly"
                [style.color]="elementModel.styling.fontColor"
                [style.font-family]="elementModel.styling.font"
                [style.font-size.px]="elementModel.styling.fontSize"
                [style.font-weight]="elementModel.styling.bold ? 'bold' : '400'"
                [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
                [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
                [style.width.%]="100"
                [style.margin-top]="'-20px'"
                [style.text-decoration-line]="(inputElement && inputElement.focused) ||
                                              (inputElement && !!inputElement.value) ||
                                              (elementFormControl && elementFormControl.value === '') ? 'line-through' : ''"
                (click)="elementFormControl.value === null ?
                           inputElement.focus() :
                           buttonElement.focus();
                        elementFormControl.value === null ?
                            (elementFormControl.setValue('')) :
                            elementFormControl.setValue(null)">{{elementModel.label}}
        </button>
      </div>
    </div>
  `,
  styles: [
    ':host ::ng-deep .small-input div.mat-form-field-infix {border-top: none; padding: 0.75em 0 0.25em 0;}'
  ]
})
export class SpellCorrectComponent extends FormElementComponent {
  @Input() elementModel!: SpellCorrectElement;
  @ViewChild(MatInput) inputElement!: MatInput;
}
