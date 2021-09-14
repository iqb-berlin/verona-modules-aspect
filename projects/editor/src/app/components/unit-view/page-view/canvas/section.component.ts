import {
  Component, Input, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { UnitPageSection, UnitUIElement } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';
import { DragItemData, DropListData } from './page-canvas.component';

@Component({
  selector: '[app-canvas-section]',
  template: `
    <div *ngIf="!sectionEditMode"
         #sectionElement class="section-wrapper"
         [style.border]="selected ? '1px solid': '1px dotted'"
         [style.height.px]="section.height"
         [style.background-color]="section.backgroundColor"
         (click)="selectionService.selectSection(this)"
         (dragover)="$event.preventDefault()" (drop)="newElementDropped($event)">
      <div *ngIf="!section.dynamicPositioning">
        <app-static-canvas-overlay
          *ngFor="let element of section.elements"
          [element]="$any(element)">
        </app-static-canvas-overlay>
      </div>

      <div *ngIf="section.dynamicPositioning"
           [style.display]="'grid'"
           [style.grid-template-columns]="section.gridColumnSizes"
           [style.grid-template-rows]="section.gridRowSizes"
           [style.height.%]="100"
           cdkDropListGroup>

        <!-- Dynamic sections have the droplists for the grid cells next to the actual elements. Elements can not
             be children of the grid cells because they can span over multiple cells. -->
        <ng-container *ngFor="let column of this.section.gridColumnSizes.split(' '); let x = index">
          <ng-container *ngFor="let row of this.section.gridRowSizes.split(' '); let y = index">
            <div class="grid-placeholder"
                 [style.grid-column-start]="x + 1"
                 [style.grid-column-end]="x + 1"
                 [style.grid-row-start]="y + 1"
                 [style.grid-row-end]="y + 1"
                 cdkDropList [cdkDropListData]="{ sectionIndex: sectionIndex, gridCoordinates: [x + 1, y + 1] }"
                 (cdkDropListDropped)="drop($any($event))"
                 id="list-{{sectionIndex}}-{{x+1}}-{{y+1}}">
              {{x + 1}} / {{y + 1}}
            </div>
          </ng-container>
        </ng-container>

        <app-dynamic-canvas-overlay *ngFor="let element of section.elements"
                                    [element]="$any(element)"
                                    [style.min-width.px]="element.width"
                                    [style.min-height.px]="element.height"
                                    [style.margin-left.px]="element.marginLeft"
                                    [style.margin-right.px]="element.marginRight"
                                    [style.margin-top.px]="element.marginTop"
                                    [style.margin-bottom.px]="element.marginBottom"
                                    [style.grid-column-start]="element.gridColumnStart"
                                    [style.grid-column-end]="element.gridColumnEnd"
                                    [style.grid-row-start]="element.gridRowStart"
                                    [style.grid-row-end]="element.gridRowEnd"
                                    cdkDropList cdkDropListSortingDisabled
                                    [cdkDropListData]="{ sectionIndex: sectionIndex }"
                                    [cdkDropListConnectedTo]="dropListList"
                                    (resize)="resizeOverlay($event)"
                                    [style.pointer-events]="dragging ? 'none' : 'auto'"
                                    [style.position]="dragging ? 'absolute' : null"
                                    [style.width.px]="dragging ? draggingElementWidth : null"
                                    [style.height.px]="dragging ? draggingElementHeight : null">
        </app-dynamic-canvas-overlay>
      </div>
    </div>

    <div *ngIf="sectionEditMode"
         #sectionElement class="section-wrapper"
         [style.border]="selected ? '1px solid': '1px dotted'"
         [style.height.px]="section.height"
         [style.background-color]="section.backgroundColor"
         (click)="selectionService.selectSection(this)">
      <div *ngIf="!section.dynamicPositioning">
        <app-view-only-element-overlay *ngFor="let element of section.elements" [element]="$any(element)">
        </app-view-only-element-overlay>
      </div>

      <div *ngIf="section.dynamicPositioning"
           [style.display]="'grid'"
           [style.grid-template-columns]="section.gridColumnSizes"
           [style.grid-template-rows]="section.gridRowSizes"
           [style.height.%]="100">
        <app-dynamic-view-only-element-overlay *ngFor="let element of section.elements"
                                               [element]="$any(element)"
                                               [style.min-width.px]="element.width"
                                               [style.min-height.px]="element.height"
                                               [style.margin-left.px]="element.marginLeft"
                                               [style.margin-right.px]="element.marginRight"
                                               [style.margin-top.px]="element.marginTop"
                                               [style.margin-bottom.px]="element.marginBottom"
                                               [style.grid-column-start]="element.gridColumnStart"
                                               [style.grid-column-end]="element.gridColumnEnd"
                                               [style.grid-row-start]="element.gridRowStart"
                                               [style.grid-row-end]="element.gridRowEnd">
        </app-dynamic-view-only-element-overlay>
      </div>

    </div>
  `,
  styles: [
    '.section-wrapper {width: 100%}',
    '.grid-placeholder {border: 25px inset aliceblue; text-align: center;}'
  ]
})
export class SectionComponent {
  @Input() section!: UnitPageSection;
  @Input() sectionEditMode: boolean = false;
  @Input() sectionIndex!: number;
  @Input() dropListList!: string[];
  @Output() transferElement = new EventEmitter<{ element: UnitUIElement,
    previousSectionIndex: number,
    newSectionIndex: number }>();

  @ViewChild('sectionElement') sectionElement!: ElementRef;
  selected = true;
  dragging = false;
  draggingElementWidth: number | undefined = 0;
  draggingElementHeight: number | undefined = 0;

  constructor(public selectionService: SelectionService, public unitService: UnitService) { }

  drop(event: CdkDragDrop<DropListData>): void {
    const dragItemData: DragItemData = event.item.data;

    // Move element to other section - handled by parent (page-canvas).
    if (event.previousContainer.data.sectionIndex !== event.container.data.sectionIndex) {
      this.transferElement.emit({
        element: event.item.data.element,
        previousSectionIndex: event.previousContainer.data.sectionIndex,
        newSectionIndex: event.container.data.sectionIndex
      });
    }
    if (dragItemData.dragType === 'move') {
      this.unitService.updateElementProperty(
        [event.item.data.element],
        'gridColumnStart', event.container.data.gridCoordinates![0]
      );
      // Ensure the end value is at least the same as the start, otherwise the grid breaks.
      this.unitService.updateElementProperty(
        [dragItemData.element],
        'gridColumnEnd', Math.max(event.item.data.element.gridColumnEnd, event.container.data.gridCoordinates![0])
      );
      this.unitService.updateElementProperty(
        [dragItemData.element],
        'gridRowStart', event.container.data.gridCoordinates![1]
      );
      this.unitService.updateElementProperty(
        [dragItemData.element],
        'gridRowEnd', Math.max(event.item.data.element.gridRowEnd, event.container.data.gridCoordinates![1])
      );
    } else if (event.item.data.dragType === 'resize') {
      this.unitService.updateElementProperty(
        [dragItemData.element],
        'gridColumnEnd', event.container.data.gridCoordinates![0] + 1
      );
      this.unitService.updateElementProperty(
        [dragItemData.element],
        'gridRowEnd', event.container.data.gridCoordinates![1] + 1
      );
    } else {
      throw new Error('Unknown drop event');
    }
  }

  resizeOverlay(event: { dragging: boolean, elementWidth?: number, elementHeight?: number }): void {
    this.dragging = event.dragging;
    this.draggingElementWidth = event.elementWidth;
    this.draggingElementHeight = event.elementHeight;
  }

  newElementDropped(event: DragEvent): void {
    event.preventDefault();
    const sectionRect = this.sectionElement.nativeElement.getBoundingClientRect();
    this.unitService.addElementToSection(
      event.dataTransfer?.getData('elementType') as string,
      this.section,
      { x: event.clientX - Math.round(sectionRect.left), y: event.clientY - Math.round(sectionRect.top) }
    );
  }
}
