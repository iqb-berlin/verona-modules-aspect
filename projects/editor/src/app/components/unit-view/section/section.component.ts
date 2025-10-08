import {
  Component, EventEmitter, Input, Output, QueryList, ViewChildren
} from '@angular/core';
import { SectionMenuComponent } from 'editor/src/app/components/unit-view/section/section-menu.component';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';
import { SectionService } from 'editor/src/app/services/unit-services/section.service';
import { Section } from 'common/models/section';
import { UIElement } from 'common/models/elements/element';
import { ElementOverlay } from 'editor/src/app/components/unit-view/element-overlay/element-overlay.directive';
import { StaticSectionComponent } from 'editor/src/app/components/unit-view/section/static-section.component';
import { DynamicSectionComponent } from 'editor/src/app/components/unit-view/section/dynamic-section.component';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { NgClass, NgIf } from '@angular/common';
import { SectionCounter } from 'common/util/section-counter';
import { PositionedUIElement } from 'common/interfaces';

@Component({
    selector: 'aspect-editor-section-view',
    imports: [
        NgIf, NgClass,
        CdkDropList,
        SectionMenuComponent, StaticSectionComponent, DynamicSectionComponent
    ],
    template: `
    <aspect-section-menu [class.hidden]="!isOnSelectedPage || selectionService.selectedSectionIndex !== sectionIndex"
                         class="section-menu fx-column-start-stretch"
                         [style.left.px]="-45" [style.z-index]="1" [style.position]="'absolute'"
                         [section]="section" [sectionIndex]="sectionIndex" [pageIndex]="pageIndex"
                         [lastSectionIndex]="lastSectionIndex"
                         (elementSelected)="selectElement($event)"
                         (elementHovered)="highlightElement($event)"
                         (elementHoverEnd)="removeHighlight()">
    </aspect-section-menu>

    <div class="section-wrapper"
         [ngClass]="unitService.unit.sectionNumberingPosition === 'left' ? 'row-align' : 'column-align'">
      <div *ngIf="unitService.unit.enableSectionNumbering" class="numbering-box">
        <b *ngIf="sectionCounter">{{sectionCounter}}.</b>
      </div>
      <aspect-editor-static-section *ngIf="!section.dynamicPositioning"
                             #sectionComponent
                             class="section" id="section-{{sectionIndex}}"
                             [section]="section"
                             [isSelected]="isOnSelectedPage && selectionService.selectedSectionIndex === sectionIndex"
                             (elementSelected)="selectionService.selectedSectionIndex = sectionIndex"
                             cdkDropList cdkDropListSortingDisabled
                             [cdkDropListData]="{ pageIndex: pageIndex, sectionIndex: sectionIndex }"
                             (cdkDropListDropped)="elementDropped($event)"
                             (click)="selectionService.selectedSectionIndex = sectionIndex">
      </aspect-editor-static-section>
      <aspect-editor-dynamic-section *ngIf="section.dynamicPositioning"
                              #sectionComponent
                              class="section"
                              [section]="section" [sectionIndex]="sectionIndex" [pageIndex]="pageIndex"
                              [isSelected]="isOnSelectedPage &&
                                            selectionService.selectedSectionIndex === sectionIndex"
                              (elementSelected)="selectionService.selectedPageIndex = pageIndex;
                                                 selectionService.selectedSectionIndex = sectionIndex"
                              (transferElement)="moveElementsBetweenSections(selectionService.getSelectedElements(),
                                                                 $event.sourcePageIndex,
                                                                 $event.sourceSectionIndex,
                                                                 $event.targetPageIndex,
                                                                 $event.targetSectionIndex)"
                              (click)="selectionService.selectedSectionIndex = sectionIndex;
                                       sectionSelected.emit(sectionIndex)">
      </aspect-editor-dynamic-section>
    </div>
  `,
    styles: `
    .hidden {
      display: none !important;
    }
    .section-wrapper {display: flex;}
    .section-wrapper.row-align {flex-direction: row;}
    .section-wrapper.column-align {flex-direction: column;}
    .section-wrapper .numbering-box {min-width: 35px; font-size: 20px; padding-top: 1px;}
    .section-wrapper .section {flex-grow: 1;}
  `
})
export class SectionComponent {
  @Input() section!: Section;
  @Input() sectionIndex!: number;
  @Input() lastSectionIndex!: number;
  @Input() alwaysVisiblePage: boolean = false;
  @Input() isOnSelectedPage: boolean = false;
  @Input() pageIndex!: number;
  @Output() sectionSelected = new EventEmitter();

