import {
  Component, Input, Output, EventEmitter,
  ViewChildren, QueryList, ViewChild, OnInit
} from '@angular/core';
import { Section } from 'common/models/section';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { CanvasElementOverlay } from 'editor/src/app/components/unit-view/element-overlay/canvas-element-overlay';
import { DynamicSectionHelperGridComponent } from './dynamic-section-helper-grid.component';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MeasurePipe } from 'common/pipes/measure.pipe';
import {
  DynamicCanvasOverlayComponent
} from 'editor/src/app/components/unit-view/element-overlay/dynamic-canvas-overlay.component';
import { CdkDropList } from '@angular/cdk/drag-drop';
import {
  ElementGridChangeListenerDirective
} from 'editor/src/app/components/unit-view/section/element-grid-change-listener.directive';

@Component({
  selector: 'aspect-section-dynamic',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    MeasurePipe,
    DynamicSectionHelperGridComponent,
    DynamicCanvasOverlayComponent,
    NgForOf,
    CdkDropList,
    ElementGridChangeListenerDirective
  ],
  template: `
    <div [style.display]="'grid'"
         [style.grid-template-columns]="section.autoColumnSize ? '' : section.gridColumnSizes | measure"
         [style.grid-template-rows]="section.autoRowSize ? '' : section.gridRowSizes | measure"
         [style.grid-auto-columns]="'auto'"
         [style.grid-auto-rows]="'auto'"
         [style.border]="isSelected ? '2px solid #ff4081': '1px dotted'"
         [style.min-height.px]="section.autoRowSize ? 50 : null"
         [style.height.px]="section.autoRowSize ? null : section.height"
         [style.background-color]="section.backgroundColor"
         app-dynamic-section-helper-grid
         [autoColumnSize]="section.autoColumnSize"
         [autoRowSize]="section.autoRowSize"
         [gridColumnSizes]="section.gridColumnSizes"
         [gridRowSizes]="section.gridRowSizes"
         [section]="section"
         [sectionIndex]="sectionIndex"
         [style.isolation]="'isolate'"
         (transferElement)="transferElement.emit($event)">

      <!-- Angular content projection is used in the helper grid component, where the following
           is the content.-->
      <aspect-dynamic-canvas-overlay *ngFor="let element of section.elements"
                                     #elementComponent
                                     [style.z-index]="element.position.zIndex"
                                     [element]="$any(element)"
                                     [style.margin-left]="[element.position.marginLeft] | measure"
                                     [style.margin-right]="[element.position.marginRight] | measure"
                                     [style.margin-top]="[element.position.marginTop] | measure"
                                     [style.margin-bottom]="[element.position.marginBottom] | measure"
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
                                     [style.pointer-events]="dragNDropService.isDragInProgress &&
                                                             element.type == 'frame' ?
                                                             'none' : 'auto'"
                                     appElementGridChangeListener
                                     [gridColumn]="element.position.gridColumn"
                                     [gridColumnRange]="element.position.gridColumnRange"
                                     [gridRow]="element.position.gridRow"
                                     [gridRowRange]="element.position.gridRowRange"
                                     [style.align-items]="'baseline'"
                                     (elementSelected)="elementSelected.emit()"
                                     (elementChanged)="helperGrid && helperGrid.refresh()">
      </aspect-dynamic-canvas-overlay>
    </div>
  `,
  styles: `

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

  constructor(protected dragNDropService: DragNDropService) { }
}
