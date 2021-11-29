import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { SpellCorrectElement } from './spell-correct-element';

@Component({
  selector: 'app-spell-correct',
  template: `
    <div fxFlex
         fxLayout="column"
         [style.width.%]="100"
         appInputBackgroundColor [backgroundColor]="elementModel.backgroundColor"
         [style.height.%]="100">
      <mat-form-field class="small-input">
        <input matInput type="text"
               [style.text-align]="'center'"
               autocomplete="off"
               [formControl]="elementFormControl">
      </mat-form-field>
      <button mat-button
              [style.color]="elementModel.fontColor"
              [style.font-family]="elementModel.font"
              [style.font-size.px]="elementModel.fontSize"
              [style.font-weight]="elementModel.bold ? 'bold' : ''"
              [style.font-style]="elementModel.italic ? 'italic' : ''"
              [style.width.%]="100"
              [style.margin-top]="'-20px'"
              [style.text-decoration-line]="strikethrough() ? 'line-through' : ''"
              (click)="onClick($event)">
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
  @ViewChild(MatInput) inputElement!: MatInput;
  @ViewChild(MatButton) buttonElement!: MatButton;

  ngOnInit(): void {
    super.ngOnInit();
    if (this.inputElement && this.elementModel.readOnly) {
      this.inputElement.readonly = true;
    }
    if (this.buttonElement && this.elementModel.readOnly) {
      this.buttonElement.disabled = true;
    }
  }

  strikethrough(): boolean {
    if (this.inputElement) {
      const value = this.inputElement.value;
      if (value === null) return false;
      if (value === undefined) return false;
      return value.length > 0;
    }
    return false;
  }

  onClick(event: MouseEvent) : void {
    if (this.strikethrough()) {
      this.elementFormControl.setValue('');
    } else {
      this.elementFormControl.setValue(this.elementModel.label);
      this.inputElement.focus();
    }
    event.preventDefault();
    event.stopPropagation();
  }
}
