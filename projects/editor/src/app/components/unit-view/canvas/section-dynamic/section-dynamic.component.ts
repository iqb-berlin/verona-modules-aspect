import {
  Component, Input, Output, EventEmitter,
  ViewChildren, QueryList, ViewChild, OnInit
} from '@angular/core';
import { Section } from 'common/models/section';
import { SectionCounter } from 'common/util/section-counter';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { CanvasElementOverlay } from '../canvas-element-overlay';
import { DynamicSectionHelperGridComponent } from './dynamic-section-helper-grid.component';

@Component({
  selector: 'aspect-section-dynamic',
  template: `
    <div class="section-wrapper"
         [ngClass]="unitService.unit.sectionNumberingPosition === 'left' ? 'row-align' : 'column-align'">
      <div *ngIf="unitService.unit.enableSectionNumbering" [style.min-width.px]="35" [style.font-size.px]="20">
        <b *ngIf="sectionCounter">{{sectionCounter}}.</b>
      </div>
      <div [style.display]="'grid'"
           [style.flex-grow]="1"
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
    </div>
  `,
  styles: `
    .section-wrapper {display: flex;}
    .section-wrapper.row-align {flex-direction: row; align-items: baseline;}
    .section-wrapper.column-align {flex-direction: column;}
  `
})
export class SectionDynamicComponent implements OnInit {
  @Input() section!: Section;
  @Input() sectionIndex!: number;
  @Input() dropListList!: string[];
  @Input() isSelected!: boolean;
  @Input() ignoreSectionCounter: boolean = true;
  @Output() transferElement = new EventEmitter<{ previousSectionIndex: number, newSectionIndex: number }>();
  @Output() elementSelected = new EventEmitter();

  @ViewChild(DynamicSectionHelperGridComponent) helperGrid!: DynamicSectionHelperGridComponent;
  @ViewChildren('elementComponent') childElementComponents!: QueryList<CanvasElementOverlay>;

  sectionCounter: number | undefined;

  constructor(protected dragNDropService: DragNDropService, protected unitService: UnitService) { }

  ngOnInit(): void {
    this.updateSectionCounter();
  }

  updateSectionCounter(): void {
    this.sectionCounter = undefined;
    if (!this.ignoreSectionCounter) this.sectionCounter = SectionCounter.getNext();
  }
}
