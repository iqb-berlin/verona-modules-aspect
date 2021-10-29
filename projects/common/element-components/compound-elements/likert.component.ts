import {
  Component, EventEmitter, Output, QueryList, ViewChildren
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LikertElement } from '../../models/compound-elements/likert-element';
import { ValueChangeElement } from '../../models/uI-element';
import { LikertElementRow } from '../../models/compound-elements/likert-element-row';
import { LikertRadioButtonGroupComponent } from './likert-radio-button-group.component';
import { CompoundElementComponent } from './compound-element.directive';

@Component({
  selector: 'app-likert',
  template: `
    <div class="mat-typography"
         [style.display]="'grid'" [style.grid-template-columns]="'5fr ' + '2fr '.repeat(elementModel.answers.length)"
         [style.background-color]="elementModel.backgroundColor"
         [style.color]="elementModel.fontColor"
         [style.font-family]="elementModel.font"
         [style.font-size.px]="elementModel.fontSize"
         [style.line-height.%]="elementModel.lineHeight"
         [style.font-weight]="elementModel.bold ? 'bold' : ''"
         [style.font-style]="elementModel.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.underline ? 'underline' : ''">
      <div class="headings" [style.display]="'grid'"
           [style.grid-template-columns]="'5fr ' + '2fr '.repeat(elementModel.answers.length)"
           [style.grid-column-start]="1"
           [style.grid-column-end]="elementModel.answers.length + 2"
           [style.grid-row-start]="1"
           [style.grid-row-end]="2">
        <div *ngFor="let answer of elementModel.answers; let i = index" class="answers"
             [style.grid-column-start]="2 + i"
             [style.grid-column-end]="3 + i"
             [style.grid-row-start]="1"
             [style.grid-row-end]="2">
          <img *ngIf="answer.imgSrc && answer.position === 'above'"
               [src]="answer.imgSrc | safeResourceUrl" alt="Image Placeholder"
               [style.object-fit]="'scale-down'"
               [width]="200">
          {{answer.text}}
          <img *ngIf="answer.imgSrc && answer.position === 'below'"
               [src]="answer.imgSrc | safeResourceUrl" alt="Image Placeholder"
               [style.object-fit]="'scale-down'"
               [width]="200">
        </div>
      </div>

      <ng-container *ngFor="let question of elementModel.questions; let i = index">
        <app-likert-radio-button-group
             [style.background-color]="elementModel.lineColoring && i % 2 === 0 ? elementModel.lineColoringColor : ''"
             [style.display]="'grid'"
             [style.grid-column-start]="1"
             [style.grid-column-end]="elementModel.answers.length + 2"
             [style.grid-row-start]="2 + i"
             [style.grid-row-end]="3 + i"
             [style.padding.px]="3"
             [elementModel]="elementModel.questions[i]"
             [parentForm]="parentForm"
             (formValueChanged)="formValueChanged.emit($event)">
        </app-likert-radio-button-group>
      </ng-container>
    </div>
  `,
  styles: [
    '.headings {padding-bottom: 10px}',
    '.answers {text-align: center;}',
    '::ng-deep app-likert mat-radio-button span.mat-radio-container {left: calc(50% - 10px)}'
  ]
})
export class LikertComponent extends CompoundElementComponent {
  @Output() formValueChanged = new EventEmitter<ValueChangeElement>();
  @ViewChildren(LikertRadioButtonGroupComponent) compoundChildren!: QueryList<LikertRadioButtonGroupComponent>;
  elementModel!: LikertElement;
  parentForm!: FormGroup;

  getFormElementModelChildren(): LikertElementRow[] {
    return this.elementModel.questions;
  }
}
