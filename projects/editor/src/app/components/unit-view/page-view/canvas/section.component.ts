import { Component, Input } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';

@Component({
  selector: '[app-canvas-section]',
  template: `
    <div *ngIf="!sectionEditMode"
         #sectionElement class="section-wrapper"
         [style.border]="selected ? '1px solid': '1px dotted'"
         [style.height.px]="section.height"
         [style.background-color]="section.backgroundColor"
         (click)="selectionService.selectSection(this)">
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

        <ng-container *ngFor="let column of this.section.gridColumnSizes.split(' '); let x = index">
          <ng-container *ngFor="let row of this.section.gridRowSizes.split(' '); let y = index">
            <div class="grid-placeholder"
                 [style.grid-column-start]="x + 1"
                 [style.grid-column-end]="x + 1"
                 [style.grid-row-start]="y + 1"
                 [style.grid-row-end]="y + 1"
                 cdkDropList [cdkDropListData]="[x + 1, y + 1]" (cdkDropListDropped)="drop($event)">
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
  selected = true;
  dragging = false;
  draggingElementWidth: number | undefined = 0;
  draggingElementHeight: number | undefined = 0;

  constructor(public selectionService: SelectionService, public unitService: UnitService) { }

  drop(event: CdkDragDrop<number[]>): void {
    if (event.item.data.dragType === 'move') {
      this.unitService.updateElementProperty(
        this.selectionService.getSelectedElements(),
        'gridColumnStart', event.container.data[0]
      );
      // Ensure the end value is at least the same as the start, otherwise the grid breaks
      this.unitService.updateElementProperty(
        this.selectionService.getSelectedElements(),
        'gridColumnEnd', Math.max(event.item.data.element.gridColumnEnd, event.container.data[0])
      );
      this.unitService.updateElementProperty(
        this.selectionService.getSelectedElements(),
        'gridRowStart', event.container.data[1]
      );
      this.unitService.updateElementProperty(
        this.selectionService.getSelectedElements(),
        'gridRowEnd', Math.max(event.item.data.element.gridRowEnd, event.container.data[1])
      );
    } else { // resize
      this.unitService.updateElementProperty(
        this.selectionService.getSelectedElements(),
        'gridColumnEnd', event.container.data[0] + 1
      );
      this.unitService.updateElementProperty(
        this.selectionService.getSelectedElements(),
        'gridRowEnd', event.container.data[1] + 1
      );
    }
  }

  resizeOverlay(event: { dragging: boolean, elementWidth?: number, elementHeight?: number }): void {
    this.dragging = event.dragging;
    this.draggingElementWidth = event.elementWidth;
    this.draggingElementHeight = event.elementHeight;
  }
}
