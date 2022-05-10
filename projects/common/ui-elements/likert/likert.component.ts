import {
  Component, Input, QueryList, ViewChildren
} from '@angular/core';
import { LikertRadioButtonGroupComponent } from './likert-radio-button-group.component';
import { CompoundElementComponent } from '../../directives/compound-element.directive';
import { ElementComponent } from '../../directives/element-component.directive';
import { LikertElement } from 'common/ui-elements/likert/likert';
import { LikertRowElement } from 'common/ui-elements/likert/likert-row';

@Component({
  selector: 'aspect-likert',
  template: `
    <div *ngIf="elementModel.rows.length === 0 && elementModel.columns.length === 0">
      Keine Zeilen oder Spalten vorhanden
    </div>
    <div [style.width.%]="100"
         [style.height.%]="100">
      <div class="mat-typography"
           [style.display]="'grid'"
           [style.grid-template-columns]="elementModel.firstColumnSizeRatio + 'fr ' +
                                    '1fr '.repeat(elementModel.columns.length)"
           [style.background-color]="elementModel.styling.backgroundColor"
           [style.color]="elementModel.styling.fontColor"
           [style.font-family]="elementModel.styling.font"
           [style.font-size.px]="elementModel.styling.fontSize"
           [style.line-height.%]="elementModel.styling.lineHeight"
           [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
        <div *ngFor="let column of elementModel.columns; let i = index"
             class="columns" fxLayout="column" fxLayoutAlign="end center"
             [style.grid-column-start]="2 + i"
             [style.grid-column-end]="3 + i"
             [style.grid-row-start]="1"
             [style.grid-row-end]="2">
          <img *ngIf="column.imgSrc && column.position === 'above'"
               [src]="column.imgSrc | safeResourceUrl" alt="Image Placeholder"
               [style.object-fit]="'scale-down'">
          <div [innerHTML]="sanitizer.bypassSecurityTrustHtml(column.text)"></div>
          <img *ngIf="column.imgSrc && column.position === 'below'"
               [src]="column.imgSrc | safeResourceUrl" alt="Image Placeholder"
               [style.object-fit]="'scale-down'">
        </div>

        <ng-container *ngFor="let row of elementModel.rows; let i = index">
          <aspect-likert-radio-button-group
            [style.background-color]="elementModel.styling.lineColoring && i % 2 === 0 ?
                                      elementModel.styling.lineColoringColor : ''"
            [style.grid-column-start]="1"
            [style.grid-column-end]="elementModel.columns.length + 2"
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
  styles: [
    'img {object-fit: contain; max-height: 100%; max-width: 100%; margin: 10px}',
    '.columns {text-align: center;}',
    ':host ::ng-deep mat-radio-button span.mat-radio-container {left: calc(50% - 10px)}'
  ]
})
export class LikertComponent extends CompoundElementComponent {
  @ViewChildren(LikertRadioButtonGroupComponent) compoundChildren!: QueryList<LikertRadioButtonGroupComponent>;
  @Input() elementModel!: LikertElement;

  getFormElementModelChildren(): LikertRowElement[] {
    return this.elementModel.rows;
  }

  getFormElementChildrenComponents(): ElementComponent[] {
    return this.compoundChildren.toArray();
  }
}
