import {
  Component, OnInit, OnDestroy,
  Input, QueryList, ViewChildren
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { UnitPage, UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { CanvasSectionComponent } from './canvas-section.component';
import { CanvasDragOverlayComponent } from './canvas-drag-overlay.component';

@Component({
  selector: 'app-page-canvas',
  templateUrl: './page-canvas.component.html',
  styles: [
    '.canvasFrame {background-color: lightgrey; height: 69vh; overflow: auto; width: 100%}',
    '.section {position: relative;}'
  ]
})
export class PageCanvasComponent implements OnInit, OnDestroy {
  @Input() pageIndex!: number;
  @ViewChildren('section_component') canvasSections!: QueryList<CanvasSectionComponent>;
  page!: UnitPage;
  sectionEditMode: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.unitService.getPageObservable(this.pageIndex)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((page: UnitPage) => {
        this.page = page;
      });
  }

  selectSection(id: number): void {
    this.unitService.updatePageSectionSelection(Number(id));
  }

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
      if (newXPosition > event.container.data.width - sourceItemModel.width) {
        newXPosition = event.container.data.width - sourceItemModel.width;
      }
      this.unitService.updateElementProperty(sourceItemModel, 'xPosition', newXPosition);

      let newYPosition = sourceItemModel.yPosition + event.distance.y;
      if (newYPosition < 0) {
        newYPosition = 0;
      }
      if (newYPosition > this.getPageHeight() - sourceItemModel.height) {
        newYPosition = this.getPageHeight() - sourceItemModel.height;
      }
      this.unitService.updateElementProperty(sourceItemModel, 'yPosition', newYPosition);
    }
  }

  dropSection(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.page.sections, event.previousIndex, event.currentIndex);
    this.unitService.updatePageSectionSelection(0);
  }

  getPageHeight(): number { // TODO weg
    const reduceFct = (accumulator: number, currentValue: UnitPageSection) => accumulator + currentValue.height;
    return this.page.sections.reduce(reduceFct, 0);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
