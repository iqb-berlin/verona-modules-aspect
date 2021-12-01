import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { SpellCorrectElement } from './spell-correct-element';

@Component({
  selector: 'app-spell-correct',
  template: `
    <div fxFlex
         fxLayout="column"
         appInputBackgroundColor [backgroundColor]="elementModel.surfaceProps.backgroundColor"
         [style.width.%]="100"
         [style.height.%]="100">
      <mat-form-field class="small-input">
        <input matInput type="text"
               [style.text-align]="'center'"
               autocomplete="off"
               [readonly]="elementModel.readOnly"
               [value]="elementModel.value"
               [formControl]="elementFormControl">
      </mat-form-field>
      <button mat-button
              type="button"
              [disabled]="elementModel.readOnly"
              [style.color]="elementModel.fontProps.fontColor"
              [style.font-family]="elementModel.fontProps.font"
              [style.font-size.px]="elementModel.fontProps.fontSize"
              [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
              [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
              [style.width.%]="100"
              [style.margin-top]="'-20px'"
              [style.text-decoration-line]="strikethrough ? 'line-through' : ''"
              (click)="onClick()">
        &nbsp;{{elementModel.label}}&nbsp;
      </button>
    </div>
  `,
  styles: [
    '::ng-deep app-spell-correct .small-input div.mat-form-field-infix {border-top: none; padding: 0.75em 0 0.25em 0;}'
  ]
})
export class SpellCorrectComponent extends FormElementComponent implements OnInit {
  elementModel!: SpellCorrectElement;
  strikethrough!: boolean;

  @ViewChild(MatInput) inputElement!: MatInput;

  strikeOut(): boolean {
    this.strikethrough = (this.inputElement && this.inputElement.value) ? this.inputElement.value.length > 0 : false;
    return this.strikethrough;
  }

  onClick() : void {
    if (this.strikeOut()) {
      this.elementFormControl.setValue('');
    } else {
      this.elementFormControl.setValue(this.elementModel.label);
      this.inputElement.focus();
    }
  }
}
