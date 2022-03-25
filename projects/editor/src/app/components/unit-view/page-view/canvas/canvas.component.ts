import {
  Component, Input, QueryList, ViewChildren
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { UnitService } from '../../../../services/unit.service';
import { SelectionService } from '../../../../services/selection.service';
import { CanvasElementOverlay } from './overlays/canvas-element-overlay';
import { SectionStaticComponent } from './section-static.component';
import { SectionDynamicComponent } from './section-dynamic.component';
import { Page, Section } from '../../../../../../../common/interfaces/unit';
import { PositionedElement, UIElement } from '../../../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-page-canvas',
  templateUrl: './canvas.component.html',
  styles: [
    '.canvasBackground {background-color: lightgrey; padding: 20px 50px; height: 100%; overflow: auto;}',
    '.add-section-button {width: 100%; height: 25px; background-color: #BABABA; margin-top: 10px; border-radius: 10%}',
    '::ng-deep .add-section-button span.mat-button-wrapper {padding: 0}',
    '::ng-deep .add-section-button span.mat-button-wrapper mat-icon {vertical-align: unset}',
    '.section-menu {opacity:0; transition: opacity 0.5s linear; transition-delay:0.3s;}',
    '.section-menu.open {opacity:1; transition-delay:0s;}'
  ]
})
export class CanvasComponent {
  @Input() page!: Page;
  hoveredSection: number = -1;

  @ViewChildren('sectionComponent')
  childSectionComponents!: QueryList<SectionStaticComponent | SectionDynamicComponent>;

  constructor(public selectionService: SelectionService, public unitService: UnitService) { }

  moveElementsBetweenSections(elements: UIElement[], previousSectionIndex: number, newSectionIndex: number): void {
    this.unitService.transferElement(elements,
      this.page.sections[previousSectionIndex],
      this.page.sections[newSectionIndex]);
  }

  elementDropped(event: CdkDragDrop<{ sectionIndex: number; gridCoordinates?: number[]; }>): void {
    const selectedElements = this.selectionService.getSelectedElements() as PositionedElement[];

    if (event.previousContainer !== event.container) {
      this.moveElementsBetweenSections(selectedElements,
        event.previousContainer.data.sectionIndex,
        event.container.data.sectionIndex);
    } else {
      selectedElements.forEach((element: PositionedElement) => {
        let newXPosition = element.position.xPosition + event.distance.x;
        if (newXPosition < 0) {
          newXPosition = 0;
        }
        if (this.page.hasMaxWidth && newXPosition > this.page.maxWidth - element.width) {
          newXPosition = this.page.maxWidth - element.width;
        }
        this.unitService.updateElementProperty([element], 'xPosition', newXPosition);

        let newYPosition = element.position.yPosition + event.distance.y;
        if (newYPosition < 0) {
          newYPosition = 0;
        }
        if (newYPosition > this.getPageHeight() - element.height) {
          newYPosition = this.getPageHeight() - element.height;
        }
        this.unitService.updateElementProperty([element], 'yPosition', newYPosition);
      });
    }
  }

  getPageHeight(): number { // TODO weg
    const reduceFct = (accumulator: number, currentValue: Section) => accumulator + currentValue.height;
    return this.page.sections.reduce(reduceFct, 0);
  }

  addSection(): void {
    this.unitService.addSection(this.page);
    this.selectionService.selectedPageSectionIndex = this.page.sections.length - 1;
  }

  selectElementComponent(element: UIElement): void {
    const elementComponent = this.getElementComponent(element);
    if (elementComponent) {
      this.selectionService.selectElement({ elementComponent: elementComponent, multiSelect: false });
    } else {
      throw Error('Element not found. This is a bug!');
    }
  }

  private getElementComponent(element: UIElement): CanvasElementOverlay | null {
    for (const sectionComponent of this.childSectionComponents.toArray()) {
      for (const elementComponent of sectionComponent.childElementComponents.toArray()) {
        if (elementComponent.element.id === element.id) {
          return elementComponent;
        }
      }
    }
    return null;
  }
}
