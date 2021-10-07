import { Component, EventEmitter, Output } from '@angular/core';
import { RadioButtonGroupElement } from '../unit';
import { FormElementComponent } from '../form-element-component.directive';

@Component({
  selector: 'app-radio-button-group',
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
      <label [innerHTML]="elementModel.label" id="radio-group-label"></label>
      <mat-radio-group aria-labelledby="radio-group-label"
                       (focusin)="onFocusin.emit()"
                       [style.margin-bottom.px]="25"
                       [fxLayout]="elementModel.alignment"
                       [formControl]="elementFormControl">
        <mat-radio-button *ngFor="let option of elementModel.options"
                          [value]="option">
          {{option}}
        </mat-radio-button>
        <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched"
                   [style.font-size.%]="75"
                   [style.margin-top.px]="25"
                   [style.position]="'absolute'">
          {{elementFormControl.errors | errorTransform: elementModel}}
        </mat-error>
      </mat-radio-group>
    </div>
  `
})
export class RadioButtonGroupComponent extends FormElementComponent {
  @Output() onFocusin = new EventEmitter();
  elementModel!: RadioButtonGroupElement;
}
