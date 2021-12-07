import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { LikertElementRow } from './likert-element-row';

@Component({
  selector: 'app-likert-radio-button-group',
  template: `
    <mat-radio-group [style.display]="'grid'"
                     [formControl]="elementFormControl"
                     [value]="elementModel.value"
                     [style.grid-template-columns]="firstColumnSizeRatio + 'fr ' +
                                                    '1fr '.repeat(elementModel.columnCount)">
      <div [style.grid-column-start]="1"
           [style.grid-column-end]="2"
           [style.grid-row-start]="1"
           [style.grid-row-end]="2">
        {{elementModel.text}}
      </div>

      <mat-radio-button *ngFor="let column of [].constructor(elementModel.columnCount); let j = index"
                        [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'"
                        [value]="j"
                        [style.grid-column-start]="2 + j"
                        [style.grid-column-end]="3 + j"
                        [style.grid-row-start]="1"
                        [style.grid-row-end]="2">
      </mat-radio-button>
    </mat-radio-group>
  `,
  styles: [
    ':host ::ng-deep mat-radio-button .mat-radio-label .mat-radio-outer-circle {border-color: #006064 !important}',
    ':host ::ng-deep mat-radio-button .mat-radio-label .mat-radio-inner-circle {background-color: #006064 !important}',
    ':host ::ng-deep mat-radio-button .mat-radio-label .mat-ripple-element {background-color: #006064 !important}'
  ]
})
export class LikertRadioButtonGroupComponent extends FormElementComponent {
  @Input() elementModel!: LikertElementRow;
  @Input() firstColumnSizeRatio!: number;
}
