import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LikertElement } from '../../models/compound-elements/likert-element';

@Component({
  selector: 'app-likert',
  template: `
    <div [style.display]="'grid'"
         [style.grid-template-columns]="'5fr ' + '2fr '.repeat(elementModel.answers.length)">

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
          <img *ngIf="answer.imgSrc && answer.position === 'above'" [src]="answer.imgSrc" alt="Image Placeholder"
               [style.object-fit]="'scale-down'"
               [width]="200">
          {{answer.text}}
          <img *ngIf="answer.imgSrc && answer.position === 'below'" [src]="answer.imgSrc" alt="Image Placeholder"
               [style.object-fit]="'scale-down'"
               [width]="200">
        </div>
      </div>

      <ng-container *ngFor="let question of elementModel.questions; let i = index">
        <app-likert-radio-button-group
             [ngClass]="{ 'odd': elementModel.lineColoring && i % 2 === 0 }"
             [style.display]="'grid'"
             [style.grid-column-start]="1"
             [style.grid-column-end]="elementModel.answers.length + 2"
             [style.grid-row-start]="2 + i"
             [style.grid-row-end]="3 + i"
             [elementModel]="elementModel.questions[i]"
             [parentForm]="parentForm">
        </app-likert-radio-button-group>
      </ng-container>
    </div>
  `,
  styles: [
    '.headings {padding-bottom: 10px}',
    '.odd {background-color: #D0F6E7;}',
    '.answers {text-align: center;}',
    '::ng-deep app-likert mat-radio-button span.mat-radio-container {left: calc(50% - 10px)}'
  ]
})
export class LikertComponent {
  elementModel!: LikertElement;
  parentForm!: FormGroup;
}
