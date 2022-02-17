import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { LikertRowElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-likert-radio-button-group',
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
                        [value]="j + 1"
                        [style.grid-column-start]="2 + j"
                        [style.grid-column-end]="3 + j"
                        [style.grid-row-start]="1"
                        [style.grid-row-end]="2">
      </mat-radio-button>
    </mat-radio-group>
  `
})
export class LikertRadioButtonGroupComponent extends FormElementComponent {
  @Input() elementModel!: LikertRowElement;
  @Input() firstColumnSizeRatio!: number;
}
