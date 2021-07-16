import { Component } from '@angular/core';
import { RadioButtonGroupElement } from '../unit';
import { FormElementComponent } from '../form-element-component.directive';

@Component({
  selector: 'app-radio-button-group',
  template: `
      <div [style.width.px]="elementModel.width"
           [style.height.px]="elementModel.height"
           [style.background-color]="elementModel.backgroundColor"
           [style.color]="elementModel.fontColor"
           [style.font-family]="elementModel.font"
           [style.font-size.px]="elementModel.fontSize"
           [style.font-weight]="elementModel.bold ? 'bold' : ''"
           [style.font-style]="elementModel.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.underline ? 'underline' : ''">
          <label id="radio-group-label">{{elementModel.label}}</label>
          <mat-radio-group aria-labelledby="radio-group-label" fxLayout="{{elementModel.alignment}}"
                           [formControl]="formControl">
              <mat-radio-button *ngFor="let option of elementModel.options" [value]="option">
                  {{option}}
              </mat-radio-button>
          </mat-radio-group>
      </div>
  `
})
export class RadioButtonGroupComponent extends FormElementComponent {
  elementModel!: RadioButtonGroupElement;
}
