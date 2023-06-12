import {
  Component, Input, QueryList, ViewChildren
} from '@angular/core';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { ElementComponent } from 'common/directives/element-component.directive';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';
import { LikertRadioButtonGroupComponent } from './likert-radio-button-group.component';

@Component({
  selector: 'aspect-likert',
  template: `
    <div *ngIf="elementModel.rows.length === 0 && elementModel.options.length === 0">
      Keine Zeilen oder Spalten vorhanden
    </div>
    <div class="wrapper"
         [style.background-color]="elementModel.styling.backgroundColor"
         [style.color]="elementModel.styling.fontColor"
         [style.font-family]="elementModel.styling.font"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.line-height.%]="elementModel.styling.lineHeight"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
      <div class="label">
        {{elementModel.label}}
      </div>
      <div class="inherit-styling"
           [style.display]="'grid'"
           [style.grid-template-columns]="elementModel.firstColumnSizeRatio + 'fr ' +
                                          '1fr '.repeat(elementModel.options.length)">
        <div *ngIf="elementModel.options.length > 0"
             [class.sticky-header]="elementModel.stickyHeader"
             class="inherit-styling"
             [style.grid-column-start]="1"
             [style.grid-column-end]="1"
             [style.grid-row-start]="1"
             [style.grid-row-end]="1">
          {{elementModel.label2}}
        </div>
        <div *ngFor="let option of elementModel.options; let i = index"
             [class.sticky-header]="elementModel.stickyHeader"
             class="inherit-styling"
             [style.grid-column-start]="2 + i"
             [style.grid-column-end]="3 + i"
             [style.grid-row-start]="1"
             [style.grid-row-end]="2">
          <aspect-text-image-panel [label]="option"></aspect-text-image-panel>
        </div>

        <ng-container *ngFor="let row of elementModel.rows; let i = index">
          <aspect-likert-radio-button-group
            [style.background-color]="elementModel.styling.lineColoring && i % 2 === 0 ?
                                      elementModel.styling.lineColoringColor : ''"
            [style.grid-column-start]="1"
            [style.grid-column-end]="elementModel.options.length + 2"
            [style.grid-row-start]="2 + i"
            [style.grid-row-end]="3 + i"
            [style.padding.px]="3"
            [elementModel]="row"
            [firstColumnSizeRatio]="elementModel.firstColumnSizeRatio"
            [parentForm]="parentForm">
          </aspect-likert-radio-button-group>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .wrapper {
      width: 100%;
      height: 100%;
    }
    .sticky-header {
      position: sticky;
      z-index: 1;
      top: 0;
    }
    .inherit-styling {
      background-color: inherit;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      font-weight: inherit;
      font-style: inherit;
      text-decoration: inherit;
    }
    .label {
      margin-bottom: 10px;
    }
  `]
})
export class LikertComponent extends CompoundElementComponent {
  @ViewChildren(LikertRadioButtonGroupComponent) compoundChildren!: QueryList<LikertRadioButtonGroupComponent>;
  @Input() elementModel!: LikertElement;

  getFormElementChildrenComponents(): ElementComponent[] {
    return this.compoundChildren.toArray();
  }
}
