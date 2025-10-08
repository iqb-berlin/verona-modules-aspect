import { Component, Input } from '@angular/core';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';

@Component({
    selector: 'aspect-likert-radio-button-group',
    template: `
    <mat-radio-group [style.display]="'grid'"
                     [style.justify-items]="'center'"
                     [formControl]="elementFormControl"
                     [value]="elementModel.value"
                     [style.grid-template-columns]="firstColumnSizeRatio + 'fr ' +
                                                    '1fr '.repeat(elementModel.columnCount)">
      <div [style.grid-column-start]="1"
           [style.grid-column-end]="2"
           [style.grid-row-start]="1"
           [style.grid-row-end]="2"
           [style.place-self]="'start'"
           [style.align-self]="'center'"
           [style.align-items]="'center'"
           [class.fx-row-start-stretch]="elementModel.rowLabel.imgPosition === 'left' ||
                                         elementModel.rowLabel.imgPosition === 'right'"
           [class.fx-column-start-stretch]="elementModel.rowLabel.imgPosition === 'above' ||
                                            elementModel.rowLabel.imgPosition === 'below'">
        <aspect-text-image-panel [label]="elementModel.rowLabel"
                                 [style.justify-content]="'center'"></aspect-text-image-panel>
      </div>

      <mat-radio-button *ngFor="let column of [].constructor(elementModel.columnCount); let j = index"
                        [style.pointer-events]="elementModel.readOnly ? 'none' : 'unset'"
                        [style.place-self]="elementModel.verticalButtonAlignment"
                        [value]="j"
                        [style.grid-column-start]="2 + j"
                        [style.grid-column-end]="3 + j"
                        [style.grid-row-start]="1"
                        [style.grid-row-end]="2">
      </mat-radio-button>
    </mat-radio-group>
  `,
    styles: [`
    .fx-row-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: stretch;
    }
    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
  `],
    standalone: false
})
export class LikertRadioButtonGroupComponent extends FormElementComponent {
  @Input() elementModel!: LikertRowElement;
  @Input() firstColumnSizeRatio!: number;
}
