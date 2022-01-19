import {
  Component, QueryList, ViewChildren
} from '@angular/core';
import { LikertElement } from './likert-element';
import { LikertElementRow } from './likert-element-row';
import { LikertRadioButtonGroupComponent } from './likert-radio-button-group.component';
import { CompoundElementComponent } from '../../directives/compound-element.directive';
import { ElementComponent } from '../../directives/element-component.directive';

@Component({
  selector: 'app-likert',
  template: `
    <div *ngIf="elementModel.rows.length === 0 && elementModel.columns.length === 0">
      Keine Zeilen oder Spalten vorhanden
    </div>
    <div [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                 elementModel.positionProps.fixedSize"
         [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
         [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : '100%'">
    <div class="mat-typography"
         [style.display]="'grid'"
         [style.grid-template-columns]="elementModel.firstColumnSizeRatio + 'fr ' +
                                        '1fr '.repeat(elementModel.columns.length)"
         [style.background-color]="elementModel.surfaceProps.backgroundColor"
         [style.color]="elementModel.fontProps.fontColor"
         [style.font-family]="elementModel.fontProps.font"
         [style.font-size.px]="elementModel.fontProps.fontSize"
         [style.line-height.%]="elementModel.fontProps.lineHeight"
         [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
         [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <div *ngFor="let column of elementModel.columns; let i = index"
             class="columns" fxLayout="column" fxLayoutAlign="end center"
             [style.grid-column-start]="2 + i"
             [style.grid-column-end]="3 + i"
             [style.grid-row-start]="1"
             [style.grid-row-end]="2">
          <img *ngIf="column.imgSrc && column.position === 'above'"
               [src]="column.imgSrc | safeResourceUrl" alt="Image Placeholder"
               [style.object-fit]="'scale-down'">
          {{column.text}}
          <img *ngIf="column.imgSrc && column.position === 'below'"
               [src]="column.imgSrc | safeResourceUrl" alt="Image Placeholder"
               [style.object-fit]="'scale-down'">
        </div>

      <ng-container *ngFor="let row of elementModel.rows; let i = index">
        <app-likert-radio-button-group
            [style.background-color]="elementModel.lineColoring && i % 2 === 0 ? elementModel.lineColoringColor : ''"
            [style.grid-column-start]="1"
            [style.grid-column-end]="elementModel.columns.length + 2"
            [style.grid-row-start]="2 + i"
            [style.grid-row-end]="3 + i"
            [style.padding.px]="3"
            [elementModel]="row"
            [firstColumnSizeRatio]="elementModel.firstColumnSizeRatio"
            [parentForm]="parentForm"
            (elementValueChanged)="elementValueChanged.emit($event)">
        </app-likert-radio-button-group>
      </ng-container>
    </div>
    </div>
  `,
  styles: [
    'img {object-fit: contain; max-height: 100%; max-width: 100%; margin: 10px}',
    '.columns {text-align: center;}',
    '::ng-deep app-likert mat-radio-button span.mat-radio-container {left: calc(50% - 10px)}'
  ]
})
export class LikertComponent extends CompoundElementComponent {
  @ViewChildren(LikertRadioButtonGroupComponent) compoundChildren!: QueryList<LikertRadioButtonGroupComponent>;
  elementModel!: LikertElement;

  getFormElementModelChildren(): LikertElementRow[] {
    return this.elementModel.rows;
  }

  getFormElementChildrenComponents(): ElementComponent[] {
    return this.compoundChildren.toArray();
  }
}
