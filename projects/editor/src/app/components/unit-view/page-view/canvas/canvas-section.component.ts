import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';

@Component({
  selector: '[app-canvas-section]',
  template: `
    <div class="section-wrapper"
         [style.border]="selected ? '1px solid': '1px dotted'"
         [style.width.px]="section.width"
         [style.height.px]="section.height"
         [style.background-color]="section.backgroundColor"
         (click)="this.unitService.selectSection(this)">
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
            <div [style.grid-column-start]="x + 1"
                 [style.grid-column-end]="x + 1"
                 [style.grid-row-start]="y + 1"
                 [style.grid-row-end]="y + 1"
                 [style.border]="'25px inset'"
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

      <div class="sectionMenu" fxLayout="column">
        <button mat-mini-fab color="accent"
                (click)="unitService.moveSection(sectionIndex, 'up')">
          <mat-icon inline>arrow_upward</mat-icon>
        </button>
        <button mat-mini-fab color="accent"
                (click)="unitService.moveSection(sectionIndex, 'down')">
          <mat-icon inline>arrow_downward</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    '.sectionMenu {visibility: hidden; transition: 0.2s 0.7s;}',
    '.section-wrapper:hover .sectionMenu {visibility: visible; transition-delay: 0s;}',
    '.sectionMenu {position: absolute; left: -29px; top: 0}',
    '.sectionMenu button {width: 28px; height: 28px}',
    '.sectionMenu .mat-mini-fab {line-height: 0;}',
    '::ng-deep .sectionMenu .mat-mini-fab .mat-button-wrapper {line-height: 0;}'
  ]
})
export class CanvasSectionComponent implements OnInit {
  @Input() section!: UnitPageSection;
  @Input() sectionIndex!: number;
  selected = true;
  dragging = false;
  draggingElementWidth: number | undefined = 0;
  draggingElementHeight: number | undefined = 0;

  constructor(public unitService: UnitService) {
    this.unitService.selectSection(this);
  }

  ngOnInit(): void {
    this.unitService.selectSection(this);
  }

  drop(event: CdkDragDrop<number[]>): void {
    if (event.item.data.dragType === 'move') {
      this.unitService.updateSelectedElementProperty('gridColumnStart', event.container.data[0]);
      // Ensure the end value is at least the same as the start, otherwise the grid breaks
      this.unitService.updateSelectedElementProperty(
        'gridColumnEnd', Math.max(event.item.data.element.gridColumnEnd, event.container.data[0])
      );
      this.unitService.updateSelectedElementProperty('gridRowStart', event.container.data[1]);
      this.unitService.updateSelectedElementProperty(
        'gridRowEnd', Math.max(event.item.data.element.gridRowEnd, event.container.data[1])
      );
    } else { // resize
      this.unitService.updateSelectedElementProperty('gridColumnEnd', event.container.data[0] + 1);
      this.unitService.updateSelectedElementProperty('gridRowEnd', event.container.data[1] + 1);
    }
  }

  resizeOverlay(event: { dragging: boolean, elementWidth?: number, elementHeight?: number }): void {
    this.dragging = event.dragging;
    this.draggingElementWidth = event.elementWidth;
    this.draggingElementHeight = event.elementHeight;
  }
}
