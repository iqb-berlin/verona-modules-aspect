import {
  Component, Input, QueryList, ViewChildren
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PositionedUIElement, UIElement } from 'common/models/elements/element';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { UnitService } from '../../services/unit-services/unit.service';
import { SelectionService } from '../../services/selection.service';
import { CanvasElementOverlay } from './overlays/canvas-element-overlay';
import { SectionStaticComponent } from './section-static.component';
import { SectionDynamicComponent } from './section-dynamic.component';
import { SectionService } from 'editor/src/app/services/unit-services/section.service';

@Component({
  selector: 'aspect-page-canvas',
  templateUrl: './canvas.component.html',
  styles: [`
    .canvasBackground {
      background-color: lightgrey;
      padding: 20px 50px;
      height: 100%;
      overflow: auto;
    }
    .add-section-icon{
      font-size: 24px;
      color: white;
      margin-top: -5px;
    }
    .add-section-button {
      width: 100%;
      height: 25px;
      background-color: #BABABA;
      margin-top: 10px;
    }
    .hidden {
      display: none !important;
    }
  `]
  })
export class CanvasComponent {
  @Input() page!: Page;
  @ViewChildren('sectionComponent')
    sectionComponents!: QueryList<SectionStaticComponent | SectionDynamicComponent>;

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              public sectionService: SectionService) { }

  moveElementsBetweenSections(elements: UIElement[], previousSectionIndex: number, newSectionIndex: number): void {
    this.sectionService.transferElement(elements,
      this.page.sections[previousSectionIndex],
      this.page.sections[newSectionIndex]);
  }

  elementDropped(event: CdkDragDrop<{ sectionIndex: number; gridCoordinates?: number[]; }>): void {
    const selectedElements = this.selectionService.getSelectedElements() as PositionedUIElement[];

    if (event.previousContainer !== event.container) {
      this.moveElementsBetweenSections(selectedElements,
        event.previousContainer.data.sectionIndex,
        event.container.data.sectionIndex);
    } else {
      selectedElements.forEach((element: PositionedUIElement) => {
        let newXPosition = element.position.xPosition + event.distance.x;
        if (newXPosition < 0) {
          newXPosition = 0;
        }
        if (this.page.hasMaxWidth && newXPosition > this.page.maxWidth - element.dimensions.width) {
          newXPosition = this.page.maxWidth - element.dimensions.width;
        }
        this.unitService.updateElementsPositionProperty([element], 'xPosition', newXPosition);

        let newYPosition = element.position.yPosition + event.distance.y;
        if (newYPosition < 0) {
          newYPosition = 0;
        }
        if (newYPosition > this.getPageHeight() - element.dimensions.height) {
          newYPosition = this.getPageHeight() - element.dimensions.height;
        }
        this.unitService.updateElementsPositionProperty([element], 'yPosition', newYPosition);
      });
    }
  }

  getPageHeight(): number { // TODO weg
    const reduceFct = (accumulator: number, currentValue: Section) => accumulator + currentValue.height;
    return this.page.sections.reduce(reduceFct, 0);
  }

  addSection(): void {
    this.sectionService.addSection(this.page);
    this.selectionService.selectedPageSectionIndex = this.page.sections.length - 1;
  }

  selectElementOverlay(element: UIElement): void {
    const elementComponent = this.getElementOverlay(element);
    if (elementComponent) {
      this.selectionService.selectElement({ elementComponent: elementComponent, multiSelect: false });
    } else {
      throw Error('Element not found. This is a bug!');
    }
  }

  private getElementOverlay(element: UIElement): CanvasElementOverlay | null {
    for (const sectionComponent of this.sectionComponents.toArray()) {
      for (const elementComponent of sectionComponent.childElementComponents.toArray()) {
        if (elementComponent.element.id === element.id) {
          return elementComponent;
        }
      }
    }
    return null;
  }
}
