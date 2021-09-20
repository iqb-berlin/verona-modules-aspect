import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitPage, UnitPageSection, UnitUIElement } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';

@Component({
  selector: 'app-page-canvas',
  templateUrl: './page-canvas.component.html',
  styles: [
    '.section {position: relative}',
    '.canvasBackground {background-color: lightgrey; padding: 20px 50px; height: 100%; overflow: auto;}',
    '.add-section-button {width: 100%; height: 25px; background-color: #BABABA; margin: 15px 0; border-radius: 10%}',
    '::ng-deep .add-section-button span.mat-button-wrapper {padding: 0}',
    '::ng-deep .add-section-button span.mat-button-wrapper mat-icon {vertical-align: unset}',
    '.section-menu {opacity:0; transition: opacity 0.5s linear; transition-delay:1s;}',
    '.section-menu.open {opacity:1; transition-delay:0s;}'
  ]
})
export class PageCanvasComponent implements OnInit, OnDestroy {
  @Input() page!: UnitPage;
  dropListList: string[] = [];
  hoveredSection: number = -1;
  private ngUnsubscribe = new Subject<void>();

  constructor(private selectionService: SelectionService, public unitService: UnitService) { }

  ngOnInit(): void {
    this.unitService.unit
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.generateDropListList());
  }

  /*
  To make it work that the section itself can handle drop events, but also have the canvas to handle drops
  when outside of the section, all the allowed dropLists have to be connected. Because the lists are not properly
  nested (see below), this needs to be done manually by IDs.
  This list is given to the necessary dropLists to make it possible to drop items not only into them
  but also any other connected dropLists.

  Dynamic sections have droplists for the grid cells next to the actual elements. Elements can not
  be children of the grid cells because they can span over multiple cells.

  Dynamic sections don't have a general drop area, like static sections. They have grid placeholder elements
  which are droplists. Therefore they have no parent dropList to add to the list but themselves.
  Static elements only have the parent, which is added to the list.

  Resizing in dynamic sections is handled by the section/element-overlays themselves.
   */
  generateDropListList(): void {
    this.dropListList = [];
    this.page.sections.forEach((section: UnitPageSection, index: number) => {
      if (!section.dynamicPositioning) {
        this.dropListList.push(`section-${index}`);
      } else {
        section.gridColumnSizes.split(' ').forEach((columnSize: string, columnIndex: number) => {
          section.gridRowSizes.split(' ').forEach((rowSize: string, rowIndex: number) => {
            this.dropListList.push(`list-${index}-${columnIndex + 1}-${rowIndex + 1}`); // grid starts counting at 1
          });
        });
      }
    });
  }

  moveElementBetweenSections(element: UnitUIElement, previousSectionIndex: number, newSectionIndex: number): void {
    this.unitService.transferElement([element],
      this.page.sections[previousSectionIndex],
      this.page.sections[newSectionIndex]);
  }

  elementDropped(event: CdkDragDrop<DropListData>): void {
    const sourceItemModel = (event.item.data as DragItemData).element;

    if (event.previousContainer !== event.container) {
      this.moveElementBetweenSections(event.item.data.element,
        event.previousContainer.data.sectionIndex,
        event.container.data.sectionIndex);
    } else {
      let newXPosition = sourceItemModel.xPosition + event.distance.x;
      if (newXPosition < 0) {
        newXPosition = 0;
      }
      if (newXPosition > this.page.maxWidth - sourceItemModel.width) {
        newXPosition = this.page.maxWidth - sourceItemModel.width;
      }
      this.unitService.updateElementProperty(this.selectionService.getSelectedElements(), 'xPosition', newXPosition);

      let newYPosition = sourceItemModel.yPosition + event.distance.y;
      if (newYPosition < 0) {
        newYPosition = 0;
      }
      if (newYPosition > this.getPageHeight() - sourceItemModel.height) {
        newYPosition = this.getPageHeight() - sourceItemModel.height;
      }
      this.unitService.updateElementProperty(this.selectionService.getSelectedElements(), 'yPosition', newYPosition);
    }
  }

  getPageHeight(): number { // TODO weg
    const reduceFct = (accumulator: number, currentValue: UnitPageSection) => accumulator + currentValue.height;
    return this.page.sections.reduce(reduceFct, 0);
  }

  addSection(index: number | null = null): void {
    this.unitService.addSection(this.page, index);
    this.selectionService.setSelectedPageSection(this.page.sections[this.page.sections.length - 1]);
  }

  sectionDrop(event: CdkDragDrop<UnitPageSection[]>): void {
    moveItemInArray(this.page.sections, event.previousIndex, event.currentIndex);
    this.unitService.setPageSections(this.page, this.page.sections);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

export interface DragItemData {
  dragType: string;
  element: UnitUIElement;
}

export interface DropListData {
  sectionIndex: number;
  gridCoordinates?: number[];
}
