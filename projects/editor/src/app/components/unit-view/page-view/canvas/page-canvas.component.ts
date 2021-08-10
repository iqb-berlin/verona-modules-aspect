import {
  Component, Input, QueryList, ViewChildren
} from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { UnitPage, UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { CanvasSectionComponent } from './canvas-section.component';

@Component({
  selector: 'app-page-canvas',
  templateUrl: './page-canvas.component.html',
  styles: [
    '.section {position: relative}',
    '.canvasBackground {background-color: lightgrey; padding:20px; height: 100%; overflow: auto;}'
  ]
})
export class PageCanvasComponent {
  @Input() page!: UnitPage;
  @ViewChildren('section_component') canvasSections!: QueryList<CanvasSectionComponent>;

  constructor(public unitService: UnitService) { }

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
      this.unitService.updateSelectedElementProperty('xPosition', newXPosition);

      let newYPosition = sourceItemModel.yPosition + event.distance.y;
      if (newYPosition < 0) {
        newYPosition = 0;
      }
      if (newYPosition > this.getPageHeight() - sourceItemModel.height) {
        newYPosition = this.getPageHeight() - sourceItemModel.height;
      }
      this.unitService.updateSelectedElementProperty('yPosition', newYPosition);
    }
  }

  getPageHeight(): number { // TODO weg
    const reduceFct = (accumulator: number, currentValue: UnitPageSection) => accumulator + currentValue.height;
    return this.page.sections.reduce(reduceFct, 0);
  }
}
