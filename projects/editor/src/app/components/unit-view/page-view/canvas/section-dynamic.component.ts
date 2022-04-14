import {
  Component, Input, Output, EventEmitter,
  ViewChildren, QueryList, ViewChild
} from '@angular/core';
import { CanvasElementOverlay } from './overlays/canvas-element-overlay';
import { Section } from 'common/interfaces/unit';
import { DynamicSectionHelperGridComponent } from './dynamic-section-helper-grid.component';

@Component({
  selector: 'aspect-section-dynamic',
  template: `
    <div [style.display]="'grid'"
         [style.grid-template-columns]="section.autoColumnSize ? '' : section.gridColumnSizes"
         [style.grid-template-rows]="section.autoRowSize ? '' : section.gridRowSizes"
         [style.grid-auto-columns]="'auto'"
         [style.grid-auto-rows]="'auto'"
         [style.border]="isSelected ? '2px solid #ff4081': '1px dotted'"
         [style.min-height.px]="section.autoRowSize ? 50 : null"
         [style.height.px]="section.autoRowSize ? dragging ? currentHeight : null : section.height"
         [style.background-color]="section.backgroundColor"
         app-dynamic-section-helper-grid
         [autoColumnSize]="section.autoColumnSize"
         [autoRowSize]="section.autoRowSize"
         [gridColumnSizes]="section.gridColumnSizes"
         [gridRowSizes]="section.gridRowSizes"
         [section]="section"
         [sectionIndex]="sectionIndex"
         (transferElement)="transferElement.emit($event)">

      <!-- Angular content projection is used in the helper grid component, where the following
           is the content.-->
      <aspect-dynamic-canvas-overlay *ngFor="let element of section.elements"
                                     #elementComponent
                                     [element]="$any(element)"
                                     [style.min-width.px]="element.width"
                                     [style.min-height.px]="element.position.useMinHeight ? element.height : null"
                                     [style.margin-left.px]="element.position.marginLeft"
                                     [style.margin-right.px]="element.position.marginRight"
                                     [style.margin-top.px]="element.position.marginTop"
                                     [style.margin-bottom.px]="element.position.marginBottom"
                                     [style.grid-column-start]="element.position.gridColumn"
                                     [style.grid-column-end]="element.position.gridColumn ?
                                       element.position.gridColumn + element.position.gridColumnRange :
                                       null"
                                     [style.grid-row-start]="element.position.gridRow"
                                     [style.grid-row-end]="element.position.gridRow ?
                                       element.position.gridRow + element.position.gridRowRange :
                                       null"
                                     cdkDropList cdkDropListSortingDisabled
                                     [cdkDropListData]="{ sectionIndex: sectionIndex }"
                                     [cdkDropListConnectedTo]="dropListList"
                                     [style.position]="'relative'"
                                     [style.pointer-events]="dragging ? 'none' : 'auto'"
                                     appElementGridChangeListener
                                     [gridColumn]="element.position.gridColumn"
                                     [gridColumnRange]="element.position.gridColumnRange"
                                     [gridRow]="element.position.gridRow"
                                     [gridRowRange]="element.position.gridRowRange"
                                     (elementSelected)="elementSelected.emit()"
                                     (elementChanged)="helperGrid?.refresh()">
      </aspect-dynamic-canvas-overlay>
    </div>
  `
})
export class SectionDynamicComponent {
  @Input() section!: Section;
  @Input() sectionIndex!: number;
  @Input() dropListList!: string[];
  @Input() isSelected!: boolean;
  @Output() transferElement = new EventEmitter<{ previousSectionIndex: number, newSectionIndex: number }>();
  @Output() elementSelected = new EventEmitter();

  @ViewChild(DynamicSectionHelperGridComponent) helperGrid!: DynamicSectionHelperGridComponent;
  @ViewChildren('elementComponent') childElementComponents!: QueryList<CanvasElementOverlay>;

  dragging = false;
  currentHeight: number = 0;
}
