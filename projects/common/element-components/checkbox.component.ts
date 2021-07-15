import { Component } from '@angular/core';
import { CheckboxElement } from '../unit';
import { FormElementComponent } from '../form-element-component.directive';

@Component({
  selector: 'app-checkbox',
  template: `
      <mat-checkbox class="example-margin"
                    [formControl]="formControl"
                    [style.width.px]="elementModel.width"
                    [style.height.px]="elementModel.height"
                    [style.background-color]="elementModel.backgroundColor"
                    [style.color]="elementModel.fontColor"
                    [style.font-family]="elementModel.font"
                    [style.font-size.px]="elementModel.fontSize"
                    [style.font-weight]="elementModel.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.underline ? 'underline' : ''">
          {{elementModel.label}}
      </mat-checkbox>
  `
})
export class CheckboxComponent extends FormElementComponent {
  elementModel!: CheckboxElement;
}