  @ViewChildren('sectionComponent')
    sectionComponents!: QueryList<StaticSectionComponent | DynamicSectionComponent>;

  sectionCounter: number | undefined;
  highlightedElementComponent: ElementOverlay | undefined;

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              public elementService: ElementService,
              public sectionService: SectionService) { }

  updateSectionCounter(): void {
    this.sectionCounter = undefined;
    if (this.unitService.unit.enableSectionNumbering &&
        !this.alwaysVisiblePage &&
        !this.section.ignoreNumbering) {
      this.sectionCounter = SectionCounter.getNext();
    }
  }

  selectElement(elementID: string): void {
    const elementComponent = this.getElementOverlay(elementID);
    this.selectionService.selectElement({ elementComponent: elementComponent, multiSelect: false });
  }

  highlightElement(elementID: string) {
    const elementComponent = this.getElementOverlay(elementID);
    this.highlightedElementComponent = elementComponent;
    elementComponent.highlight();
  }

  removeHighlight(): void {
    this.highlightedElementComponent?.removeHighlight();
  }

  private getElementOverlay(elementID: string): ElementOverlay {
    return this.sectionComponents.toArray()
      .map(sectionComp => sectionComp.childElementComponents.toArray())[0]
      .filter(elComp => elComp.element.id === elementID)[0];
  }

  elementDropped(event: CdkDragDrop<{ pageIndex: number, sectionIndex: number; gridCoordinates?: number[]; }>): void {
    const selectedElements = this.selectionService.getSelectedElements() as PositionedUIElement[];

    if (event.previousContainer !== event.container) {
      this.moveElementsBetweenSections(selectedElements,
        event.previousContainer.data.pageIndex,
        event.previousContainer.data.sectionIndex,
        event.container.data.pageIndex,
        event.container.data.sectionIndex);
    } else {
      const page = this.unitService.getSelectedPage();
      selectedElements.forEach((element: PositionedUIElement) => {
        let newXPosition = element.position.xPosition + event.distance.x;
        if (newXPosition < 0) {
          newXPosition = 0;
        }
        if (page.hasMaxWidth && newXPosition > page.maxWidth - element.dimensions.width) {
          newXPosition = page.maxWidth - element.dimensions.width;
        }
        this.elementService.updateElementsPositionProperty([element], 'xPosition', newXPosition);

        let newYPosition = element.position.yPosition + event.distance.y;
        if (newYPosition < 0) {
          newYPosition = 0;
        }
        if (newYPosition > this.getPageHeight() - element.dimensions.height) {
          newYPosition = this.getPageHeight() - element.dimensions.height;
        }
        this.elementService.updateElementsPositionProperty([element], 'yPosition', newYPosition);
      });
    }
  }

  getPageHeight(): number { // TODO weg
    const page = this.unitService.getSelectedPage();
    const reduceFct = (accumulator: number, currentValue: Section) => accumulator + currentValue.height;
    return page.sections.reduce(reduceFct, 0);
  }

  moveElementsBetweenSections(elements: UIElement[], sourcePageIndex: number, sourceSectionIndex: number,
                              targetPageIndex: number, targetSectionIndex: number): void {
    const sourceSection = this.unitService.unit.pages[sourcePageIndex].sections[sourceSectionIndex];
    const targetSection = this.unitService.unit.pages[targetPageIndex].sections[targetSectionIndex];
    this.sectionService.transferElements(elements, sourceSection, targetSection);
    this.selectionService.selectedPageIndex = targetPageIndex;
    this.selectionService.selectedSectionIndex = targetSectionIndex;
  }
}
