import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UnitPage, UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';

@Component({
  selector: 'app-page-canvas',
  templateUrl: './page-canvas.component.html',
  styles: [
    '.section {position: relative}',
    '.canvasBackground {background-color: lightgrey; padding: 20px; height: 100%; overflow: auto;}',
    '.add-section-button {width: 100%; height: 25px; background-color: #BABABA; margin: 15px 0; border-radius: 10%}',
    '::ng-deep .add-section-button span.mat-button-wrapper {padding: 0}',
    '::ng-deep .add-section-button span.mat-button-wrapper mat-icon {vertical-align: unset}'
  ]
})
export class PageCanvasComponent {
  @Input() page!: UnitPage;
  sectionEditMode: boolean = false;

  constructor(private selectionService: SelectionService, public unitService: UnitService) { }

  elementDropped(event: CdkDragDrop<UnitPageSection>): void {
    const sourceItemModel = event.item.data;

    if (event.previousContainer !== event.container) {
      transferArrayItem(event.previousContainer.data.elements,
        event.container.data.elements,
        event.previousIndex,
        event.currentIndex);
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

  toggleSectionEditMode(event: MatSlideToggleChange): void {
    this.sectionEditMode = event.checked;
  }

  addSection(index: number | null = null): void {
    this.unitService.addSection(this.page, index);
  }

  deleteSection(index: number): void {
    this.unitService.deleteSection(this.page.sections[index]);
  }

  sectionDrop(event: CdkDragDrop<UnitPageSection[]>): void {
    moveItemInArray(this.page.sections, event.previousIndex, event.currentIndex);
    this.unitService.setPageSections(this.page, this.page.sections);
  }
}
